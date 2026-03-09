import { requireSession } from "./_auth.js";
import { badRequest, dbSetupErrorResponse, json, methodNotAllowed, readJson } from "./_utils.js";
import { dbSetupIssue } from "./_db.js";

function validIdentifier(name) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(String(name || ""));
}

function quoteIdentifier(name) {
  if (!validIdentifier(name)) {
    throw new Error(`Invalid identifier: ${name}`);
  }
  return `"${name}"`;
}

function normalizeLimit(value) {
  const n = Number(value || 120);
  if (!Number.isFinite(n)) return 120;
  return Math.min(Math.max(Math.floor(n), 1), 500);
}

function normalizeObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
}

async function listTables(db) {
  const rows = await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
  return (rows.results || []).map((x) => x.name).filter(validIdentifier);
}

async function tableColumns(db, table) {
  const pragma = await db.prepare(`PRAGMA table_info(${quoteIdentifier(table)})`).all();
  return (pragma.results || []).map((x) => ({
    cid: x.cid,
    name: x.name,
    type: x.type,
    notnull: x.notnull,
    dflt_value: x.dflt_value,
    pk: x.pk
  }));
}

function filterDataByColumns(data, columns) {
  const allowed = new Set(columns.map((c) => c.name));
  return Object.entries(normalizeObject(data)).reduce((acc, [key, value]) => {
    if (allowed.has(key)) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

async function loadRows(db, table, limit) {
  const sql = `SELECT * FROM ${quoteIdentifier(table)} ORDER BY rowid DESC LIMIT ?`;
  const rows = await db.prepare(sql).bind(limit).all();
  return rows.results || [];
}

async function insertRow(db, table, row) {
  const keys = Object.keys(row);
  if (!keys.length) {
    throw new Error("row is required for insert");
  }

  const cols = keys.map((k) => quoteIdentifier(k)).join(", ");
  const marks = keys.map(() => "?").join(", ");
  const values = keys.map((k) => row[k]);

  const sql = `INSERT INTO ${quoteIdentifier(table)} (${cols}) VALUES (${marks})`;
  const result = await db.prepare(sql).bind(...values).run();
  return Number(result?.meta?.changes || 0);
}

async function updateRows(db, table, row, where) {
  const setKeys = Object.keys(row);
  const whereKeys = Object.keys(where);

  if (!setKeys.length) {
    throw new Error("row is required for update");
  }
  if (!whereKeys.length) {
    throw new Error("where is required for update");
  }

  const setSql = setKeys.map((k) => `${quoteIdentifier(k)} = ?`).join(", ");
  const whereSql = whereKeys.map((k) => `${quoteIdentifier(k)} = ?`).join(" AND ");
  const values = [...setKeys.map((k) => row[k]), ...whereKeys.map((k) => where[k])];

  const sql = `UPDATE ${quoteIdentifier(table)} SET ${setSql} WHERE ${whereSql}`;
  const result = await db.prepare(sql).bind(...values).run();
  return Number(result?.meta?.changes || 0);
}

async function deleteRows(db, table, where) {
  const whereKeys = Object.keys(where);
  if (!whereKeys.length) {
    throw new Error("where is required for delete");
  }

  const whereSql = whereKeys.map((k) => `${quoteIdentifier(k)} = ?`).join(" AND ");
  const values = whereKeys.map((k) => where[k]);

  const sql = `DELETE FROM ${quoteIdentifier(table)} WHERE ${whereSql}`;
  const result = await db.prepare(sql).bind(...values).run();
  return Number(result?.meta?.changes || 0);
}

export async function onRequest(context) {
  const auth = await requireSession(context, ["SUPERVISOR"]);
  if (!auth.ok) return auth.response;

  const setupIssue = dbSetupIssue(context.env);
  if (setupIssue) return dbSetupErrorResponse(setupIssue);

  if (!context.env || !context.env.DB) {
    return badRequest("D1 database binding is required");
  }

  const db = context.env.DB;

  if (context.request.method === "GET") {
    const url = new URL(context.request.url);
    const action = String(url.searchParams.get("action") || "").trim().toLowerCase();

    if (action === "tables" || !url.searchParams.get("table")) {
      const tables = await listTables(db);
      return json({ tables });
    }

    const table = String(url.searchParams.get("table") || "").trim();
    if (!validIdentifier(table)) return badRequest("Invalid table");

    const tables = await listTables(db);
    if (!tables.includes(table)) return badRequest("Unknown table");

    const columns = await tableColumns(db, table);
    const rows = await loadRows(db, table, normalizeLimit(url.searchParams.get("limit")));
    return json({ table, columns, rows });
  }

  if (context.request.method === "POST") {
    const body = await readJson(context.request);
    const action = String(body.action || "").trim().toLowerCase();
    const table = String(body.table || "").trim();

    if (!validIdentifier(table)) return badRequest("Invalid table");

    const tables = await listTables(db);
    if (!tables.includes(table)) return badRequest("Unknown table");

    const columns = await tableColumns(db, table);
    const row = filterDataByColumns(body.row, columns);
    const where = filterDataByColumns(body.where, columns);

    try {
      if (action === "delete") {
        const changes = await deleteRows(db, table, where);
        return json({ ok: true, action, table, changes });
      }

      if (action === "upsert") {
        const changes = Object.keys(where).length
          ? await updateRows(db, table, row, where)
          : await insertRow(db, table, row);

        return json({ ok: true, action, table, changes });
      }

      return badRequest("action must be 'upsert' or 'delete'");
    } catch (error) {
      return badRequest(String(error && error.message ? error.message : error));
    }
  }

  return methodNotAllowed();
}

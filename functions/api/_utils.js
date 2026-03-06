export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function methodNotAllowed() {
  return json({ error: "Method not allowed" }, 405);
}

export function badRequest(message) {
  return json({ error: message }, 400);
}

export function unauthorized(message = "Unauthorized") {
  return json({ error: message }, 401);
}

export function getSupervisorToken(request) {
  const auth = request.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return (request.headers.get("x-supervisor-token") || "").trim();
}

const state = {
  token: "",
  role: "",
  actor: "",
  supervisorToken: "",
  validationToken: "",
  vendors: [],
  hotels: [],
  lastPdfBase64: "",
  lastPdfFileName: "",
  lastReport: null,
  adminTables: [],
  printProfile: "A4_SAFE"
};

const el = {
  sessionBadge: document.getElementById("sessionBadge"),
  loginPanel: document.getElementById("loginPanel"),
  operationsPanel: document.getElementById("operationsPanel"),
  staffNumber: document.getElementById("staffNumber"),
  staffLoginButton: document.getElementById("staffLoginButton"),
  loginStatus: document.getElementById("loginStatus"),

  mealMode: document.getElementById("mealMode"),
  mealVendor: document.getElementById("mealVendor"),
  mealFlight: document.getElementById("mealFlight"),
  mealReason: document.getElementById("mealReason"),
  mealQuantity: document.getElementById("mealQuantity"),
  printProfile: document.getElementById("printProfile"),
  mealFlightWrap: document.getElementById("mealFlightWrap"),
  mealReasonWrap: document.getElementById("mealReasonWrap"),
  mealQtyWrap: document.getElementById("mealQtyWrap"),
  inadWrap: document.getElementById("inadWrap"),
  issueMealButton: document.getElementById("issueMealButton"),
  mealStatus: document.getElementById("mealStatus"),

  hotelCode: document.getElementById("hotelCode"),
  hotelFlight: document.getElementById("hotelFlight"),
  hotelReason: document.getElementById("hotelReason"),
  hotelQuantity: document.getElementById("hotelQuantity"),
  issueHotelButton: document.getElementById("issueHotelButton"),
  hotelStatus: document.getElementById("hotelStatus"),

  sendEmailButton: document.getElementById("sendEmailButton"),
  emailStatus: document.getElementById("emailStatus"),

  refreshLatestButton: document.getElementById("refreshLatestButton"),
  latestList: document.getElementById("latestList"),

  supervisorStaff: document.getElementById("supervisorStaff"),
  supervisorLoginButton: document.getElementById("supervisorLoginButton"),
  supervisorStatus: document.getElementById("supervisorStatus"),
  reportsCard: document.getElementById("reportsCard"),
  configCard: document.getElementById("configCard"),
  dateFrom: document.getElementById("dateFrom"),
  dateTo: document.getElementById("dateTo"),
  reportVendor: document.getElementById("reportVendor"),
  reportHotel: document.getElementById("reportHotel"),
  reportStaff: document.getElementById("reportStaff"),
  reportFlight: document.getElementById("reportFlight"),
  runReportButton: document.getElementById("runReportButton"),
  exportCsvButton: document.getElementById("exportCsvButton"),
  exportPdfSummaryButton: document.getElementById("exportPdfSummaryButton"),
  reportSummary: document.getElementById("reportSummary"),
  reportRows: document.getElementById("reportRows"),
  runFinanceDashboardButton: document.getElementById("runFinanceDashboardButton"),
  financeSummary: document.getElementById("financeSummary"),
  financeRows: document.getElementById("financeRows"),

  cfgVendorCode: document.getElementById("cfgVendorCode"),
  cfgVendorName: document.getElementById("cfgVendorName"),
  cfgVendorBilling: document.getElementById("cfgVendorBilling"),
  cfgVendorValue: document.getElementById("cfgVendorValue"),
  cfgVendorCombo: document.getElementById("cfgVendorCombo"),
  cfgVendorLocations: document.getElementById("cfgVendorLocations"),
  cfgVendorPin: document.getElementById("cfgVendorPin"),
  saveVendorButton: document.getElementById("saveVendorButton"),

  cfgHotelCode: document.getElementById("cfgHotelCode"),
  cfgHotelName: document.getElementById("cfgHotelName"),
  cfgHotelAddress: document.getElementById("cfgHotelAddress"),
  cfgHotelPhone: document.getElementById("cfgHotelPhone"),
  cfgHotelShuttle: document.getElementById("cfgHotelShuttle"),
  cfgHotelPin: document.getElementById("cfgHotelPin"),
  saveHotelButton: document.getElementById("saveHotelButton"),
  configStatus: document.getElementById("configStatus"),

  adminCard: document.getElementById("adminCard"),
  adminTable: document.getElementById("adminTable"),
  adminLimit: document.getElementById("adminLimit"),
  adminRefreshTablesButton: document.getElementById("adminRefreshTablesButton"),
  adminLoadRowsButton: document.getElementById("adminLoadRowsButton"),
  adminWhere: document.getElementById("adminWhere"),
  adminRowJson: document.getElementById("adminRowJson"),
  adminUpsertButton: document.getElementById("adminUpsertButton"),
  adminDeleteButton: document.getElementById("adminDeleteButton"),
  adminStatus: document.getElementById("adminStatus"),
  adminColumns: document.getElementById("adminColumns"),
  adminRows: document.getElementById("adminRows"),

  validationMode: document.getElementById("validationMode"),
  validationCode: document.getElementById("validationCode"),
  validationPin: document.getElementById("validationPin"),
  validationLoginButton: document.getElementById("validationLoginButton"),
  validationLoginStatus: document.getElementById("validationLoginStatus"),
  validationCard: document.getElementById("validationCard"),
  validationStats: document.getElementById("validationStats"),
  voucherCodeInput: document.getElementById("voucherCodeInput"),
  validateVoucherButton: document.getElementById("validateVoucherButton"),
  validateStatus: document.getElementById("validateStatus"),
  flightBreakdown: document.getElementById("flightBreakdown")
};

function setStatus(node, message, ok = true) {
  node.className = `status ${ok ? "ok" : "warn"}`;
  node.textContent = message;
}

function setSessionBadge(text) {
  el.sessionBadge.textContent = text;
}

function b64FromUint8(uint8) {
  let binary = "";
  for (let i = 0; i < uint8.length; i += 1) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

let qatarLogoDataUrlPromise = null;

async function loadQatarLogoDataUrl() {
  if (qatarLogoDataUrlPromise) {
    return qatarLogoDataUrlPromise;
  }

  qatarLogoDataUrlPromise = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("");
          return;
        }

        ctx.drawImage(img, 0, 0);

        // Force logo to white while keeping alpha/transparency.
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha > 10) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          }
        }
        ctx.putImageData(imageData, 0, 0);

        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve("");
      }
    };

    img.onerror = () => {
      if (!img.dataset.fallback) {
        img.dataset.fallback = "1";
        img.src = "/assets/qatar-airways-logo.png";
        return;
      }
      resolve("");
    };

    img.src = "/assets/qatar-airways-logo.svg";
  });

  return qatarLogoDataUrlPromise;
}
function downloadBlob(name, blob) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function baseHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api(path, options = {}, token = state.token) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...baseHeaders(token)
    }
  });

  if (response.headers.get("content-type")?.includes("text/csv")) {
    const text = await response.text();
    return { csv: text, response };
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }
  return data;
}

function switchTab(tab) {
  document.querySelectorAll(".tab").forEach((node) => node.classList.remove("active"));
  document.querySelector(`.tab[data-tab='${tab}']`)?.classList.add("active");
  document.querySelectorAll(".tab-content").forEach((node) => node.classList.add("hidden"));
  document.getElementById(`tab-${tab}`)?.classList.remove("hidden");
}

document.querySelectorAll(".tab").forEach((node) => {
  node.addEventListener("click", () => switchTab(node.dataset.tab));
});

function mealModeUI() {
  const mode = el.mealMode.value;
  const inad = mode === "inad";
  el.inadWrap.classList.toggle("hidden", !inad);
  el.mealFlightWrap.classList.toggle("hidden", inad);
  el.mealReasonWrap.classList.toggle("hidden", inad);
  el.mealQtyWrap.classList.toggle("hidden", inad);
}

el.mealMode.addEventListener("change", mealModeUI);
if (el.printProfile) {
  el.printProfile.addEventListener("change", () => {
    state.printProfile = el.printProfile.value || "A4_SAFE";
  });
}

async function loadCatalogs() {
  const [vendorsRes, hotelsRes] = await Promise.all([
    api("/api/vendors"),
    api("/api/hotels")
  ]);

  state.vendors = vendorsRes.vendors || [];
  state.hotels = hotelsRes.hotels || [];

  el.mealVendor.innerHTML = state.vendors.map((v) => `<option value="${v.vendor_code}">${v.vendor_name}</option>`).join("");
  el.hotelCode.innerHTML = state.hotels.map((h) => `<option value="${h.hotel_code}">${h.hotel_name}</option>`).join("");
}

el.staffLoginButton.addEventListener("click", async () => {
  try {
    const staff_number = el.staffNumber.value.trim();
    if (!staff_number) {
      setStatus(el.loginStatus, "Staff number required", false);
      return;
    }

    const res = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ mode: "staff", staff_number })
    }, "");

    state.token = res.token;
    state.role = res.user.role;
    state.actor = res.user.staff_number;

    setSessionBadge(`Staff ${state.actor} (${state.role})`);
    setStatus(el.loginStatus, "Login successful", true);
    el.loginPanel.classList.add("hidden");
    el.operationsPanel.classList.remove("hidden");

    await loadCatalogs();
    await refreshLatest();
    mealModeUI();
  } catch (error) {
    setStatus(el.loginStatus, error.message, false);
  }
});

async function qrDataUrl(voucherId) {
  const qrLib = window.QRCode;
  if (!qrLib) {
    return null;
  }

  if (typeof qrLib.toDataURL === "function") {
    return await qrLib.toDataURL(voucherId, { width: 200, margin: 1, errorCorrectionLevel: "M" });
  }

  // Fallback for qrcodejs-style constructor API.
  const holder = document.createElement("div");
  holder.style.position = "fixed";
  holder.style.left = "-9999px";
  holder.style.top = "-9999px";
  document.body.appendChild(holder);

  try {
    new qrLib(holder, {
      text: String(voucherId || ""),
      width: 200,
      height: 200,
      correctLevel: qrLib.CorrectLevel ? qrLib.CorrectLevel.M : undefined
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const canvas = holder.querySelector("canvas");
    if (canvas && typeof canvas.toDataURL === "function") {
      return canvas.toDataURL("image/png");
    }

    const img = holder.querySelector("img");
    if (img && img.src) {
      return img.src;
    }

    return null;
  } finally {
    holder.remove();
  }
}

function valueText(voucher, vendor) {
  if (voucher.voucher_type === "MEAL_INAD") {
    return voucher.service_text;
  }
  if (vendor.billing_type === "COMBO") {
    return voucher.service_text || `Service: ${vendor.vendor_name} fixed meal combo`;
  }
  return `Authorized value: R$ ${(Number(voucher.authorized_value || 0)).toFixed(2)}`;
}

function linesFromLocations(text) {
  return String(text || "").split("\n").map((x) => x.trim()).filter(Boolean);
}
async function buildVoucherPdf(vouchers, type, fileName) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const logoDataUrl = await loadQatarLogoDataUrl();

  const profiles = {
    A4_SAFE: {
      headerY: 24,
      titleY: 34.5,
      voucherY: 40.8,
      badgeY: 42.2,
      logoY: 28.8,
      layoverY: 60,
      bodyStartY: 66,
      termsLineY: 216,
      termsTextY1: 224,
      termsTextY2: 230,
      stampY: 238,
      qrBoxY: 222,
      qrImageY: 228,
      footer1Y: 272,
      footer1TextY: 276,
      footer2Y: 280,
      footer2TextY: 284.2,
      cityY: 291,
      techY: 294
    },
    A4_COMPACT: {
      headerY: 20,
      titleY: 30.5,
      voucherY: 36.8,
      badgeY: 38.2,
      logoY: 24.8,
      layoverY: 56,
      bodyStartY: 62,
      termsLineY: 212,
      termsTextY1: 220,
      termsTextY2: 226,
      stampY: 234,
      qrBoxY: 218,
      qrImageY: 224,
      footer1Y: 268,
      footer1TextY: 272,
      footer2Y: 276,
      footer2TextY: 280.2,
      cityY: 287,
      techY: 290
    }
  };

  const p = profiles[state.printProfile] || profiles.A4_SAFE;

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  };

  const mealTypeLine = (subtype) => {
    const s = String(subtype || "").toLowerCase();
    const b = s === "breakfast" ? "[X]" : "[ ]";
    const l = s === "lunch" ? "[X]" : "[ ]";
    const d = s === "dinner" ? "[X]" : "[ ]";
    return `${b} BREAKFAST    ${l} LUNCH    ${d} DINNER`;
  };

  const grayRow = (text, y) => {
    doc.setFillColor(224, 224, 224);
    doc.rect(20, y, 170, 8, "F");
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(String(text || "-"), 22, y + 5.4);
  };

  for (let i = 0; i < vouchers.length; i += 1) {
    const v = vouchers[i];
    if (i > 0) doc.addPage();

    const isHotel = v.voucher_type === "HOTEL";
    const isInad = v.voucher_type === "MEAL_INAD";

    const vendor = state.vendors.find((x) => x.vendor_code === v.vendor_code) || {};
    const hotel = state.hotels.find((x) => x.hotel_code === v.hotel_code) || {};

    doc.setFillColor(22, 22, 22);
    doc.rect(20, p.headerY, 170, 26, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.8);
    doc.text(isHotel ? "Hotel Accommodation Transportation Order" : "Meal Accommodation Transportation Order", 24, p.titleY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.2);
    doc.text(`Voucher ${v.id}`, 24, p.voucherY);

    const categoryLabel = isHotel ? "CATEGORY: HOTEL" : isInad ? "CATEGORY: MEAL INAD" : "CATEGORY: MEAL NORMAL";
    doc.setDrawColor(255, 255, 255);
    doc.roundedRect(24, p.badgeY, 52, 6, 1.2, 1.2, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.text(categoryLabel, 26, p.badgeY + 4);

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", 152, p.logoY, 31, 12.6);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("QATAR", 184, p.titleY, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.6);
      doc.text("AIRWAYS", 184, p.voucherY - 1.5, { align: "right" });
    }

    doc.setTextColor(35, 35, 35);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.text(`LAYOVER POINT: GRU - ${v.flight || "-"} - DATE: ${formatDate(v.created_at)}`, 20, p.layoverY);

    let y = p.bodyStartY;

    if (!isHotel) {
      grayRow(`VENDOR: ${vendor.vendor_name || v.vendor_code || "-"}`, y);
      y += 10;

      if (isInad) {
        grayRow(`MEAL TYPE: ${mealTypeLine(v.subtype || "")}`, y);
        y += 10;
      } else {
        const authorizedValue = v.authorized_value == null ? "-" : `R$ ${Number(v.authorized_value).toFixed(2)}`;
        grayRow(`AUTHORIZED VALUE: ${authorizedValue}`, y);
        y += 10;
      }

      grayRow("TOTAL MEALS: 1", y);
      y += 12;

      const locations = linesFromLocations(vendor.locations_text || "");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const locList = locations.length ? locations : ["Partner location will validate this voucher."];
      const capped = locList.slice(0, 2).map((loc) => (loc.length > 78 ? `${loc.slice(0, 75)}...` : loc));
      capped.forEach((loc, idx) => {
        doc.text(`- ${loc}`, 24, y + (idx * 7));
      });
      if (locList.length > 2) {
        doc.text("- ...", 24, y + 14);
      }
    } else {
      grayRow(`HOTEL: ${hotel.hotel_name || v.hotel_code || "-"}`, y);
      y += 10;

      grayRow(`REASON: ${v.reason || "-"}`, y);
      y += 10;

      grayRow("ROOM: 1", y);
      y += 12;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const address = hotel.address || "Address not configured";
      const phone = hotel.phone || "-";
      const shuttle = hotel.shuttle_info || "-";
      doc.text(`- Address: ${address}`, 24, y);
      doc.text(`- Phone: ${phone}`, 24, y + 7);
      doc.text(`- Shuttle: ${shuttle}`, 24, y + 14);
    }

    doc.setDrawColor(150, 150, 150);
    doc.line(20, p.termsLineY, 190, p.termsLineY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("Not valid after the issuance date.", 20, p.termsTextY1);
    doc.text("Valid only for Qatar Airways passengers.", 20, p.termsTextY2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("VALIDATION STAMP", 20, p.stampY);

    doc.setDrawColor(120, 120, 120);
    doc.rect(145, p.qrBoxY, 45, 45);

    const qr = await qrDataUrl(v.id);
    if (qr) {
      doc.addImage(qr, "PNG", 151, p.qrImageY, 33, 33);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("QR unavailable", 167.5, p.qrImageY + 22, { align: "center" });
    }

    doc.setFillColor(196, 196, 196);
    doc.rect(20, p.footer1Y, 170, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text("ACCOUNT - CODE 495 / STATION GRU", 22, p.footer1TextY);

    doc.setFillColor(160, 160, 160);
    doc.rect(20, p.footer2Y, 170, 6, "F");
    doc.setFontSize(9);
    doc.text("QATAR AIRWAYS", 22, p.footer2TextY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Sao Paulo - GRU - Brazil", 22, p.cityY);

    doc.setFontSize(7.6);
    doc.text(`Version: v2.1 | Generated UTC: ${new Date(v.created_at).toISOString()}`, 22, p.techY);
  }

  const bytes = doc.output("arraybuffer");
  const uint8 = new Uint8Array(bytes);
  const blob = new Blob([uint8], { type: "application/pdf" });
  downloadBlob(fileName, blob);

  state.lastPdfBase64 = b64FromUint8(uint8);
  state.lastPdfFileName = fileName;
}
el.issueMealButton.addEventListener("click", async () => {
  try {
    const mode = el.mealMode.value;
    const vendor_code = el.mealVendor.value;

    if (mode === "normal") {
      const payload = {
        mode,
        vendor_code,
        flight: el.mealFlight.value.trim().toUpperCase(),
        reason: el.mealReason.value.trim(),
        quantity: Number(el.mealQuantity.value || 0)
      };
      if (!payload.reason) {
        setStatus(el.mealStatus, "Select a reason", false);
        return;
      }

      const res = await api("/api/issue-meal", { method: "POST", body: JSON.stringify(payload) });
      await buildVoucherPdf(res.vouchers, "MEAL", res.fileName);
      setStatus(el.mealStatus, `Batch created: ${res.vouchers.length} vouchers`, true);
      await refreshLatest();
      return;
    }

    const inad_meals = Array.from(document.querySelectorAll("#inadWrap input[type='checkbox']:checked")).map((x) => x.value);
    const res = await api("/api/issue-meal", {
      method: "POST",
      body: JSON.stringify({ mode, vendor_code, inad_meals })
    });

    await buildVoucherPdf(res.vouchers, "MEAL", res.fileName);
    setStatus(el.mealStatus, `INAD batch created: ${res.vouchers.length} vouchers`, true);
    await refreshLatest();
  } catch (error) {
    setStatus(el.mealStatus, error.message, false);
  }
});

el.issueHotelButton.addEventListener("click", async () => {
  try {
    const payload = {
      hotel_code: el.hotelCode.value,
      flight: el.hotelFlight.value.trim().toUpperCase(),
      reason: el.hotelReason.value.trim(),
      quantity: Number(el.hotelQuantity.value || 0)
    };
    if (!payload.reason) {
      setStatus(el.hotelStatus, "Select a reason", false);
      return;
    }

    const res = await api("/api/issue-hotel", { method: "POST", body: JSON.stringify(payload) });
    await buildVoucherPdf(res.vouchers, "HOTEL", res.fileName);
    setStatus(el.hotelStatus, `Hotel batch created: ${res.vouchers.length} vouchers`, true);
    await refreshLatest();
  } catch (error) {
    setStatus(el.hotelStatus, error.message, false);
  }
});

el.sendEmailButton.addEventListener("click", async () => {
  try {
    if (!state.lastPdfBase64) {
      setStatus(el.emailStatus, "Generate a batch PDF first", false);
      return;
    }

    const res = await api("/api/send-email", {
      method: "POST",
      body: JSON.stringify({
        file_name: state.lastPdfFileName,
        pdf_base64: state.lastPdfBase64,
        send_email: true
      })
    });

    setStatus(el.emailStatus, res.emailed ? "Email sent to KK" : `Saved only: ${res.message || "provider not configured"}`, true);
  } catch (error) {
    setStatus(el.emailStatus, error.message, false);
  }
});

async function refreshLatest() {
  const res = await api("/api/latest?limit=60");
  el.latestList.innerHTML = "";
  if (!res.vouchers.length) {
    el.latestList.innerHTML = "<li>No vouchers yet</li>";
    return;
  }

  for (const v of res.vouchers) {
    const li = document.createElement("li");
    li.textContent = `[${v.id}] ${v.voucher_type} | ${v.status} | staff ${v.staff_number} | ${new Date(v.created_at).toLocaleString()}`;
    el.latestList.appendChild(li);
  }
}

el.refreshLatestButton.addEventListener("click", async () => {
  try {
    await refreshLatest();
  } catch {
    
  }
});

el.supervisorLoginButton.addEventListener("click", async () => {
  try {
    const staff_number = el.supervisorStaff.value.trim();
    const res = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ mode: "supervisor", staff_number })
    }, "");

    state.supervisorToken = res.token;
    el.reportsCard.classList.remove("hidden");
    el.configCard.classList.remove("hidden");
    el.adminCard.classList.remove("hidden");
    setStatus(el.supervisorStatus, "Supervisor authenticated", true);
    await loadAdminTables();
    await loadAdminRows();
  } catch (error) {
    setStatus(el.supervisorStatus, error.message, false);
  }
});
async function runReport(format = "json") {
  const payload = {
    dateFrom: el.dateFrom.value.trim(),
    dateTo: el.dateTo.value.trim(),
    vendor: el.reportVendor.value.trim(),
    hotel: el.reportHotel.value.trim(),
    staff: el.reportStaff.value.trim(),
    flight: el.reportFlight.value.trim(),
    format
  };

  return await api("/api/report", {
    method: "POST",
    body: JSON.stringify(payload)
  }, state.supervisorToken);
}

async function runFinanceDashboard() {
  const payload = {
    dateFrom: el.dateFrom.value.trim(),
    dateTo: el.dateTo.value.trim(),
    vendor: el.reportVendor.value.trim(),
    hotel: el.reportHotel.value.trim(),
    staff: el.reportStaff.value.trim(),
    flight: el.reportFlight.value.trim()
  };

  return await api("/api/finance-dashboard", {
    method: "POST",
    body: JSON.stringify(payload)
  }, state.supervisorToken);
}

el.runFinanceDashboardButton.addEventListener("click", async () => {
  try {
    const res = await runFinanceDashboard();
    const d = res.dashboard || {};
    el.financeSummary.textContent = JSON.stringify(d.kpis || {}, null, 2);
    el.financeRows.innerHTML = "";
    for (const row of (d.by_partner || []).slice(0, 200)) {
      const li = document.createElement("li");
      li.textContent = `${row.partner_type} ${row.partner_code} | vouchers ${row.vouchers} | estimated R$ ${Number(row.estimated_value || 0).toFixed(2)}`;
      el.financeRows.appendChild(li);
    }
  } catch (error) {
    el.financeSummary.textContent = error.message;
  }
});
el.runReportButton.addEventListener("click", async () => {
  try {
    const res = await runReport("json");
    state.lastReport = res.report;

    el.reportSummary.textContent = JSON.stringify(res.report.stats, null, 2);
    el.reportRows.innerHTML = "";
    for (const row of res.report.rows.slice(0, 120)) {
      const li = document.createElement("li");
      li.textContent = `${row.id} | ${row.voucher_type} | ${row.status} | ${row.flight || "-"} | ${row.staff_number}`;
      el.reportRows.appendChild(li);
    }
  } catch (error) {
    el.reportSummary.textContent = error.message;
  }
});

el.exportCsvButton.addEventListener("click", async () => {
  try {
    const res = await runReport("csv");
    const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(`report_${new Date().toISOString().slice(0, 10)}.csv`, blob);
  } catch (error) {
    el.reportSummary.textContent = error.message;
  }
});

el.exportPdfSummaryButton.addEventListener("click", async () => {
  if (!state.lastReport) {
    el.reportSummary.textContent = "Run report first.";
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFontSize(14);
  doc.text("GRU Voucher Summary Report", 12, 14);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 12, 21);
  doc.text(`Meal Normal: ${state.lastReport.stats.meal_normal}`, 12, 32);
  doc.text(`Meal INAD: ${state.lastReport.stats.meal_inad}`, 12, 38);
  doc.text(`Hotel Rooms: ${state.lastReport.stats.hotel_rooms}`, 12, 44);
  doc.text(`Used: ${state.lastReport.stats.used}`, 12, 50);
  doc.text(`Pending: ${state.lastReport.stats.pending}`, 12, 56);
  doc.save(`report_summary_${new Date().toISOString().slice(0, 10)}.pdf`);
});

el.saveVendorButton.addEventListener("click", async () => {
  try {
    await api("/api/vendors", {
      method: "PUT",
      body: JSON.stringify({
        vendor_code: el.cfgVendorCode.value.trim().toUpperCase(),
        vendor_name: el.cfgVendorName.value.trim(),
        billing_type: el.cfgVendorBilling.value,
        value_amount: el.cfgVendorValue.value,
        combo_text: el.cfgVendorCombo.value,
        locations_text: el.cfgVendorLocations.value,
        pin: el.cfgVendorPin.value.trim(),
        status: "ACTIVE"
      })
    }, state.supervisorToken);

    await loadCatalogs();
    setStatus(el.configStatus, "Vendor saved", true);
  } catch (error) {
    setStatus(el.configStatus, error.message, false);
  }
});

el.saveHotelButton.addEventListener("click", async () => {
  try {
    await api("/api/hotels", {
      method: "PUT",
      body: JSON.stringify({
        hotel_code: el.cfgHotelCode.value.trim().toUpperCase(),
        hotel_name: el.cfgHotelName.value.trim(),
        address: el.cfgHotelAddress.value.trim(),
        phone: el.cfgHotelPhone.value.trim(),
        shuttle_info: el.cfgHotelShuttle.value.trim(),
        pin: el.cfgHotelPin.value.trim(),
        status: "ACTIVE"
      })
    }, state.supervisorToken);

    await loadCatalogs();
    setStatus(el.configStatus, "Hotel saved", true);
  } catch (error) {
    setStatus(el.configStatus, error.message, false);
  }
});

function parseJsonObject(input, label) {
  const raw = String(input || "").trim();
  if (!raw) {
    return {};
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`${label} must be valid JSON`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON object`);
  }
  return parsed;
}

async function loadAdminTables() {
  if (!state.supervisorToken) {
    setStatus(el.adminStatus, "Login as supervisor in the Supervisor Reports tab", false);
    return;
  }

  const res = await api("/api/admin-db?action=tables", {}, state.supervisorToken);
  state.adminTables = res.tables || [];
  el.adminTable.innerHTML = state.adminTables.map((t) => `<option value="${t}">${t}</option>`).join("");
}

async function loadAdminRows() {
  if (!state.supervisorToken) {
    setStatus(el.adminStatus, "Login as supervisor in the Supervisor Reports tab", false);
    return;
  }

  const table = el.adminTable.value;
  if (!table) {
    setStatus(el.adminStatus, "Select a table", false);
    return;
  }

  const limit = Math.min(Math.max(Number(el.adminLimit.value || 120), 1), 500);
  const res = await api(`/api/admin-db?table=${encodeURIComponent(table)}&limit=${limit}`, {}, state.supervisorToken);
  el.adminColumns.textContent = JSON.stringify(res.columns || [], null, 2);
  el.adminRows.textContent = JSON.stringify(res.rows || [], null, 2);
  setStatus(el.adminStatus, `Loaded ${(res.rows || []).length} rows from ${table}`, true);
}

el.adminRefreshTablesButton.addEventListener("click", async () => {
  try {
    await loadAdminTables();
    setStatus(el.adminStatus, "Tables refreshed", true);
  } catch (error) {
    setStatus(el.adminStatus, error.message, false);
  }
});

el.adminLoadRowsButton.addEventListener("click", async () => {
  try {
    await loadAdminRows();
  } catch (error) {
    setStatus(el.adminStatus, error.message, false);
  }
});

el.adminUpsertButton.addEventListener("click", async () => {
  try {
    if (!state.supervisorToken) {
      setStatus(el.adminStatus, "Login as supervisor in the Supervisor Reports tab", false);
      return;
    }

    const table = el.adminTable.value;
    if (!table) {
      setStatus(el.adminStatus, "Select a table", false);
      return;
    }

    const row = parseJsonObject(el.adminRowJson.value, "ROW JSON");
    const where = parseJsonObject(el.adminWhere.value, "WHERE JSON");
    if (!Object.keys(row).length) {
      setStatus(el.adminStatus, "ROW JSON cannot be empty", false);
      return;
    }

    const res = await api("/api/admin-db", {
      method: "POST",
      body: JSON.stringify({ action: "upsert", table, row, where })
    }, state.supervisorToken);

    setStatus(el.adminStatus, `Saved. Changes: ${res.changes || 0}`, true);
    await loadAdminRows();
  } catch (error) {
    setStatus(el.adminStatus, error.message, false);
  }
});

el.adminDeleteButton.addEventListener("click", async () => {
  try {
    if (!state.supervisorToken) {
      setStatus(el.adminStatus, "Login as supervisor in the Supervisor Reports tab", false);
      return;
    }

    const table = el.adminTable.value;
    if (!table) {
      setStatus(el.adminStatus, "Select a table", false);
      return;
    }

    const where = parseJsonObject(el.adminWhere.value, "WHERE JSON");
    if (!Object.keys(where).length) {
      setStatus(el.adminStatus, "WHERE JSON is required for delete", false);
      return;
    }

    const res = await api("/api/admin-db", {
      method: "POST",
      body: JSON.stringify({ action: "delete", table, where })
    }, state.supervisorToken);

    setStatus(el.adminStatus, `Deleted. Changes: ${res.changes || 0}`, true);
    await loadAdminRows();
  } catch (error) {
    setStatus(el.adminStatus, error.message, false);
  }
});
el.validationLoginButton.addEventListener("click", async () => {
  try {
    const mode = el.validationMode.value;
    const code = el.validationCode.value.trim().toUpperCase();
    const pin = el.validationPin.value.trim();

    const payload = mode === "vendor"
      ? { mode: "vendor", vendor_code: code, pin }
      : { mode: "hotel", hotel_code: code, pin };

    const res = await api("/api/login", { method: "POST", body: JSON.stringify(payload) }, "");
    state.validationToken = res.token;
    el.validationCard.classList.remove("hidden");
    setStatus(el.validationLoginStatus, `${mode} logged in`, true);
    await refreshValidationDashboard();
  } catch (error) {
    setStatus(el.validationLoginStatus, error.message, false);
  }
});

async function refreshValidationDashboard() {
  const res = await api("/api/validate", {}, state.validationToken);
  el.validationStats.textContent = `Requested: ${res.summary.requested} | Used: ${res.summary.used} | Pending: ${res.summary.pending}`;
  el.flightBreakdown.textContent = JSON.stringify(res.by_flight, null, 2);
}

el.validateVoucherButton.addEventListener("click", async () => {
  try {
    await api("/api/validate", {
      method: "POST",
      body: JSON.stringify({ voucher_id: el.voucherCodeInput.value.trim() })
    }, state.validationToken);

    setStatus(el.validateStatus, "Voucher marked as USED", true);
    await refreshValidationDashboard();
  } catch (error) {
    setStatus(el.validateStatus, error.message, false);
  }
});

switchTab("issue");
mealModeUI();
setStatus(el.adminStatus, "Login as supervisor in the Supervisor Reports tab", false);






















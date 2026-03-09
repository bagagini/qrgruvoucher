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
  lastReport: null
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
  if (!qrLib || typeof qrLib.toDataURL !== "function") {
    return null;
  }
  return await qrLib.toDataURL(voucherId, { width: 200, margin: 1, errorCorrectionLevel: "M" });
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

  for (let i = 0; i < vouchers.length; i += 1) {
    const v = vouchers[i];
    if (i > 0) doc.addPage();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(type === "HOTEL" ? "HOTEL ACCOMMODATION VOUCHER" : "MEAL ACCOMMODATION ORDER", 12, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    let y = 24;
    const write = (label, value) => {
      doc.text(`${label}: ${value}`, 12, y);
      y += 6;
    };

    write("Layover", "GRU");
    write("Date", new Date(v.created_at).toLocaleString());

    if (v.voucher_type === "MEAL_NORMAL") {
      const vendor = state.vendors.find((x) => x.vendor_code === v.vendor_code) || {};
      write("Flight", v.flight || "-");
      write("Vendor", vendor.vendor_name || v.vendor_code);
      const locations = linesFromLocations(vendor.locations_text || "");
      write("Valid locations", locations.length ? locations.join(" | ") : "-");
      write("Service", valueText(v, vendor));
      write("Total meals", "1");
    }

    if (v.voucher_type === "MEAL_INAD") {
      const vendor = state.vendors.find((x) => x.vendor_code === v.vendor_code) || {};
      doc.setFont("helvetica", "bold");
      doc.text("[INAD]", 170, 14);
      doc.setFont("helvetica", "normal");
      write("Vendor", vendor.vendor_name || v.vendor_code);
      write("Meal type", v.subtype || "-");
      const locations = linesFromLocations(vendor.locations_text || "");
      write("Valid locations", locations.length ? locations.join(" | ") : "-");
      write("Service", v.service_text || "INAD passenger meal");
      write("Total meals", "1");
    }

    if (v.voucher_type === "HOTEL") {
      const hotel = state.hotels.find((x) => x.hotel_code === v.hotel_code) || {};
      write("Flight", v.flight || "-");
      write("Hotel", hotel.hotel_name || v.hotel_code);
      write("Address", hotel.address || "-");
      write("Phone", hotel.phone || "-");
      write("Shuttle", hotel.shuttle_info || "-");
      write("Room", "1");
      write("Reason", v.reason || "-");
    }

    write("Voucher ID", v.id);
    write("Prepared by", v.staff_number);

    const qr = await qrDataUrl(v.id);
    if (qr) {
      doc.addImage(qr, "PNG", 145, 45, 50, 50);
    } else {
      doc.setFontSize(9);
      doc.text("QR unavailable", 150, 70);
    }
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
    setStatus(el.supervisorStatus, "Supervisor authenticated", true);
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



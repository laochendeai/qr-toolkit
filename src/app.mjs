import {
  $,
  clampNumber,
  copyText,
  downloadBlob,
  isProbablyUrl,
  normalizeHex,
  parseSvgElement,
  printWithMode,
  setText,
  showCallout,
} from "./core/dom.mjs";
import { t, tf } from "./core/i18n.mjs";
import { loadQrFactory } from "./core/qr-engine.mjs";

function escapeVCardValue(value) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}

function buildPayload(type, fields) {
  switch (type) {
    case "text":
      return fields.text?.trim() ?? "";
    case "wifi": {
      const ssid = fields.ssid ?? "";
      const security = fields.security ?? "WPA";
      const password = fields.password ?? "";
      const hidden = fields.hidden ? "true" : "false";
      const safeSec = security === "nopass" ? "nopass" : security;
      const escapeWifi = (text) => String(text ?? "").replaceAll("\\", "\\\\").replaceAll(";", "\\;");
      return `WIFI:T:${safeSec};S:${escapeWifi(ssid)};P:${escapeWifi(password)};H:${hidden};;`;
    }
    case "tel":
      return `tel:${String(fields.tel ?? "").trim()}`;
    case "email": {
      const to = String(fields.to ?? "").trim();
      const subject = String(fields.subject ?? "").trim();
      const body = String(fields.body ?? "").trim();
      const params = new URLSearchParams();
      if (subject) params.set("subject", subject);
      if (body) params.set("body", body);
      const qs = params.toString();
      return qs ? `mailto:${to}?${qs}` : `mailto:${to}`;
    }
    case "sms": {
      const to = String(fields.to ?? "").trim();
      const body = String(fields.body ?? "").trim();
      if (!body) return `SMSTO:${to}:`;
      return `SMSTO:${to}:${body}`;
    }
    case "geo": {
      const lat = String(fields.lat ?? "").trim();
      const lng = String(fields.lng ?? "").trim();
      const query = String(fields.q ?? "").trim();
      if (query) return `geo:${lat},${lng}?q=${encodeURIComponent(query)}`;
      return `geo:${lat},${lng}`;
    }
    case "vcard": {
      const name = escapeVCardValue(fields.name ?? "");
      const org = escapeVCardValue(fields.org ?? "");
      const title = escapeVCardValue(fields.title ?? "");
      const tel = escapeVCardValue(fields.tel ?? "");
      const email = escapeVCardValue(fields.email ?? "");
      const url = escapeVCardValue(fields.url ?? "");
      const adr = escapeVCardValue(fields.adr ?? "");
      const note = escapeVCardValue(fields.note ?? "");

      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        name ? `FN:${name}` : "",
        org ? `ORG:${org}` : "",
        title ? `TITLE:${title}` : "",
        tel ? `TEL;TYPE=CELL:${tel}` : "",
        email ? `EMAIL:${email}` : "",
        url ? `URL:${url}` : "",
        adr ? `ADR:${adr}` : "",
        note ? `NOTE:${note}` : "",
        "END:VCARD",
      ].filter(Boolean);

      return lines.join("\n");
    }
    default:
      return "";
  }
}

function buildSvgFromQrMatrix(qr, { quietZone, fg, bg }) {
  const count = qr.getModuleCount();
  const dim = count + quietZone * 2;

  let path = "";
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue;
      const x = col + quietZone;
      const y = row + quietZone;
      path += `M${x} ${y}h1v1h-1z`;
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges">` +
    `<rect width="100%" height="100%" fill="${bg}"/>` +
    `<path d="${path}" fill="${fg}"/>` +
    "</svg>"
  );
}

function renderQrToCanvas(qr, canvas, { scale, quietZone, fg, bg }) {
  const count = qr.getModuleCount();
  const margin = quietZone * scale;
  const size = count * scale + margin * 2;

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = fg;
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue;
      ctx.fillRect(margin + col * scale, margin + row * scale, scale, scale);
    }
  }
}

async function drawLogoOnCanvas(canvas, { imageBitmap, ratio, whiteBg }) {
  if (!imageBitmap || ratio <= 0) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = Math.min(canvas.width, canvas.height);
  const logoSize = Math.floor(size * ratio);
  if (logoSize <= 0) return;

  const x = Math.floor((canvas.width - logoSize) / 2);
  const y = Math.floor((canvas.height - logoSize) / 2);

  if (whiteBg) {
    const pad = Math.floor(logoSize * 0.12);
    const r = Math.floor(logoSize * 0.16);
    const w = logoSize + pad * 2;
    const h = logoSize + pad * 2;
    const rx = x - pad;
    const ry = y - pad;
    const rr = Math.min(r, w / 2, h / 2);

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(rx + rr, ry);
    ctx.arcTo(rx + w, ry, rx + w, ry + h, rr);
    ctx.arcTo(rx + w, ry + h, rx, ry + h, rr);
    ctx.arcTo(rx, ry + h, rx, ry, rr);
    ctx.arcTo(rx, ry, rx + w, ry, rr);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  const scale = Math.min(logoSize / imageBitmap.width, logoSize / imageBitmap.height);
  const width = Math.floor(imageBitmap.width * scale);
  const height = Math.floor(imageBitmap.height * scale);
  const dx = Math.floor(x + (logoSize - width) / 2);
  const dy = Math.floor(y + (logoSize - height) / 2);
  ctx.drawImage(imageBitmap, dx, dy, width, height);
}

function initTabs() {
  const tabButtons = Array.from(document.querySelectorAll(".tab"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));

  function setActive(tabId) {
    tabButtons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.tab === tabId));
    panels.forEach((panel) => panel.classList.toggle("is-active", panel.id === `tab-${tabId}`));
    history.replaceState(null, "", `#${tabId}`);
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => setActive(btn.dataset.tab));
  });

  const initial = location.hash?.slice(1);
  if (initial && tabButtons.some((btn) => btn.dataset.tab === initial)) {
    setActive(initial);
  }
}

function mountTypeFields(container, type) {
  container.innerHTML = "";

  const mkInput = ({ id, label, placeholder = "", type: inputType = "text" }) => {
    const wrap = document.createElement("div");
    wrap.className = "field";

    const labelEl = document.createElement("label");
    labelEl.setAttribute("for", id);
    labelEl.textContent = label;

    const input = document.createElement("input");
    input.id = id;
    input.name = id;
    input.type = inputType;
    input.placeholder = placeholder;

    wrap.append(labelEl, input);
    return wrap;
  };

  const mkTextarea = ({ id, label, placeholder = "", rows = 4 }) => {
    const wrap = document.createElement("div");
    wrap.className = "field";

    const labelEl = document.createElement("label");
    labelEl.setAttribute("for", id);
    labelEl.textContent = label;

    const textarea = document.createElement("textarea");
    textarea.id = id;
    textarea.name = id;
    textarea.rows = rows;
    textarea.placeholder = placeholder;
    textarea.spellcheck = false;

    wrap.append(labelEl, textarea);
    return wrap;
  };

  if (type === "text") {
    container.append(
      mkTextarea({
        id: "text",
        label: t("text.label", "URL / Text"),
        rows: 5,
        placeholder: t("text.placeholder", "e.g., https://example.com"),
      }),
    );
    return;
  }

  if (type === "wifi") {
    const grid = document.createElement("div");
    grid.className = "grid-2";
    grid.append(
      mkInput({ id: "ssid", label: t("wifi.ssid", "Wi-Fi Name (SSID)") }),
      mkInput({ id: "password", label: t("wifi.password", "Password"), type: "password" }),
    );

    const security = document.createElement("div");
    security.className = "field";
    const securityLabel = document.createElement("label");
    securityLabel.setAttribute("for", "security");
    securityLabel.textContent = t("wifi.security", "Security");
    const securitySelect = document.createElement("select");
    securitySelect.id = "security";
    securitySelect.name = "security";
    securitySelect.innerHTML = `
      <option value="WPA" selected>${t("wifi.wpa", "WPA/WPA2")}</option>
      <option value="WEP">${t("wifi.wep", "WEP")}</option>
      <option value="nopass">${t("wifi.nopass", "No Password")}</option>
    `;
    security.append(securityLabel, securitySelect);

    const hiddenWrap = document.createElement("label");
    hiddenWrap.className = "checkbox";
    const hiddenCheckbox = document.createElement("input");
    hiddenCheckbox.type = "checkbox";
    hiddenCheckbox.id = "hidden";
    hiddenCheckbox.name = "hidden";
    const hiddenText = document.createElement("span");
    hiddenText.textContent = t("wifi.hidden", "Hidden Network (H)");
    hiddenWrap.append(hiddenCheckbox, hiddenText);

    container.append(grid, security, hiddenWrap);
    return;
  }

  if (type === "tel") {
    container.append(mkInput({ id: "tel", label: t("tel.label", "Phone Number"), placeholder: t("tel.placeholder", "+86...") }));
    return;
  }

  if (type === "email") {
    container.append(
      mkInput({ id: "to", label: t("email.to", "Recipient"), placeholder: t("email.toPlaceholder", "name@example.com") }),
      mkInput({ id: "subject", label: t("email.subject", "Subject (Optional)") }),
      mkTextarea({ id: "body", label: t("email.body", "Body (Optional)"), rows: 4 }),
    );
    return;
  }

  if (type === "sms") {
    container.append(
      mkInput({ id: "to", label: t("sms.to", "Recipient Phone Number") }),
      mkTextarea({ id: "body", label: t("sms.body", "SMS Content (Optional)"), rows: 4 }),
    );
    return;
  }

  if (type === "geo") {
    const grid = document.createElement("div");
    grid.className = "grid-2";
    grid.append(
      mkInput({ id: "lat", label: t("geo.lat", "Latitude (lat)"), placeholder: t("geo.latPlaceholder", "31.2304") }),
      mkInput({ id: "lng", label: t("geo.lng", "Longitude (lng)"), placeholder: t("geo.lngPlaceholder", "121.4737") }),
    );
    container.append(grid, mkInput({ id: "q", label: t("geo.query", "Query (Optional)"), placeholder: t("geo.queryPlaceholder", "e.g., coffee shop") }));
    return;
  }

  if (type === "vcard") {
    const grid = document.createElement("div");
    grid.className = "grid-2";
    grid.append(
      mkInput({ id: "name", label: t("vcard.name", "Name (FN)") }),
      mkInput({ id: "org", label: t("vcard.org", "Organization (ORG)") }),
    );
    container.append(
      grid,
      mkInput({ id: "title", label: t("vcard.title", "Title (TITLE)") }),
      mkInput({ id: "tel", label: t("vcard.tel", "Phone (TEL)") }),
      mkInput({ id: "email", label: t("vcard.email", "Email (EMAIL)") }),
      mkInput({ id: "url", label: t("vcard.url", "Website (URL)") }),
      mkTextarea({ id: "adr", label: t("vcard.adr", "Address (ADR, Optional)"), rows: 2 }),
      mkTextarea({ id: "note", label: t("vcard.note", "Note (NOTE, Optional)"), rows: 3 }),
    );
  }
}

function collectFields(typeFieldsRoot) {
  const data = {};
  const inputs = typeFieldsRoot.querySelectorAll("input,select,textarea");
  for (const el of inputs) {
    if (el.type === "checkbox") {
      data[el.name] = el.checked;
    } else {
      data[el.name] = el.value;
    }
  }
  return data;
}

function initGenerator(qrcodeFactory) {
  const qrLibStatus = $("#qrLibStatus");
  const genType = $("#genType");
  const typeFields = $("#typeFields");
  const payload = $("#payload");
  const payloadOverride = $("#payloadOverride");
  const payloadHint = $("#payloadHint");
  const ecc = $("#ecc");
  const version = $("#version");
  const scale = $("#scale");
  const quiet = $("#quiet");
  const fg = $("#fg");
  const bg = $("#bg");
  const qrPreview = $("#qrPreview");
  const qrMeta = $("#qrMeta");
  const canvas = $("#qrCanvas");
  const errorEl = $("#genError");
  const printArea = $("#printArea");
  const printQr = $("#printQr");

  const logoFile = $("#logoFile");
  const logoSize = $("#logoSize");
  const logoSizeLabel = $("#logoSizeLabel");
  const logoWhiteBg = $("#logoWhiteBg");

  let logoBitmap = null;

  const setLogoRatioLabel = () => {
    const ratio = clampNumber(logoSize.value, { min: 0, max: 0.35, fallback: 0 });
    setText(logoSizeLabel, `${Math.round(ratio * 100)}%`);
  };

  const getGenState = () => {
    const genFields = collectFields(typeFields);
    const type = genType.value;
    const built = buildPayload(type, genFields);
    const override = Boolean(payloadOverride?.checked);
    const finalPayload = override ? String(payload.value ?? "").trim() : built;

    return {
      type,
      builtPayload: built,
      payload: finalPayload,
      payloadOverride: override,
      ecc: String(ecc.value || "M").toUpperCase(),
      version: clampNumber(version.value, { min: 0, max: 40, fallback: 0 }),
      scale: clampNumber(scale.value, { min: 2, max: 40, fallback: 10 }),
      quiet: clampNumber(quiet.value, { min: 0, max: 12, fallback: 4 }),
      fg: normalizeHex(fg.value, "#0b1220"),
      bg: normalizeHex(bg.value, "#ffffff"),
      logo: {
        ratio: clampNumber(logoSize.value, { min: 0, max: 0.35, fallback: 0 }),
        whiteBg: Boolean(logoWhiteBg.checked),
      },
    };
  };

  const render = () => {
    const state = getGenState();

    payload.readOnly = !state.payloadOverride;
    if (!state.payloadOverride) payload.value = state.builtPayload;

    if (state.payloadOverride) {
      setText(payloadHint, t("generate.overrideHint"));
    } else {
      setText(payloadHint, state.type === "text" && isProbablyUrl(state.payload) ? t("generate.urlHint") : "");
    }

    showCallout(errorEl, "");

    if (!state.payload) {
      qrPreview.innerHTML = `<div class="muted">${t("generate.enterContent")}</div>`;
      setText(qrMeta, "—");
      return;
    }

    try {
      const qr = qrcodeFactory(state.version, state.ecc);
      qr.addData(state.payload);
      qr.make();

      const count = qr.getModuleCount();
      const dim = count + state.quiet * 2;
      setText(qrMeta, tf("generate.meta", { count, dim, ecc: state.ecc }));

      const svg = buildSvgFromQrMatrix(qr, {
        quietZone: state.quiet,
        fg: state.fg,
        bg: state.bg,
      });
      qrPreview.innerHTML = svg;

      renderQrToCanvas(qr, canvas, {
        scale: state.scale,
        quietZone: state.quiet,
        fg: state.fg,
        bg: state.bg,
      });
      drawLogoOnCanvas(canvas, {
        imageBitmap: logoBitmap,
        ratio: state.logo.ratio,
        whiteBg: state.logo.whiteBg,
      }).catch(() => {});
    } catch (error) {
      qrPreview.innerHTML = `<div class="muted">${t("generate.failed")}</div>`;
      setText(qrMeta, "—");
      showCallout(errorEl, tf("generate.failed") + `: ${error?.message || error}`);
    }
  };

  const updateLogoBitmap = async () => {
    const file = logoFile.files?.[0];
    if (!file) {
      logoBitmap?.close?.();
      logoBitmap = null;
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      logoBitmap?.close?.();
      logoBitmap = bitmap;
    } catch (error) {
      showCallout(errorEl, tf("generate.logoReadFailed", { error: error?.message || error }));
    }
  };

  genType.addEventListener("change", () => {
    mountTypeFields(typeFields, genType.value);
    render();
  });

  $("#genForm").addEventListener("input", () => {
    setLogoRatioLabel();
    render();
  });

  $("#copyPayload").addEventListener("click", async () => {
    const ok = await copyText(payload.value);
    showCallout(errorEl, ok ? "" : t("generate.copyFailed"));
  });

  logoFile.addEventListener("change", async () => {
    await updateLogoBitmap();
    render();
  });

  $("#downloadSvg").addEventListener("click", () => {
    const state = getGenState();
    if (!state.payload) return;

    try {
      const qr = qrcodeFactory(state.version, state.ecc);
      qr.addData(state.payload);
      qr.make();
      const svg = buildSvgFromQrMatrix(qr, {
        quietZone: state.quiet,
        fg: state.fg,
        bg: state.bg,
      });
      downloadBlob("qrcode.svg", new Blob([svg], { type: "image/svg+xml" }));
    } catch (error) {
      showCallout(errorEl, tf("generate.svgFailed", { error: error?.message || error }));
    }
  });

  $("#downloadPng").addEventListener("click", () => {
    if (!canvas.width || !canvas.height) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          showCallout(errorEl, t("generate.pngFailed"));
          return;
        }
        downloadBlob("qrcode.png", blob);
      },
      "image/png",
      0.92,
    );
  });

  $("#printSingle").addEventListener("click", () => {
    const state = getGenState();
    if (!state.payload) {
      showCallout(errorEl, t("generate.printNoPayload"));
      return;
    }

    try {
      if (!printArea || !printQr) throw new Error(t("generate.printAreaMissing"));

      const qr = qrcodeFactory(state.version, state.ecc);
      qr.addData(state.payload);
      qr.make();
      const svgText = buildSvgFromQrMatrix(qr, {
        quietZone: state.quiet,
        fg: state.fg,
        bg: state.bg,
      });
      const svgEl = parseSvgElement(svgText);

      printWithMode("single", {
        beforePrint: () => {
          printArea.hidden = false;
          printQr.replaceChildren(svgEl);
        },
        afterPrint: () => {
          printQr.replaceChildren();
          printArea.hidden = true;
        },
      });
    } catch (error) {
      showCallout(errorEl, tf("generate.printFailed", { error: error?.message || error }));
    }
  });

  mountTypeFields(typeFields, genType.value);
  setLogoRatioLabel();
  render();

  setText(qrLibStatus, t("site.engineReady"));
  qrLibStatus.classList.remove("pill--muted");

  return { rerender: render };
}

function initScanner() {
  const statusEl = $("#scanStatus");
  const resultEl = $("#scanResult");
  const errorEl = $("#scanError");
  const openLink = $("#openScan");

  const video = $("#scanVideo");
  const startBtn = $("#startScan");
  const stopBtn = $("#stopScan");
  const fileInput = $("#scanFile");

  let stream = null;
  let running = false;
  let detector = null;

  const setResult = async (text) => {
    resultEl.value = text || "";
    showCallout(errorEl, "");
    if (isProbablyUrl(text)) {
      openLink.hidden = false;
      openLink.href = text;
    } else {
      openLink.hidden = true;
      openLink.href = "#";
    }
  };

  const ensureDetector = async () => {
    if (detector) return detector;
    if (!("BarcodeDetector" in window)) throw new Error(t("scan.errorNotSupported"));

    const formats = await BarcodeDetector.getSupportedFormats();
    if (!formats.includes("qr_code")) throw new Error(t("scan.errorNoQrSupport"));

    detector = new BarcodeDetector({ formats: ["qr_code"] });
    return detector;
  };

  const stop = async () => {
    running = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    setText(statusEl, t("scan.statusStopped"));

    video.pause?.();
    video.srcObject = null;

    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
    }
    stream = null;
  };

  const loop = async () => {
    if (!running) return;

    try {
      const det = await ensureDetector();
      const results = await det.detect(video);
      if (results?.length) {
        const value = results[0]?.rawValue || "";
        await setResult(value);
      }
    } catch (error) {
      showCallout(errorEl, tf("scan.errorDetect", { error: error?.message || error }));
    } finally {
      setTimeout(loop, 120);
    }
  };

  startBtn.addEventListener("click", async () => {
    showCallout(errorEl, "");
    try {
      await ensureDetector();
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      video.srcObject = stream;
      await video.play();
      running = true;
      startBtn.disabled = true;
      stopBtn.disabled = false;
      setText(statusEl, t("scan.statusRunning"));
      loop();
    } catch (error) {
      await stop();
      showCallout(errorEl, tf("scan.errorCamera", { error: error?.message || error }));
    }
  });

  stopBtn.addEventListener("click", stop);

  fileInput.addEventListener("change", async () => {
    showCallout(errorEl, "");
    const file = fileInput.files?.[0];
    if (!file) return;

    let bitmap = null;
    try {
      const det = await ensureDetector();
      bitmap = await createImageBitmap(file);
      const results = await det.detect(bitmap);
      if (!results?.length) {
        showCallout(errorEl, t("scan.errorNoCode"));
        await setResult("");
        return;
      }
      await setResult(results[0].rawValue || "");
    } catch (error) {
      showCallout(errorEl, tf("scan.errorImage", { error: error?.message || error }));
    } finally {
      bitmap?.close?.();
    }
  });

  $("#copyScan").addEventListener("click", async () => {
    const ok = await copyText(resultEl.value);
    showCallout(errorEl, ok ? "" : t("scan.copyFailed"));
  });

  return { rerender: () => {} };
}

function parseBatchLines(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line) => {
    const commaIndex = line.indexOf(",");
    if (commaIndex === -1) return { label: "", value: line };
    return {
      label: line.slice(0, commaIndex).trim(),
      value: line.slice(commaIndex + 1).trim(),
    };
  });
}

function initBatch(qrcodeFactory) {
  const input = $("#batchInput");
  const buildBtn = $("#batchBuild");
  const printBtn = $("#batchPrint");
  const hintEl = $("#batchHint");
  const metaEl = $("#batchMeta");
  const errEl = $("#batchError");
  const gridEl = $("#batchGrid");

  const ecc = $("#batchEcc");
  const quiet = $("#batchQuiet");
  const cols = $("#batchCols");
  const cell = $("#batchCell");

  const build = () => {
    showCallout(errEl, "");
    gridEl.innerHTML = "";
    setText(metaEl, "—");
    setText(hintEl, "");
    printBtn.disabled = true;

    const items = parseBatchLines(input.value);
    if (!items.length) {
      setText(hintEl, t("batch.noContent"));
      return;
    }

    const eccValue = String(ecc.value || "M").toUpperCase();
    const quietValue = clampNumber(quiet.value, { min: 0, max: 12, fallback: 4 });
    const colsValue = clampNumber(cols.value, { min: 2, max: 8, fallback: 4 });
    const cellValue = clampNumber(cell.value, { min: 2, max: 20, fallback: 6 });

    gridEl.style.gridTemplateColumns = `repeat(${colsValue}, minmax(0, 1fr))`;

    try {
      for (const item of items) {
        const qr = qrcodeFactory(0, eccValue);
        qr.addData(item.value);
        qr.make();

        const svg = buildSvgFromQrMatrix(qr, {
          quietZone: quietValue,
          fg: "#000000",
          bg: "#ffffff",
        });

        const wrap = document.createElement("div");
        wrap.className = "batch-item";

        const label = document.createElement("div");
        label.className = "batch-label";
        label.textContent = item.label || item.value;

        const svgEl = parseSvgElement(svg);
        svgEl.style.width = `${(qr.getModuleCount() + quietValue * 2) * cellValue}px`;

        wrap.append(svgEl, label);
        gridEl.append(wrap);
      }

      setText(metaEl, tf("batch.meta", { count: items.length, ecc: eccValue }));
      printBtn.disabled = false;
    } catch (error) {
      showCallout(errEl, tf("batch.failed", { error: error?.message || error }));
    }
  };

  buildBtn.addEventListener("click", build);
  printBtn.addEventListener("click", () => printWithMode("batch"));

  return { rerender: build };
}

async function main() {
  initTabs();

  const status = $("#qrLibStatus");

  const scanner = initScanner();

  let modules = [];
  try {
    const qrcodeFactory = await loadQrFactory();
    modules = [
      initGenerator(qrcodeFactory),
      initBatch(qrcodeFactory),
      scanner,
      window.mergeModule?.init?.(qrcodeFactory) ?? { rerender: () => {} },
    ];

    setText(status, t("site.engineReady"));
    status.classList.remove("pill--muted");
  } catch (error) {
    setText(status, t("site.engineUnavailable"));
    status.classList.add("pill--muted");
    console.error(error);
    showCallout(
      $("#genError"),
      `QR code engine failed to load.\n\nError: ${error?.message || error}\n\nOffline solution: Download qrcode-generator ESM file to src/vendor/qrcode-generator.mjs`,
    );
    modules = [scanner];
  }

  window.addEventListener("i18n-changed", () => {
    for (const module of modules) {
      module?.rerender?.();
    }
  });
}

main();

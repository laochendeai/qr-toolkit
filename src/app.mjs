const $ = (selector, root = document) => root.querySelector(selector);

function getI18n(key) {
  if (window.i18n && window.i18n.getTranslation) {
    return window.i18n.getTranslation(key, 'en');
  }
  // Fallback English translations
  const fallbacks = {
    'wifi.security': 'Security',
    'wifi.wpa': 'WPA/WPA2',
    'wifi.wep': 'WEP',
    'wifi.nopass': 'No Password',
    'wifi.hidden': 'Hidden Network (H)',
    'wifi.ssid': 'Wi-Fi Name (SSID)',
    'wifi.password': 'Password',
    'tel.label': 'Phone Number',
    'tel.placeholder': '+86...',
    'email.to': 'Recipient',
    'email.toPlaceholder': 'name@example.com',
    'email.subject': 'Subject (Optional)',
    'email.body': 'Body (Optional)',
    'sms.to': 'Recipient Phone Number',
    'sms.body': 'SMS Content (Optional)',
    'geo.lat': 'Latitude (lat)',
    'geo.lng': 'Longitude (lng)',
    'geo.latPlaceholder': '31.2304',
    'geo.lngPlaceholder': '121.4737',
    'geo.query': 'Query (Optional)',
    'geo.queryPlaceholder': 'e.g., coffee shop',
    'vcard.name': 'Name (FN)',
    'vcard.org': 'Organization (ORG)',
    'vcard.title': 'Title (TITLE)',
    'vcard.tel': 'Phone (TEL)',
    'vcard.email': 'Email (EMAIL)',
    'vcard.url': 'Website (URL)',
    'vcard.adr': 'Address (ADR, Optional)',
    'vcard.note': 'Note (NOTE, Optional)',
    'text.placeholder': 'e.g., https://example.com or any text',
    'generate.enterContent': 'Please enter content to generate QR code',
    'generate.failed': 'Generation failed',
    'batch.noContent': 'Please enter at least one line'
  };
  return fallbacks[key] || key;
}

function setText(el, text) {
  el.textContent = String(text ?? "");
}

function showCallout(el, message) {
  if (!el) return;
  if (!message) {
    el.hidden = true;
    el.textContent = "";
    return;
  }
  el.hidden = false;
  el.textContent = message;
}

async function copyText(text) {
  const value = String(text ?? "");
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      return true;
    } finally {
      ta.remove();
    }
  }
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function parseSvgElement(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(svgText ?? ""), "image/svg+xml");
  if (doc.querySelector("parsererror")) throw new Error("SVG 解析失败");
  const svg = doc.documentElement;
  if (!svg || svg.nodeName.toLowerCase() !== "svg") throw new Error("SVG 解析失败");
  return document.importNode(svg, true);
}

function printWithMode(mode, { beforePrint, afterPrint } = {}) {
  const body = document.body;
  let cleaned = false;

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    try {
      afterPrint?.();
    } finally {
      delete body.dataset.print;
    }
  };

  const onAfterPrint = () => cleanup();
  const onFocus = () => setTimeout(cleanup, 250);

  window.addEventListener("afterprint", onAfterPrint, { once: true });
  window.addEventListener("focus", onFocus, { once: true });

  body.dataset.print = String(mode || "");

  try {
    beforePrint?.();
  } catch (err) {
    cleanup();
    throw err;
  }

  setTimeout(() => {
    try {
      window.print();
    } catch {
      cleanup();
    }
  }, 0);
}

function clampNumber(value, { min, max, fallback }) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.min(max, Math.max(min, numberValue));
}

function normalizeHex(hex, fallback) {
  const s = String(hex || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s;
  return fallback;
}

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
      const escapeWifi = (s) => String(s ?? "").replaceAll("\\", "\\\\").replaceAll(";", "\\;");
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
      const q = String(fields.q ?? "").trim();
      if (q) return `geo:${lat},${lng}?q=${encodeURIComponent(q)}`;
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
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
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
    `</svg>`
  );
}

function renderQrToCanvas(qr, canvas, { scale, quietZone, fg, bg }) {
  const count = qr.getModuleCount();
  const margin = quietZone * scale;
  const size = count * scale + margin * 2;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("无法创建 Canvas 画布");
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = fg;
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
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
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    const w = logoSize + pad * 2;
    const h = logoSize + pad * 2;
    const rx = x - pad;
    const ry = y - pad;
    const rr = Math.min(r, w / 2, h / 2);
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
  const w = Math.floor(imageBitmap.width * scale);
  const h = Math.floor(imageBitmap.height * scale);
  const dx = Math.floor(x + (logoSize - w) / 2);
  const dy = Math.floor(y + (logoSize - h) / 2);
  ctx.drawImage(imageBitmap, dx, dy, w, h);
}

async function loadQrFactory() {
  const candidates = ["./vendor/qrcode-generator.mjs", "https://unpkg.com/qrcode-generator@2.0.4/dist/qrcode.mjs"];
  let lastError;
  for (const url of candidates) {
    try {
      const mod = await import(url);
      if (!mod?.qrcode) throw new Error(`模块缺少 qrcode 导出：${url}`);
      return mod.qrcode;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("无法加载二维码引擎");
}

function initTabs() {
  const tabButtons = Array.from(document.querySelectorAll(".tab"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));

  function setActive(tabId) {
    for (const btn of tabButtons) btn.classList.toggle("is-active", btn.dataset.tab === tabId);
    for (const panel of panels) panel.classList.toggle("is-active", panel.id === `tab-${tabId}`);
    history.replaceState(null, "", `#${tabId}`);
  }

  for (const btn of tabButtons) {
    btn.addEventListener("click", () => setActive(btn.dataset.tab));
  }

  const initial = location.hash?.slice(1);
  if (initial && tabButtons.some((b) => b.dataset.tab === initial)) setActive(initial);
}

function mountTypeFields(container, type) {
  container.innerHTML = "";

  const mkInput = ({ id, label, placeholder = "", type = "text" }) => {
    const wrap = document.createElement("div");
    wrap.className = "field";
    const lab = document.createElement("label");
    lab.setAttribute("for", id);
    lab.textContent = label;
    const input = document.createElement("input");
    input.id = id;
    input.name = id;
    input.type = type;
    input.placeholder = placeholder;
    wrap.append(lab, input);
    return wrap;
  };

  const mkTextarea = ({ id, label, placeholder = "", rows = 4 }) => {
    const wrap = document.createElement("div");
    wrap.className = "field";
    const lab = document.createElement("label");
    lab.setAttribute("for", id);
    lab.textContent = label;
    const input = document.createElement("textarea");
    input.id = id;
    input.name = id;
    input.rows = rows;
    input.placeholder = placeholder;
    input.spellcheck = false;
    wrap.append(lab, input);
    return wrap;
  };

  if (type === "text") {
    container.append(
      mkTextarea({
        id: "text",
        label: getI18n("text.label"),
        rows: 5,
        placeholder: getI18n("text.placeholder"),
      }),
    );
    return;
  }

  if (type === "wifi") {
    const grid = document.createElement("div");
    grid.className = "grid-2";
    grid.append(
      mkInput({ id: "ssid", label: getI18n("wifi.ssid") }),
      mkInput({ id: "password", label: getI18n("wifi.password"), type: "password" }),
    );
    const security = document.createElement("div");
    security.className = "field";
    const lab = document.createElement("label");
    lab.setAttribute("for", "security");
    lab.textContent = getI18n("wifi.security");
    const sel = document.createElement("select");
    sel.id = "security";
    sel.name = "security";
    sel.innerHTML = `
      <option value="WPA" selected>${getI18n("wifi.wpa")}</option>
      <option value="WEP">${getI18n("wifi.wep")}</option>
      <option value="nopass">${getI18n("wifi.nopass")}</option>
    `;
    security.append(lab, sel);

    const hiddenWrap = document.createElement("label");
    hiddenWrap.className = "checkbox";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = "hidden";
    cb.name = "hidden";
    const span = document.createElement("span");
    span.textContent = getI18n("wifi.hidden");
    hiddenWrap.append(cb, span);

    container.append(grid, security, hiddenWrap);
    return;
  }

  if (type === "tel") {
    container.append(mkInput({ id: "tel", label: getI18n("tel.label"), placeholder: getI18n("tel.placeholder") }));
    return;
  }

  if (type === "email") {
    container.append(
      mkInput({ id: "to", label: getI18n("email.to"), placeholder: getI18n("email.toPlaceholder") }),
      mkInput({ id: "subject", label: getI18n("email.subject") }),
      mkTextarea({ id: "body", label: getI18n("email.body"), rows: 4 }),
    );
    return;
  }

  if (type === "sms") {
    container.append(
      mkInput({ id: "to", label: getI18n("sms.to") }),
      mkTextarea({ id: "body", label: getI18n("sms.body"), rows: 4 }),
    );
    return;
  }

  if (type === "geo") {
    const grid = document.createElement("div");
    grid.className = "grid-2";
    grid.append(mkInput({ id: "lat", label: getI18n("geo.lat"), placeholder: getI18n("geo.latPlaceholder") }), mkInput({ id: "lng", label: getI18n("geo.lng"), placeholder: getI18n("geo.lngPlaceholder") }));
    container.append(grid, mkInput({ id: "q", label: getI18n("geo.query"), placeholder: getI18n("geo.queryPlaceholder") }));
    return;
  }

  if (type === "vcard") {
    const grid = document.createElement("div");
    grid.className = "grid-2";
    grid.append(mkInput({ id: "name", label: getI18n("vcard.name") }), mkInput({ id: "org", label: getI18n("vcard.org") }));
    container.append(
      grid,
      mkInput({ id: "title", label: getI18n("vcard.title") }),
      mkInput({ id: "tel", label: getI18n("vcard.tel") }),
      mkInput({ id: "email", label: getI18n("vcard.email") }),
      mkInput({ id: "url", label: getI18n("vcard.url") }),
      mkTextarea({ id: "adr", label: getI18n("vcard.adr"), rows: 2 }),
      mkTextarea({ id: "note", label: getI18n("vcard.note"), rows: 3 }),
    );
  }
}

function collectFields(typeFieldsRoot) {
  const data = {};
  const inputs = typeFieldsRoot.querySelectorAll("input,select,textarea");
  for (const el of inputs) {
    if (el.type === "checkbox") data[el.name] = el.checked;
    else data[el.name] = el.value;
  }
  return data;
}

function isProbablyUrl(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
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

  const ensureUtf8 = () => {
    if (!qrcodeFactory) return;
    try {
      qrcodeFactory.stringToBytes = (s) => Array.from(new TextEncoder().encode(String(s ?? "")));
    } catch {
      // ignore
    }
  };
  ensureUtf8();

  const setLogoRatioLabel = () => {
    const ratio = clampNumber(logoSize.value, { min: 0, max: 0.35, fallback: 0 });
    setText(logoSizeLabel, `${Math.round(ratio * 100)}%`);
  };
  setLogoRatioLabel();

  async function updateLogoBitmap() {
    const file = logoFile.files?.[0];
    if (!file) {
      logoBitmap?.close?.();
      logoBitmap = null;
      return;
    }
    try {
      const bmp = await createImageBitmap(file);
      logoBitmap?.close?.();
      logoBitmap = bmp;
    } catch (err) {
      showCallout(errorEl, `Logo 图片无法读取：${err?.message || err}`);
    }
  }

  function getGenState() {
    const genFields = collectFields(typeFields);
    const type = genType.value;
    const built = buildPayload(type, genFields);
    const override = !!payloadOverride?.checked;
    const finalPayload = override ? String(payload.value ?? "").trim() : built;

    const eccValue = String(ecc.value || "M").toUpperCase();
    const versionValue = clampNumber(version.value, { min: 0, max: 40, fallback: 0 });
    const scaleValue = clampNumber(scale.value, { min: 2, max: 40, fallback: 10 });
    const quietValue = clampNumber(quiet.value, { min: 0, max: 12, fallback: 4 });
    const fgValue = normalizeHex(fg.value, "#0b1220");
    const bgValue = normalizeHex(bg.value, "#ffffff");

    const logoRatio = clampNumber(logoSize.value, { min: 0, max: 0.35, fallback: 0 });
    const whiteBg = !!logoWhiteBg.checked;

    return {
      type,
      fields: genFields,
      builtPayload: built,
      payload: finalPayload,
      payloadOverride: override,
      ecc: eccValue,
      version: versionValue,
      scale: scaleValue,
      quiet: quietValue,
      fg: fgValue,
      bg: bgValue,
      logo: { ratio: logoRatio, whiteBg },
    };
  }

  function render() {
    const state = getGenState();
    payload.readOnly = !state.payloadOverride;
    if (!state.payloadOverride) payload.value = state.builtPayload;

    if (state.payloadOverride) {
      setText(payloadHint, "已手动覆盖：类型字段不再自动同步。");
    } else {
      setText(payloadHint, state.type === "text" && isProbablyUrl(state.payload) ? "看起来是 URL，可扫码直接打开。" : "");
    }
    showCallout(errorEl, "");

    if (!state.payload) {
      qrPreview.innerHTML = `<div class="muted">请输入内容以生成二维码</div>`;
      setText(qrMeta, "—");
      return;
    }

    try {
      const qr = qrcodeFactory(state.version, state.ecc);
      qr.addData(state.payload);
      qr.make();

      const count = qr.getModuleCount();
      const dim = count + state.quiet * 2;
      setText(qrMeta, `${count}×${count} 模块 · 视图 ${dim}×${dim} · ECC ${state.ecc}`);

      const svg = buildSvgFromQrMatrix(qr, { quietZone: state.quiet, fg: state.fg, bg: state.bg });
      qrPreview.innerHTML = svg;

      renderQrToCanvas(qr, canvas, { scale: state.scale, quietZone: state.quiet, fg: state.fg, bg: state.bg });
      drawLogoOnCanvas(canvas, { imageBitmap: logoBitmap, ratio: state.logo.ratio, whiteBg: state.logo.whiteBg }).catch(() => {});
    } catch (err) {
      qrPreview.innerHTML = `<div class="muted">${getI18n("generate.failed")}</div>;
      setText(qrMeta, "—");
      showCallout(errorEl, `生成失败：${err?.message || err}`);
    }
  }

  genType.addEventListener("change", () => {
    mountTypeFields(typeFields, genType.value);
    render();
  });
  mountTypeFields(typeFields, genType.value);

  $("#genForm").addEventListener("input", () => {
    setLogoRatioLabel();
    render();
  });

  $("#copyPayload").addEventListener("click", async () => {
    const ok = await copyText(payload.value);
    showCallout(errorEl, ok ? "" : "复制失败：浏览器禁止访问剪贴板");
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
      const svg = buildSvgFromQrMatrix(qr, { quietZone: state.quiet, fg: state.fg, bg: state.bg });
      downloadBlob("qrcode.svg", new Blob([svg], { type: "image/svg+xml" }));
    } catch (err) {
      showCallout(errorEl, `导出 SVG 失败：${err?.message || err}`);
    }
  });

  $("#downloadPng").addEventListener("click", () => {
    if (!canvas.width || !canvas.height) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          showCallout(errorEl, "导出 PNG 失败：无法创建图片");
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
      showCallout(errorEl, "请输入内容后再打印。");
      return;
    }

    try {
      if (!printArea || !printQr) throw new Error("打印区域缺失");

      const qr = qrcodeFactory(state.version, state.ecc);
      qr.addData(state.payload);
      qr.make();
      const svgText = buildSvgFromQrMatrix(qr, { quietZone: state.quiet, fg: state.fg, bg: state.bg });
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
    } catch (err) {
      showCallout(errorEl, `打印失败：${err?.message || err}`);
    }
  });

  render();
  setText(qrLibStatus, "QR 引擎：就绪");
  qrLibStatus.classList.remove("pill--muted");
  qrLibStatus.classList.add("pill");
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
    if (!("BarcodeDetector" in window)) throw new Error("当前浏览器不支持 BarcodeDetector");
    const formats = await BarcodeDetector.getSupportedFormats();
    if (!formats.includes("qr_code")) throw new Error("当前浏览器不支持识别 QR Code");
    detector = new BarcodeDetector({ formats: ["qr_code"] });
    return detector;
  };

  async function stop() {
    running = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    setText(statusEl, "状态：已停止");
    if (video) {
      video.pause?.();
      video.srcObject = null;
    }
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
    }
    stream = null;
  }

  async function loop() {
    if (!running) return;
    try {
      const det = await ensureDetector();
      const results = await det.detect(video);
      if (results?.length) {
        const value = results[0]?.rawValue || "";
        await setResult(value);
      }
    } catch (err) {
      showCallout(errorEl, `识别失败：${err?.message || err}`);
    } finally {
      setTimeout(loop, 120);
    }
  }

  startBtn.addEventListener("click", async () => {
    showCallout(errorEl, "");
    try {
      await ensureDetector();
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      video.srcObject = stream;
      await video.play();
      running = true;
      startBtn.disabled = true;
      stopBtn.disabled = false;
      setText(statusEl, "状态：识别中…");
      loop();
    } catch (err) {
      await stop();
      showCallout(errorEl, `无法启动摄像头：${err?.message || err}`);
    }
  });

  stopBtn.addEventListener("click", stop);

  fileInput.addEventListener("change", async () => {
    showCallout(errorEl, "");
    const file = fileInput.files?.[0];
    if (!file) return;
    let bmp = null;
    try {
      const det = await ensureDetector();
      bmp = await createImageBitmap(file);
      const results = await det.detect(bmp);
      if (!results?.length) {
        showCallout(errorEl, "未识别到二维码。");
        await setResult("");
        return;
      }
      await setResult(results[0].rawValue || "");
    } catch (err) {
      showCallout(errorEl, `图片识别失败：${err?.message || err}`);
    } finally {
      bmp?.close?.();
    }
  });

  $("#copyScan").addEventListener("click", async () => {
    const ok = await copyText(resultEl.value);
    showCallout(errorEl, ok ? "" : "复制失败：浏览器禁止访问剪贴板");
  });
}

function parseBatchLines(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((line) => {
    const idx = line.indexOf(",");
    if (idx === -1) return { label: "", value: line };
    const label = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    return { label, value };
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

  function build() {
    showCallout(errEl, "");
    gridEl.innerHTML = "";
    setText(metaEl, "—");
    setText(hintEl, "");
    printBtn.disabled = true;

    const items = parseBatchLines(input.value);
    if (!items.length) {
      setText(hintEl, "请输入至少一行内容。");
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
        const svg = buildSvgFromQrMatrix(qr, { quietZone: quietValue, fg: "#000000", bg: "#ffffff" });
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
      setText(metaEl, `${items.length} 个 · ECC ${eccValue}`);
      printBtn.disabled = false;
    } catch (err) {
      showCallout(errEl, `批量生成失败：${err?.message || err}`);
    }
  }

  buildBtn.addEventListener("click", build);
  printBtn.addEventListener("click", () => printWithMode("batch"));
}

async function main() {
  initTabs();

  const status = $("#qrLibStatus");
  try {
    const qrcodeFactory = await loadQrFactory();
    initGenerator(qrcodeFactory);
    initBatch(qrcodeFactory);
    setText(status, getI18n("site.engineReady"));
  } catch (err) {
    setText(status, getI18n("site.engineLoading") + " - Unavailable");
    status.classList.add("pill--muted");
    console.error(err);
    showCallout($("#genError"), `QR code engine failed to load. May be offline or CDN unreachable.\n\nError: ${err?.message || err}\n\nOffline solution: Download qrcode-generator ESM file to src/vendor/qrcode-generator.mjs`);
  }

  initScanner();

  // 监听语言变化事件
  window.addEventListener('i18n-changed', () => {
    console.log('Language changed, re-rendering...');
    // 重新触发当前 tab 的 render
    const activeTab = document.querySelector('.tab.is-active');
    if (activeTab) {
      const tabId = activeTab.getAttribute('data-tab');
      if (tabId === 'generate') {
        render();
      } else if (tabId === 'batch') {
        buildBatchPreview();
      }
    }
  });
}

main();

import { $, downloadBlob, showCallout } from "./core/dom.mjs";
import { t, tf } from "./core/i18n.mjs";

const MAX_CODES = 4;
const GRID_COLS = 2;

let mergeCodes = [];
let lastPreviewCanvas = null;
let lastPreviewSvg = "";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getMergeErrorEl() {
  return $("#mergeError");
}

function clearError() {
  showCallout(getMergeErrorEl(), "");
}

function showError(message) {
  showCallout(getMergeErrorEl(), message);
}

function ensureGridModeOnly() {
  const modeSelect = $("#mergeMode");
  if (!modeSelect) return;

  modeSelect.innerHTML = `<option value="grid" selected>${t("merge.modeGrid")}</option>`;
  modeSelect.disabled = true;

  const modeHint = document.querySelector('[data-i18n="merge.modeDescription"]');
  if (modeHint) {
    modeHint.textContent = t("merge.modeDescription");
  }
}

function updateButtons() {
  const generateBtn = $("#generateMerge");
  const downloadSvgBtn = $("#downloadMergeSvg");
  const downloadPngBtn = $("#downloadMergePng");

  const hasEnoughCodes = mergeCodes.length >= 2;
  if (generateBtn) generateBtn.disabled = !hasEnoughCodes;
  if (downloadSvgBtn) downloadSvgBtn.disabled = !lastPreviewSvg;
  if (downloadPngBtn) downloadPngBtn.disabled = !lastPreviewCanvas;
}

function renderMergeList() {
  const list = $("#mergeList");
  if (!list) return;

  if (!mergeCodes.length) {
    list.innerHTML = `<div class="merge-empty">${t("merge.uploadHint")}</div>`;
    return;
  }

  list.innerHTML = mergeCodes
    .map((code, index) => {
      const placeholder = escapeHtml(t("merge.labelPlaceholder"));
      const label = escapeHtml(code.label);
      const fallbackAlt = escapeHtml(tf("merge.labelFallback", { index: index + 1 }));
      const removeText = escapeHtml(t("merge.removeCode", "Remove"));
      return `
        <div class="merge-item" data-id="${code.id}">
          <div class="merge-item-header">
            <input
              type="text"
              class="merge-item-label"
              data-id="${code.id}"
              placeholder="${placeholder}"
              value="${label}"
            >
            <button type="button" class="merge-item-remove" data-remove-id="${code.id}">
              ${removeText}
            </button>
          </div>
          <img src="${code.data}" class="merge-item-preview" alt="${fallbackAlt}">
        </div>
      `;
    })
    .join("");

  list.querySelectorAll(".merge-item-label").forEach((input) => {
    input.addEventListener("input", (event) => {
      const id = Number(event.currentTarget.getAttribute("data-id"));
      const item = mergeCodes.find((entry) => entry.id === id);
      if (item) item.label = event.currentTarget.value;
    });
  });

  list.querySelectorAll(".merge-item-remove").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.getAttribute("data-remove-id"));
      mergeCodes = mergeCodes.filter((entry) => entry.id !== id);
      lastPreviewCanvas = null;
      lastPreviewSvg = "";
      renderMergeList();
      updateButtons();
    });
  });
}

async function addQrCode() {
  if (mergeCodes.length >= MAX_CODES) {
    showError(t("merge.errorTooManyCodes"));
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageData = await readImage(file);
      mergeCodes.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        data: imageData,
        label: "",
      });
      if (mergeCodes.length > MAX_CODES) {
        mergeCodes = mergeCodes.slice(0, MAX_CODES);
      }

      clearError();
      lastPreviewCanvas = null;
      lastPreviewSvg = "";
      renderMergeList();
      updateButtons();
    } catch {
      showError(t("merge.errorInvalidImage"));
    }
  };

  input.click();
}

function canvasToSvgPreview(canvas, labels) {
  const width = canvas.width;
  const height = canvas.height;
  const imageData = canvas.toDataURL("image/png");

  const textNodes = labels
    .map((label) => {
      const text = escapeHtml(label.text);
      return `<text x="${label.x}" y="${label.y}" text-anchor="middle" font-size="14" fill="#111827">${text}</text>`;
    })
    .join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="#ffffff"/>` +
    `<image href="${imageData}" width="${width}" height="${height}"/>` +
    textNodes +
    "</svg>"
  );
}

async function drawMergedGrid() {
  if (mergeCodes.length < 2) {
    showError(t("merge.errorNoCodes"));
    return;
  }

  const preview = $("#mergePreview");
  if (!preview) return;

  const rows = Math.ceil(mergeCodes.length / GRID_COLS);
  const qrSize = 220;
  const padding = 24;
  const labelHeight = 26;

  const canvas = document.createElement("canvas");
  canvas.width = GRID_COLS * (qrSize + padding) + padding;
  canvas.height = rows * (qrSize + labelHeight + padding) + padding;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    showError(tf("merge.errorGenerate", { error: "Canvas is unavailable" }));
    return;
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const labelPositions = [];

  try {
    for (let i = 0; i < mergeCodes.length; i += 1) {
      const code = mergeCodes[i];
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      const x = padding + col * (qrSize + padding);
      const y = padding + row * (qrSize + labelHeight + padding);

      const img = new Image();
      img.src = code.data;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      ctx.drawImage(img, x, y, qrSize, qrSize);
      ctx.fillStyle = "#111827";
      ctx.font = "600 14px sans-serif";
      ctx.textAlign = "center";

      const labelText = code.label?.trim() || tf("merge.labelFallback", { index: i + 1 });
      const labelX = x + qrSize / 2;
      const labelY = y + qrSize + 18;
      ctx.fillText(labelText, labelX, labelY);
      labelPositions.push({ text: labelText, x: labelX, y: labelY });
    }

    preview.innerHTML = "";
    const result = document.createElement("img");
    result.src = canvas.toDataURL("image/png");
    result.style.maxWidth = "100%";
    result.alt = t("merge.preview", "Merged QR Preview");
    preview.append(result);

    lastPreviewCanvas = canvas;
    lastPreviewSvg = canvasToSvgPreview(canvas, labelPositions);
    clearError();
    updateButtons();
  } catch (error) {
    showError(tf("merge.errorGenerate", { error: error?.message || error }));
  }
}

function downloadMergedSvg() {
  if (!lastPreviewSvg) {
    showError(t("merge.errorSvgUnsupported"));
    return;
  }

  downloadBlob("merged-qr-grid.svg", new Blob([lastPreviewSvg], { type: "image/svg+xml" }));
}

function downloadMergedPng() {
  if (!lastPreviewCanvas) {
    showError(t("merge.errorNothingToDownload"));
    return;
  }

  try {
    const png = lastPreviewCanvas.toDataURL("image/png");
    const binary = atob(png.split(",")[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      array[i] = binary.charCodeAt(i);
    }
    downloadBlob("merged-qr-grid.png", new Blob([array], { type: "image/png" }));
  } catch (error) {
    showError(tf("merge.errorPng", { error: error?.message || error }));
  }
}

function bindEvents() {
  const addBtn = $("#addMergeCode");
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.addEventListener("click", addQrCode);
    addBtn.dataset.bound = "true";
  }

  const generateBtn = $("#generateMerge");
  if (generateBtn && !generateBtn.dataset.bound) {
    generateBtn.addEventListener("click", drawMergedGrid);
    generateBtn.dataset.bound = "true";
  }

  const downloadSvgBtn = $("#downloadMergeSvg");
  if (downloadSvgBtn && !downloadSvgBtn.dataset.bound) {
    downloadSvgBtn.addEventListener("click", downloadMergedSvg);
    downloadSvgBtn.dataset.bound = "true";
  }

  const downloadPngBtn = $("#downloadMergePng");
  if (downloadPngBtn && !downloadPngBtn.dataset.bound) {
    downloadPngBtn.addEventListener("click", downloadMergedPng);
    downloadPngBtn.dataset.bound = "true";
  }
}

function rerender() {
  ensureGridModeOnly();
  renderMergeList();
  updateButtons();
}

function init() {
  ensureGridModeOnly();
  bindEvents();
  rerender();
  return { rerender };
}

window.mergeModule = { init };

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    rerender();
  });
} else {
  bindEvents();
  rerender();
}

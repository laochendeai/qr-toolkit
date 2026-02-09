export const $ = (selector, root = document) => root.querySelector(selector);

export function setText(el, text) {
  if (!el) return;
  el.textContent = String(text ?? "");
}

export function showCallout(el, message) {
  if (!el) return;
  if (!message) {
    el.hidden = true;
    el.textContent = "";
    return;
  }
  el.hidden = false;
  el.textContent = String(message);
}

export async function copyText(text) {
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

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseSvgElement(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(svgText ?? ""), "image/svg+xml");
  if (doc.querySelector("parsererror")) throw new Error("Invalid SVG");
  const svg = doc.documentElement;
  if (!svg || svg.nodeName.toLowerCase() !== "svg") throw new Error("Invalid SVG");
  return document.importNode(svg, true);
}

export function printWithMode(mode, { beforePrint, afterPrint } = {}) {
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
  } catch (error) {
    cleanup();
    throw error;
  }

  setTimeout(() => {
    try {
      window.print();
    } catch {
      cleanup();
    }
  }, 0);
}

export function clampNumber(value, { min, max, fallback }) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.min(max, Math.max(min, numberValue));
}

export function normalizeHex(hex, fallback) {
  const text = String(hex || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(text)) return text;
  return fallback;
}

export function isProbablyUrl(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const FALLBACK_TEXT = {
  en: {
    "site.engineLoading": "QR Engine: Loading…",
    "site.engineReady": "QR Engine: Ready",
    "site.engineUnavailable": "QR Engine: Unavailable",
    "generate.overrideHint": "Manual override enabled: type fields no longer sync.",
    "generate.urlHint": "Looks like a URL. You can open it directly after scanning.",
    "generate.enterContent": "Please enter content to generate QR code",
    "generate.failed": "Generation failed",
    "generate.meta": "{count}×{count} modules · View {dim}×{dim} · ECC {ecc}",
    "generate.copyFailed": "Copy failed: clipboard access is blocked",
    "generate.svgFailed": "SVG export failed: {error}",
    "generate.pngFailed": "PNG export failed: unable to create image",
    "generate.printNoPayload": "Please enter content before printing.",
    "generate.printAreaMissing": "Print area is missing",
    "generate.printFailed": "Print failed: {error}",
    "generate.logoReadFailed": "Cannot read logo image: {error}",
    "scan.statusStopped": "Status: Stopped",
    "scan.statusRunning": "Status: Scanning…",
    "scan.errorNotSupported": "Your browser doesn't support BarcodeDetector. Please use Chrome, Edge, or Safari.",
    "scan.errorNoQrSupport": "Your browser doesn't support QR code detection.",
    "scan.errorDetect": "Detection failed: {error}",
    "scan.errorCamera": "Cannot start camera: {error}",
    "scan.errorNoCode": "No QR code detected in the image.",
    "scan.errorImage": "Image scan failed: {error}",
    "scan.copyFailed": "Copy failed: clipboard access is blocked",
    "batch.noContent": "Please enter at least one line",
    "batch.meta": "{count} items · ECC {ecc}",
    "batch.failed": "Batch generation failed: {error}",
    "merge.uploadHint": "Upload 2-4 QR code images to merge",
    "merge.labelPlaceholder": "Label (e.g., WeChat Pay, Alipay)",
    "merge.labelFallback": "QR {index}",
    "merge.errorNoCodes": "Please upload at least 2 QR code images.",
    "merge.errorTooManyCodes": "You can upload up to 4 QR code images.",
    "merge.errorInvalidImage": "Invalid image file. Please upload QR code images.",
    "merge.errorGenerate": "Failed to generate merged image: {error}",
    "merge.errorNothingToDownload": "Generate merged preview first.",
    "merge.errorSvgUnsupported": "SVG download is available only after generating SVG preview.",
    "merge.errorPng": "PNG download failed: {error}",
    "merge.modeGrid": "Grid Layout (Best for sharing)",
    "merge.modeDescription": "Generate one combined image containing all uploaded QR codes.",
  },
  zh: {
    "site.engineLoading": "QR 引擎：加载中…",
    "site.engineReady": "QR 引擎：就绪",
    "site.engineUnavailable": "QR 引擎：不可用",
    "generate.overrideHint": "已手动覆盖：类型字段不再自动同步。",
    "generate.urlHint": "看起来是 URL，可扫码直接打开。",
    "generate.enterContent": "请输入内容以生成二维码",
    "generate.failed": "生成失败",
    "generate.meta": "{count}×{count} 模块 · 视图 {dim}×{dim} · ECC {ecc}",
    "generate.copyFailed": "复制失败：浏览器禁止访问剪贴板",
    "generate.svgFailed": "导出 SVG 失败：{error}",
    "generate.pngFailed": "导出 PNG 失败：无法创建图片",
    "generate.printNoPayload": "请输入内容后再打印。",
    "generate.printAreaMissing": "打印区域缺失",
    "generate.printFailed": "打印失败：{error}",
    "generate.logoReadFailed": "Logo 图片无法读取：{error}",
    "scan.statusStopped": "状态：已停止",
    "scan.statusRunning": "状态：识别中…",
    "scan.errorNotSupported": "您的浏览器不支持 BarcodeDetector。请使用 Chrome、Edge 或 Safari。",
    "scan.errorNoQrSupport": "当前浏览器不支持识别二维码。",
    "scan.errorDetect": "识别失败：{error}",
    "scan.errorCamera": "无法启动摄像头：{error}",
    "scan.errorNoCode": "未识别到二维码。",
    "scan.errorImage": "图片识别失败：{error}",
    "scan.copyFailed": "复制失败：浏览器禁止访问剪贴板",
    "batch.noContent": "请至少输入一行内容。",
    "batch.meta": "{count} 个 · ECC {ecc}",
    "batch.failed": "批量生成失败：{error}",
    "merge.uploadHint": "上传 2-4 个二维码图片进行合并",
    "merge.labelPlaceholder": "标签（如：微信支付、支付宝）",
    "merge.labelFallback": "二维码 {index}",
    "merge.errorNoCodes": "请至少上传 2 个二维码图片。",
    "merge.errorTooManyCodes": "最多可上传 4 个二维码图片。",
    "merge.errorInvalidImage": "无效的图片文件。请上传二维码图片。",
    "merge.errorGenerate": "生成合并图片失败：{error}",
    "merge.errorNothingToDownload": "请先生成合并预览。",
    "merge.errorSvgUnsupported": "当前预览不支持下载 SVG。",
    "merge.errorPng": "下载 PNG 失败：{error}",
    "merge.modeGrid": "网格布局模式（适合分享）",
    "merge.modeDescription": "生成一张包含所有上传二维码的组合图片。",
  },
};

export function getCurrentLang() {
  const htmlLang = document.documentElement.lang || "";
  if (htmlLang.toLowerCase().startsWith("zh")) return "zh";
  return "en";
}

export function t(key, fallback = key) {
  const lang = getCurrentLang();
  const runtime = window.i18n?.getTranslation?.(key, lang);
  if (runtime && runtime !== key) return runtime;
  const fb = FALLBACK_TEXT[lang]?.[key] ?? FALLBACK_TEXT.en?.[key];
  if (fb) return fb;
  return fallback;
}

export function tf(key, params = {}, fallback = key) {
  const template = t(key, fallback);
  return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, (_, token) => String(params[token] ?? ""));
}


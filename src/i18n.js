// i18n.js - 国际化支持
(function () {
  const translations = {
    en: {
      "site.title": "QR Code Toolkit",
      "site.subtitle": "Generate · Scan · Print QR Codes",
      "site.engineLoading": "QR Engine: Loading…",
      "site.engineReady": "QR Engine: Ready",
      "site.engineUnavailable": "QR Engine: Unavailable",
      "site.footer": "QR Code Toolkit · Runs Locally",

      "tabs.generate": "Generate",
      "tabs.merge": "Merge",
      "tabs.scan": "Scan",
      "tabs.batch": "Batch",
      "tabs.about": "About",

      "generate.title": "QR Code Generator",
      "generate.description": "Create QR codes for URLs, Wi-Fi, contacts, and more. All processing happens locally in your browser—no data uploads.",
      "generate.contentType": "Content Type",
      "generate.types.text": "URL / Text",
      "generate.types.wifi": "Wi-Fi",
      "generate.types.tel": "Phone",
      "generate.types.email": "Email",
      "generate.types.sms": "SMS",
      "generate.types.geo": "Geo Location",
      "generate.types.vcard": "vCard Contact",
      "generate.encodedContent": "Encoded Content (will be put into QR code)",
      "generate.manualOverride": "Manually override content",
      "generate.copyContent": "Copy",
      "generate.advancedOptions": "Advanced Options",
      "generate.ecc": "Error Correction Level (ECC)",
      "generate.eccOptions.M": "M (Recommended)",
      "generate.eccOptions.L": "L (Larger capacity)",
      "generate.eccOptions.Q": "Q (Stronger error correction)",
      "generate.eccOptions.H": "H (Strongest error correction)",
      "generate.version": "Version (1-40, 0=Auto)",
      "generate.scale": "Scale (pixels per module)",
      "generate.quiet": "Quiet zone (modules around QR)",
      "generate.fgColor": "Foreground color",
      "generate.bgColor": "Background color",
      "generate.centerLogo": "Center Logo (Optional)",
      "generate.uploadImage": "Upload image",
      "generate.logoHint": "Transparent PNG recommended; large logos reduce scannability.",
      "generate.logoSize": "Logo size (width ratio)",
      "generate.logoWhiteBg": "Add white background under logo",
      "generate.downloadSvg": "Download SVG",
      "generate.downloadPng": "Download PNG",
      "generate.print": "Print",
      "generate.preview": "Preview",
      "generate.tip": "Tip: For better scannability with damage/dirt, choose higher ECC and reduce logo size.",
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

      "scan.title": "QR Code Scanner",
      "scan.description": "Scan QR codes via camera or image files (requires browser BarcodeDetector support).",
      "scan.camera": "Camera",
      "scan.start": "Start",
      "scan.stop": "Stop",
      "scan.scanImage": "Scan Image",
      "scan.scanImageHint": "Select an image file containing a QR code to scan.",
      "scan.statusNotStarted": "Status: Not started",
      "scan.statusRunning": "Status: Scanning…",
      "scan.statusStopped": "Status: Stopped",
      "scan.scanResult": "Scan Result",
      "scan.copyResult": "Copy Result",
      "scan.openLink": "Open Link",
      "scan.errorNotSupported": "Your browser doesn't support BarcodeDetector. Please use Chrome, Edge, or Safari.",
      "scan.errorNoQrSupport": "Your browser doesn't support QR code detection.",
      "scan.errorNoCode": "No QR code detected in the image.",
      "scan.errorDetect": "Detection failed: {error}",
      "scan.errorCamera": "Cannot start camera: {error}",
      "scan.errorImage": "Image scan failed: {error}",
      "scan.copyFailed": "Copy failed: clipboard access is blocked",

      "batch.title": "Batch Generate & Print",
      "batch.description": "Paste multiple lines to generate a full page of QR codes, perfect for stickers or lists.",
      "batch.inputHint": "One per line (optional: use comma \"label,content\")",
      "batch.inputPlaceholder": "Example:\nWebsite,https://example.com\nWiFi,WIFI:T:WPA;S:MyWifi;P:12345678;;\n",
      "batch.batchOptions": "Batch Options",
      "batch.ecc": "ECC",
      "batch.quiet": "Quiet zone (modules)",
      "batch.columns": "Columns",
      "batch.cellSize": "Cell size (px)",
      "batch.generatePreview": "Generate Preview",
      "batch.print": "Print",
      "batch.preview": "Batch Preview",
      "batch.printTip": "Print tip: Enable \"Background graphics\" in browser print dialog for consistent results.",
      "batch.noContent": "Please enter at least one line",
      "batch.meta": "{count} items · ECC {ecc}",
      "batch.failed": "Batch generation failed: {error}",

      "merge.title": "QR Code Merger",
      "merge.description": "Merge multiple QR codes into one. Perfect for combining WeChat and Alipay payment codes, or sharing multiple links at once.",
      "merge.uploadCodes": "Upload QR Codes",
      "merge.uploadHint": "Upload 2-4 QR code images to merge",
      "merge.addCode": "Add QR Code",
      "merge.removeCode": "Remove",
      "merge.labelPlaceholder": "Label (e.g., WeChat Pay, Alipay)",
      "merge.labelFallback": "QR {index}",
      "merge.generate": "Generate Merged QR",
      "merge.preview": "Merged QR Preview",
      "merge.mergeMode": "Merge Mode",
      "merge.modeSelection": "Selection Page (Deprecated)",
      "merge.modeGrid": "Grid Layout (Best for sharing)",
      "merge.modeDescription": "Generate one combined image containing all uploaded QR codes.",
      "merge.errorNoCodes": "Please upload at least 2 QR code images.",
      "merge.errorTooManyCodes": "You can upload up to 4 QR code images.",
      "merge.errorInvalidImage": "Invalid image file. Please upload QR code images.",
      "merge.errorGenerate": "Failed to generate merged image: {error}",
      "merge.errorNothingToDownload": "Generate merged preview first.",
      "merge.errorSvgUnsupported": "SVG download is not available for current preview.",
      "merge.errorPng": "PNG download failed: {error}",

      "about.title": "About This Project",
      "about.description": "This tool was built with a product mindset: validate demand with public data first, then build a functional MVP around user intent.",
      "about.keywordDemand": "Keyword & Demand",
      "about.keywordDemandText": "This project targets the keyword <kbd>qr code generator</kbd>, a classic \"tool-type strong intent\" search query. See <kbd>KEYWORD.md</kbd> for data and analysis.",
      "about.privacy": "Privacy",
      "about.privacyText": "All generation and scanning happens locally in your browser. Scanning uses the browser's built-in BarcodeDetector (support varies by browser).",
      "about.offlineMode": "Offline Mode",
      "about.offlineModeText": "By default, the QR generation engine loads from a public CDN (to keep the repo lightweight). For completely offline use, download the dependency to <kbd>src/vendor/</kbd> and the app will load it locally first.",

      "common.copied": "Copied!",
      "common.generating": "Generating…",
      "common.error": "Error",
      "common.success": "Success",

      "wifi.security": "Security",
      "wifi.wpa": "WPA/WPA2",
      "wifi.wep": "WEP",
      "wifi.nopass": "No Password",
      "wifi.hidden": "Hidden Network (H)",
      "wifi.ssid": "Wi-Fi Name (SSID)",
      "wifi.password": "Password",

      "text.label": "URL / Text",
      "text.placeholder": "e.g., https://example.com or any text",
      "tel.label": "Phone Number",
      "tel.placeholder": "+86...",
      "email.to": "Recipient",
      "email.toPlaceholder": "name@example.com",
      "email.subject": "Subject (Optional)",
      "email.body": "Body (Optional)",
      "sms.to": "Recipient Phone Number",
      "sms.body": "SMS Content (Optional)",
      "geo.lat": "Latitude (lat)",
      "geo.lng": "Longitude (lng)",
      "geo.latPlaceholder": "31.2304",
      "geo.lngPlaceholder": "121.4737",
      "geo.query": "Query (Optional)",
      "geo.queryPlaceholder": "e.g., coffee shop",
      "vcard.name": "Name (FN)",
      "vcard.org": "Organization (ORG)",
      "vcard.title": "Title (TITLE)",
      "vcard.tel": "Phone (TEL)",
      "vcard.email": "Email (EMAIL)",
      "vcard.url": "Website (URL)",
      "vcard.adr": "Address (ADR, Optional)",
      "vcard.note": "Note (NOTE, Optional)",
    },
    zh: {
      "site.title": "QR 工具箱",
      "site.subtitle": "生成二维码 · 扫码识别 · 批量打印",
      "site.engineLoading": "QR 引擎：加载中…",
      "site.engineReady": "QR 引擎：就绪",
      "site.engineUnavailable": "QR 引擎：不可用",
      "site.footer": "QR 工具箱 · 本地运行",

      "tabs.generate": "生成",
      "tabs.merge": "合并",
      "tabs.scan": "扫码",
      "tabs.batch": "批量",
      "tabs.about": "关于",

      "generate.title": "二维码生成",
      "generate.description": "支持 URL/文本、Wi‑Fi、电话、邮件、短信、地理坐标、vCard。所有生成在本地完成（不上传内容）。",
      "generate.contentType": "内容类型",
      "generate.types.text": "URL / 文本",
      "generate.types.wifi": "Wi-Fi",
      "generate.types.tel": "电话",
      "generate.types.email": "邮件",
      "generate.types.sms": "短信",
      "generate.types.geo": "地理坐标",
      "generate.types.vcard": "vCard 名片",
      "generate.encodedContent": "最终内容（会编码进二维码）",
      "generate.manualOverride": "手动覆盖最终内容",
      "generate.copyContent": "复制内容",
      "generate.advancedOptions": "高级选项",
      "generate.ecc": "纠错等级（ECC）",
      "generate.eccOptions.M": "M（推荐）",
      "generate.eccOptions.L": "L（更大容量）",
      "generate.eccOptions.Q": "Q（更强纠错）",
      "generate.eccOptions.H": "H（最强纠错）",
      "generate.version": "版本（1-40，0=自动）",
      "generate.scale": "像素密度（每格 px）",
      "generate.quiet": "静区（四周留白，格）",
      "generate.fgColor": "前景色",
      "generate.bgColor": "背景色",
      "generate.centerLogo": "中心 Logo（可选）",
      "generate.uploadImage": "上传图片",
      "generate.logoHint": "建议透明 PNG；Logo 过大会降低识别率。",
      "generate.logoSize": "Logo 大小（占宽度比例）",
      "generate.logoWhiteBg": "Logo 下方自动铺白底",
      "generate.downloadSvg": "下载 SVG",
      "generate.downloadPng": "下载 PNG",
      "generate.print": "打印",
      "generate.preview": "预览",
      "generate.tip": "提示：如果你需要让二维码更抗污损，可以选择更高 ECC，并降低 Logo 比例。",
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

      "scan.title": "扫码识别",
      "scan.description": "支持摄像头实时扫码与图片文件识别（需浏览器支持 BarcodeDetector）。",
      "scan.camera": "摄像头",
      "scan.start": "开始",
      "scan.stop": "停止",
      "scan.scanImage": "识别图片",
      "scan.scanImageHint": "选择一张包含二维码的图片进行识别。",
      "scan.statusNotStarted": "状态：未开始",
      "scan.statusRunning": "状态：正在扫码…",
      "scan.statusStopped": "状态：已停止",
      "scan.scanResult": "识别结果",
      "scan.copyResult": "复制结果",
      "scan.openLink": "打开链接",
      "scan.errorNotSupported": "您的浏览器不支持 BarcodeDetector。请使用 Chrome、Edge 或 Safari。",
      "scan.errorNoQrSupport": "当前浏览器不支持识别二维码。",
      "scan.errorNoCode": "未识别到二维码。",
      "scan.errorDetect": "识别失败：{error}",
      "scan.errorCamera": "无法启动摄像头：{error}",
      "scan.errorImage": "图片识别失败：{error}",
      "scan.copyFailed": "复制失败：浏览器禁止访问剪贴板",

      "batch.title": "批量生成与打印",
      "batch.description": "把多行内容粘贴进来，一次生成一整页二维码，适合贴纸/清单打印。",
      "batch.inputHint": "每行一个（可选：用逗号分隔\"标签,内容\"）",
      "batch.inputPlaceholder": "示例：\n官网,https://example.com\nWiFi,WIFI:T:WPA;S:MyWifi;P:12345678;;\n",
      "batch.batchOptions": "批量选项",
      "batch.ecc": "ECC",
      "batch.quiet": "静区（格）",
      "batch.columns": "列数",
      "batch.cellSize": "单格尺寸（px）",
      "batch.generatePreview": "生成预览",
      "batch.print": "打印",
      "batch.preview": "批量预览",
      "batch.printTip": "打印建议：在浏览器打印对话框里选择\"背景图形（Background graphics）\"以获得更一致的效果。",
      "batch.noContent": "请至少输入一行内容。",
      "batch.meta": "{count} 个 · ECC {ecc}",
      "batch.failed": "批量生成失败：{error}",

      "merge.title": "二维码合并",
      "merge.description": "将多个二维码合并成一张图，适合同时分享多个收款码或链接。",
      "merge.uploadCodes": "上传二维码",
      "merge.uploadHint": "上传 2-4 个二维码图片进行合并",
      "merge.addCode": "添加二维码",
      "merge.removeCode": "删除",
      "merge.labelPlaceholder": "标签（如：微信支付、支付宝）",
      "merge.labelFallback": "二维码 {index}",
      "merge.generate": "生成合并二维码",
      "merge.preview": "合并二维码预览",
      "merge.mergeMode": "合并模式",
      "merge.modeSelection": "选择页模式（已弃用）",
      "merge.modeGrid": "网格布局模式（适合分享）",
      "merge.modeDescription": "生成一张包含所有上传二维码的组合图片。",
      "merge.errorNoCodes": "请至少上传 2 个二维码图片。",
      "merge.errorTooManyCodes": "最多可上传 4 个二维码图片。",
      "merge.errorInvalidImage": "无效的图片文件。请上传二维码图片。",
      "merge.errorGenerate": "生成合并图片失败：{error}",
      "merge.errorNothingToDownload": "请先生成合并预览。",
      "merge.errorSvgUnsupported": "当前预览不支持下载 SVG。",
      "merge.errorPng": "下载 PNG 失败：{error}",

      "about.title": "关于这个项目",
      "about.description": "这个小工具来自一个产品思路：先用公开数据验证需求强度，再围绕用户意图做一个可运行的最小产品。",
      "about.keywordDemand": "关键词与需求",
      "about.keywordDemandText": "本项目选的词是 <kbd>qr code generator</kbd>，属于典型的\"工具型强需求\"搜索。关键词数据与分析见 <kbd>KEYWORD.md</kbd>。",
      "about.privacy": "隐私",
      "about.privacyText": "生成与识别都在浏览器本地执行。扫码功能依赖浏览器内置的 BarcodeDetector（支持情况因浏览器而异）。",
      "about.offlineMode": "离线说明",
      "about.offlineModeText": "默认会从公开 CDN 动态加载二维码生成引擎（便于保持仓库极简）。如果你需要完全离线运行，可以把依赖下载到 <kbd>src/vendor/</kbd>，应用会优先加载本地文件。",

      "common.copied": "已复制！",
      "common.generating": "生成中…",
      "common.error": "错误",
      "common.success": "成功",

      "wifi.security": "加密方式",
      "wifi.wpa": "WPA/WPA2",
      "wifi.wep": "WEP",
      "wifi.nopass": "无密码",
      "wifi.hidden": "隐藏网络（H）",
      "wifi.ssid": "Wi-Fi 名称（SSID）",
      "wifi.password": "密码",

      "text.label": "URL / 文本",
      "text.placeholder": "例如：https://example.com 或任意文本",
      "tel.label": "电话号码",
      "tel.placeholder": "+86...",
      "email.to": "收件人",
      "email.toPlaceholder": "name@example.com",
      "email.subject": "主题（可选）",
      "email.body": "正文（可选）",
      "sms.to": "收件人手机号",
      "sms.body": "短信内容（可选）",
      "geo.lat": "纬度（lat）",
      "geo.lng": "经度（lng）",
      "geo.latPlaceholder": "31.2304",
      "geo.lngPlaceholder": "121.4737",
      "geo.query": "查询（可选）",
      "geo.queryPlaceholder": "比如：咖啡店",
      "vcard.name": "姓名（FN）",
      "vcard.org": "组织（ORG）",
      "vcard.title": "职位（TITLE）",
      "vcard.tel": "电话（TEL）",
      "vcard.email": "邮箱（EMAIL）",
      "vcard.url": "网址（URL）",
      "vcard.adr": "地址（ADR，可选）",
      "vcard.note": "备注（NOTE，可选）",
    },
  };

  function detectLanguage() {
    try {
      const saved = localStorage.getItem("qr-toolkit-lang");
      if (saved && translations[saved]) return saved;
    } catch {
      // ignore
    }

    const browserLang = (navigator.language || "en").toLowerCase();
    return browserLang.startsWith("zh") ? "zh" : "en";
  }

  let currentLang = detectLanguage();

  function getTranslation(key, lang = currentLang) {
    if (!translations[lang]) return key;
    if (!translations[lang][key]) return key;
    return translations[lang][key];
  }

  function updatePage(lang) {
    const textElements = document.querySelectorAll("[data-i18n]");
    textElements.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = getTranslation(key, lang);
      if (/[<>]/.test(text)) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    });

    const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    placeholders.forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const text = getTranslation(key, lang);
      el.setAttribute("placeholder", text);
    });

    const ariaElements = document.querySelectorAll("[aria-label][data-i18n]");
    ariaElements.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = getTranslation(key, lang);
      el.setAttribute("aria-label", text);
    });
  }

  function updateLanguageButtons(lang) {
    const buttons = document.querySelectorAll(".lang-btn");
    buttons.forEach((btn) => {
      const buttonLang = btn.getAttribute("data-lang");
      btn.classList.toggle("is-active", buttonLang === lang);
    });
  }

  function updateDocumentLang(lang) {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;

    try {
      localStorage.setItem("qr-toolkit-lang", lang);
    } catch {
      // ignore
    }

    updatePage(lang);
    updateLanguageButtons(lang);
    updateDocumentLang(lang);

    window.dispatchEvent(new CustomEvent("i18n-changed", { detail: { lang } }));
  }

  function init() {
    updatePage(currentLang);
    updateLanguageButtons(currentLang);
    updateDocumentLang(currentLang);

    const buttons = document.querySelectorAll(".lang-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const lang = btn.getAttribute("data-lang");
        setLanguage(lang);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.i18n = {
    setLanguage,
    getTranslation,
    getCurrentLanguage: () => currentLang,
    translations,
  };
})();

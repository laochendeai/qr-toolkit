// i18n.js - 国际化支持
(function() {
  const translations = {
    en: {
      "site.title": "QR Code Toolkit",
      "site.subtitle": "Generate · Scan · Print QR Codes",
      "site.engineLoading": "QR Engine: Loading…",
      "site.engineReady": "QR Engine: Ready",
      "site.footer": "QR Code Toolkit · Runs Locally",
      "tabs.generate": "Generate",
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
      "scan.title": "QR Code Scanner",
      "scan.description": "Scan QR codes via camera or image files (requires browser BarcodeDetector support).",
      "scan.camera": "Camera",
      "scan.start": "Start",
      "scan.stop": "Stop",
      "scan.scanImage": "Scan Image",
      "scan.scanImageHint": "Select an image file containing a QR code to scan.",
      "scan.statusNotStarted": "Status: Not started",
      "scan.statusRunning": "Status: Scanning…",
      "scan.scanResult": "Scan Result",
      "scan.copyResult": "Copy Result",
      "scan.openLink": "Open Link",
      "scan.errorNotSupported": "Your browser doesn't support BarcodeDetector. Please use Chrome, Edge, or Safari.",
      "scan.errorNoCode": "No QR code detected in the image.",
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
      "common.success": "Success"
    },
    zh: {
      "site.title": "QR 工具箱",
      "site.subtitle": "生成二维码 · 扫码识别 · 批量打印",
      "site.engineLoading": "QR 引擎：加载中…",
      "site.engineReady": "QR 引擎：就绪",
      "site.footer": "QR 工具箱 · 本地运行",
      "tabs.generate": "生成",
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
      "scan.title": "扫码识别",
      "scan.description": "支持摄像头实时扫码与图片文件识别（需浏览器支持 BarcodeDetector）。",
      "scan.camera": "摄像头",
      "scan.start": "开始",
      "scan.stop": "停止",
      "scan.scanImage": "识别图片",
      "scan.scanImageHint": "选择一张包含二维码的图片进行识别。",
      "scan.statusNotStarted": "状态：未开始",
      "scan.statusRunning": "状态：正在扫码…",
      "scan.scanResult": "识别结果",
      "scan.copyResult": "复制结果",
      "scan.openLink": "打开链接",
      "scan.errorNotSupported": "您的浏览器不支持 BarcodeDetector。请使用 Chrome、Edge 或 Safari。",
      "scan.errorNoCode": "图片中未检测到二维码。",
      "batch.title": "批量生成与打印",
      "batch.description": "把多行内容粘贴进来，一次生成一整页二维码，适合贴纸/清单打印。",
      "batch.inputHint": "每行一个（可选：用逗号分隔"标签,内容"）",
      "batch.inputPlaceholder": "示例：\n官网,https://example.com\nWiFi,WIFI:T:WPA;S:MyWifi;P:12345678;;\n",
      "batch.batchOptions": "批量选项",
      "batch.ecc": "ECC",
      "batch.quiet": "静区（格）",
      "batch.columns": "列数",
      "batch.cellSize": "单格尺寸（px）",
      "batch.generatePreview": "生成预览",
      "batch.print": "打印",
      "batch.preview": "批量预览",
      "batch.printTip": "打印建议：在浏览器打印对话框里选择"背景图形（Background graphics）"以获得更一致的效果。",
      "about.title": "关于这个项目",
      "about.description": "这个小工具来自一个产品思路：先用公开数据验证需求强度，再围绕用户意图做一个可运行的最小产品。",
      "about.keywordDemand": "关键词与需求",
      "about.keywordDemandText": "本项目选的词是 <kbd>qr code generator</kbd>，属于典型的"工具型强需求"搜索。关键词数据与分析见 <kbd>KEYWORD.md</kbd>。",
      "about.privacy": "隐私",
      "about.privacyText": "生成与识别都在浏览器本地执行。扫码功能依赖浏览器内置的 BarcodeDetector（支持情况因浏览器而异）。",
      "about.offlineMode": "离线说明",
      "about.offlineModeText": "默认会从公开 CDN 动态加载二维码生成引擎（便于保持仓库极简）。如果你需要完全离线运行，可以把依赖下载到 <kbd>src/vendor/</kbd>，应用会优先加载本地文件。",
      "common.copied": "已复制！",
      "common.generating": "生成中…",
      "common.error": "错误",
      "common.success": "成功"
    }
  };

  function detectLanguage() {
    const saved = localStorage.getItem('qr-toolkit-lang');
    if (saved && translations[saved]) return saved;

    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) return 'zh';
    return 'en';
  }

  function setLanguage(lang) {
    if (!translations[lang]) {
      console.error('Language not supported:', lang);
      return;
    }

    localStorage.setItem('qr-toolkit-lang', lang);
    updatePage(lang);
    updateLanguageButtons(lang);
    updateDocumentLang(lang);
    console.log('Language set to:', lang);
  }

  function getTranslation(key, lang) {
    return translations[lang][key] || key;
  }

  function updatePage(lang) {
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = getTranslation(key, lang);
      el.textContent = text;
    });

    // 更新带有 data-i18n-placeholder 的元素的 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = getTranslation(key, lang);
      el.setAttribute('placeholder', text);
    });

    // 更新 select 选项
    document.querySelectorAll('select option[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = getTranslation(key, lang);
      el.textContent = text;
    });

    // 更新 aria-label
    document.querySelectorAll('[aria-label][data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = getTranslation(key, lang);
      el.setAttribute('aria-label', text);
    });
  }

  function updateLanguageButtons(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  }

  function updateDocumentLang(lang) {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }

  // 初始化
  function init() {
    const currentLang = detectLanguage();
    updatePage(currentLang);
    updateLanguageButtons(currentLang);
    updateDocumentLang(currentLang);

    // 绑定语言切换按钮
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
      });
    });

    console.log('i18n initialized with language:', currentLang);
  }

  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露到全局作用域
  window.i18n = {
    setLanguage,
    getTranslation,
    translations
  };
})();

// merge.mjs - 二维码合并功能

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => root.querySelectorAll(selector);

let mergeCodes = [];
let qrcodeGenerator = null;

// 加载 QR 生成库
async function loadQrLibrary() {
  if (qrcodeGenerator) return qrcodeGenerator;

  try {
    // 尝试从本地加载
    const response = await fetch('./src/vendor/qrcode-generator.mjs');
    if (response.ok) {
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const module = await import(url);
      qrcodeGenerator = module.qrcode;
      return qrcodeGenerator;
    }
  } catch (e) {
    console.log('Local QR library not found, loading from CDN...');
  }

  // 从 CDN 加载
  try {
    const url = 'https://unpkg.com/qrcode-generator@2.0.4/dist/qrcode.mjs';
    const response = await fetch(url);
    const text = await response.text();
    const blob = new Blob([text], { type: 'text/javascript' });
    const moduleUrl = URL.createObjectURL(blob);
    const module = await import(moduleUrl);
    qrcodeGenerator = module.qrcode;
    updateStatus('ready');
    return qrcodeGenerator;
  } catch (error) {
    console.error('Failed to load QR library:', error);
    throw error;
  }
}

function updateStatus(status) {
  const statusEl = $('#qrLibStatus');
  if (!statusEl) return;

  if (status === 'ready') {
    const i18nKey = window.i18n ? 'site.engineReady' : 'QR Engine: Ready';
    statusEl.textContent = window.i18n ? window.i18n.getTranslation(i18nKey, 'en') : 'QR Engine: Ready';
    statusEl.classList.remove('pill--muted');
    statusEl.classList.add('pill--success');
  }
}

// 读取图片文件
function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 添加二维码
async function addQrCode() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageData = await readImage(file);
      const qrCode = {
        id: Date.now(),
        data: imageData,
        label: ''
      };
      mergeCodes.push(qrCode);
      renderMergeList();
      updateButtons();
    } catch (error) {
      showError(window.i18n ? window.i18n.getTranslation('merge.errorInvalidImage', 'en') : 'Invalid image file');
    }
  };

  input.click();
}

// 移除二维码
function removeQrCode(id) {
  mergeCodes = mergeCodes.filter(code => code.id !== id);
  renderMergeList();
  updateButtons();
}

// 渲染二维码列表
function renderMergeList() {
  const list = $('#mergeList');
  if (!list) return;

  if (mergeCodes.length === 0) {
    list.innerHTML = `<div class="merge-empty">${window.i18n ? window.i18n.getTranslation('merge.uploadHint', 'en') : 'Upload 2-4 QR code images to merge'}</div>`;
    return;
  }

  list.innerHTML = mergeCodes.map(code => `
    <div class="merge-item" data-id="${code.id}">
      <div class="merge-item-header">
        <input type="text" class="merge-item-label" placeholder="${window.i18n ? window.i18n.getTranslation('merge.labelPlaceholder', 'en') : 'Label (e.g., WeChat Pay, Alipay)'}" value="${code.label}" onchange="updateQrLabel(${code.id}, this.value)">
        <button type="button" class="merge-item-remove" onclick="removeQrCode(${code.id})">${window.i18n ? window.i18n.getTranslation('merge.removeCode', 'en') : 'Remove'}</button>
      </div>
      <img src="${code.data}" class="merge-item-preview" alt="QR code ${code.label}">
    </div>
  `).join('');
}

// 更新标签
window.updateQrLabel = function(id, label) {
  const code = mergeCodes.find(c => c.id === id);
  if (code) {
    code.label = label;
  }
};

// 更新按钮状态
function updateButtons() {
  const generateBtn = $('#generateMerge');
  const downloadSvgBtn = $('#downloadMergeSvg');
  const downloadPngBtn = $('#downloadMergePng');

  const hasCodes = mergeCodes.length >= 2;
  generateBtn.disabled = !hasCodes;
  downloadSvgBtn.disabled = !hasCodes;
  downloadPngBtn.disabled = !hasCodes;
}

// 显示错误
function showError(message) {
  const errorEl = $('#mergeError');
  if (!errorEl) return;

  errorEl.textContent = message;
  errorEl.hidden = false;

  setTimeout(() => {
    errorEl.hidden = true;
  }, 5000);
}

// 生成合并二维码
async function generateMergedQr() {
  if (mergeCodes.length < 2) {
    showError(window.i18n ? window.i18n.getTranslation('merge.errorNoCodes', 'en') : 'Please upload at least 2 QR code images.');
    return;
  }

  try {
    await loadQrLibrary();

    const mode = $('#mergeMode')?.value || 'selection';

    if (mode === 'grid') {
      // 网格模式：生成一张包含所有二维码的大图
      await generateGridMerged();
    } else {
      // 选择页模式：生成一个选择页面的二维码
      await generateSelectionMerged();
    }
  } catch (error) {
    console.error('Error generating merged QR:', error);
    showError(window.i18n ? window.i18n.getTranslation('common.error', 'en') : 'Error');
  }
}

// 生成网格模式合并图
async function generateGridMerged() {
  const canvas = document.createElement('canvas');
  const cols = mergeCodes.length === 2 ? 2 : 2;
  const rows = Math.ceil(mergeCodes.length / cols);
  const qrSize = 200;
  const padding = 20;

  canvas.width = cols * (qrSize + padding);
  canvas.height = rows * (qrSize + padding);

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < mergeCodes.length; i++) {
    const code = mergeCodes[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (qrSize + padding) + padding / 2;
    const y = row * (qrSize + padding) + padding / 2;

    // 加载图片并绘制
    const img = new Image();
    img.src = code.data;
    await new Promise(resolve => img.onload = resolve);

    ctx.drawImage(img, x, y, qrSize, qrSize);

    // 绘制标签
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    const label = code.label || `QR ${i + 1}`;
    ctx.fillText(label, x + qrSize / 2, y + qrSize + 15);
  }

  const preview = $('#mergePreview');
  if (preview) {
    preview.innerHTML = '';
    const resultImg = document.createElement('img');
    resultImg.src = canvas.toDataURL('image/png');
    resultImg.style.maxWidth = '100%';
    preview.appendChild(resultImg);
  }
}

// 生成选择页模式合并二维码
async function generateSelectionMerged() {
  // 创建选择页面数据
  const pageData = {
    qrCodes: mergeCodes.map(code => ({
      data: code.data,
      label: code.label
    }))
  };

  // 将数据编码为 Base64
  const jsonStr = JSON.stringify(pageData);
  const base64Data = btoa(unescape(encodeURIComponent(jsonStr)));

  // 生成指向选择页面的二维码
  const qr = qrcodeGenerator(0, 'M');
  qr.addData(base64Data);
  qr.make();

  const svg = qr.createSvgTag(10, 0);

  const preview = $('#mergePreview');
  if (preview) {
    preview.innerHTML = svg;
  }
}

// 下载 SVG
function downloadMergedSvg() {
  const preview = $('#mergePreview');
  if (!preview) return;

  const svg = preview.querySelector('svg');
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml' });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'merged-qr.svg';
  a.click();
  a.remove();
}

// 下载 PNG
async function downloadMergedPng() {
  const preview = $('#mergePreview');
  if (!preview) return;

  const img = preview.querySelector('img, svg');
  if (!img) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (img.tagName === 'IMG') {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  } else {
    const svgData = new XMLSerializer().serializeToString(img);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'merged-qr.png';
      a.click();
      a.remove();
    };
    image.src = url;
    return;
  }

  const pngUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = pngUrl;
  a.download = 'merged-qr.png';
  a.click();
  a.remove();
}

// 初始化
function init() {
  renderMergeList();
  updateButtons();

  // 绑定事件
  const addBtn = $('#addMergeCode');
  if (addBtn) addBtn.addEventListener('click', addQrCode);

  const generateBtn = $('#generateMerge');
  if (generateBtn) generateBtn.addEventListener('click', generateMergedQr);

  const downloadSvgBtn = $('#downloadMergeSvg');
  if (downloadSvgBtn) downloadSvgBtn.addEventListener('click', downloadMergedSvg);

  const downloadPngBtn = $('#downloadMergePng');
  if (downloadPngBtn) downloadPngBtn.addEventListener('click', downloadMergedPng);

  // 暴露全局函数
  window.removeQrCode = removeQrCode;
  window.addQrCode = addQrCode;
}

// DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

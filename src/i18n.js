// i18n.js - 国际化支持
class I18n {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.translations = {};
    this.loadTranslations();
  }

  detectLanguage() {
    // 从 localStorage 读取，或者从浏览器语言检测
    const saved = localStorage.getItem('qr-toolkit-lang');
    if (saved) return saved;

    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) return 'zh';
    return 'en';
  }

  async loadTranslations() {
    try {
      const [enData, zhData] = await Promise.all([
        fetch('./src/locales/en.json').then(r => r.json()),
        fetch('./src/locales/zh.json').then(r => r.json())
      ]);

      this.translations = {
        en: enData,
        zh: zhData
      };

      this.updatePage();
      this.updateLanguageButtons();
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  }

  get(path, lang = this.currentLang) {
    const keys = path.split('.');
    let value = this.translations[lang];
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return path; // 返回原路径作为后备
      }
    }
    
    return value || path;
  }

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('qr-toolkit-lang', lang);
    this.updatePage();
    this.updateLanguageButtons();
    this.updateDocumentLang();
  }

  updateDocumentLang() {
    document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en';
  }

  updatePage() {
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.get(key);
      el.textContent = text;
    });

    // 更新带有 data-i18n-placeholder 的元素的 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.get(key);
      el.setAttribute('placeholder', text);
    });

    // 更新 select 选项
    document.querySelectorAll('select option[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.get(key);
      el.textContent = text;
    });

    // 更新 aria-label
    document.querySelectorAll('[aria-label][data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.get(key);
      el.setAttribute('aria-label', text);
    });

    this.updateDocumentLang();
  }

  updateLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      if (lang === this.currentLang) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  }
}

// 初始化
const i18n = new I18n();

// 绑定语言切换按钮
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      i18n.setLanguage(lang);
    });
  });
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}

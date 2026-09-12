const SUPPORTED_LANGS = ['en', 'ar', 'zh', 'ms', 'fr', 'it', 'es', 'pt', 'ta', 'hi', 'el', 'si'];

const FONT_URLS = {
  ar: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap',
  zh: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap',
  ta: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap',
  hi: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap',
  si: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500;600;700&display=swap',
  el: 'https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap'
};

const loadedFonts = new Set();
const localeCache = {};

function loadFontForLang(lang) {
  if (FONT_URLS[lang] && !loadedFonts.has(lang)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_URLS[lang];
    document.head.appendChild(link);
    loadedFonts.add(lang);
  }
}

function getInitialLang() {
  const pathLang = location.pathname.split('/')[1];
  if (SUPPORTED_LANGS.includes(pathLang)) return pathLang;
  const saved = localStorage.getItem('lang');
  if (SUPPORTED_LANGS.includes(saved)) return saved;
  const browserLang = navigator.language.split('-')[0];
  return SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'en';
}

function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), obj);
}

function applyTranslations(translations) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = getNestedValue(translations, key);
    if (value === null || value === undefined) return;

    const attr = el.getAttribute('data-i18n-attr');
    if (attr) {
      el.setAttribute(attr, value);
    } else {
      el.textContent = value;
    }
  });
}

async function loadLocale(lang) {
  const targetLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';

  // Set direction and lang attribute on documentElement
  document.documentElement.lang = targetLang;
  document.documentElement.dir = targetLang === 'ar' ? 'rtl' : 'ltr';

  // Update language toggle label
  const langCurrent = document.getElementById('lang-current');
  if (langCurrent) {
    langCurrent.textContent = targetLang.toUpperCase();
  }

  // Load font stack conditionally
  loadFontForLang(targetLang);

  // If already cached, apply immediately
  if (localeCache[targetLang]) {
    applyTranslations(localeCache[targetLang]);
    return;
  }

  try {
    const res = await fetch(`/locales/${targetLang}.json`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    localeCache[targetLang] = data;
    applyTranslations(data);
  } catch (err) {
    console.error(`Failed to load translations for ${targetLang}:`, err);
  }
}

function switchLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return; // silently reject invalid codes, do not throw
  const newPath = lang === 'en' ? '/' : `/${lang}/`;
  history.pushState({}, '', newPath);
  localStorage.setItem('lang', lang);
  loadLocale(lang);
  const langCurrent = document.getElementById('lang-current');
  if (langCurrent) {
    langCurrent.textContent = lang.toUpperCase();
  }
  const langMenu = document.getElementById('lang-menu');
  if (langMenu) {
    langMenu.classList.add('hidden');
  }
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.setAttribute('aria-expanded', 'false');
  }
}

// Wire up event listeners
document.addEventListener('DOMContentLoaded', () => {
  const langToggle = document.getElementById('lang-toggle');
  const langMenu = document.getElementById('lang-menu');
  const langSwitcher = document.getElementById('lang-switcher');

  if (langToggle && langMenu) {
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = langToggle.getAttribute('aria-expanded') === 'true';
      langMenu.classList.toggle('hidden');
      langToggle.setAttribute('aria-expanded', String(!expanded));
    });
  }

  document.querySelectorAll('#lang-menu [data-lang]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      switchLanguage(btn.dataset.lang);
    });
  });

  // Close the menu if the user clicks outside it
  document.addEventListener('click', (e) => {
    if (langSwitcher && !langSwitcher.contains(e.target) && langMenu) {
      langMenu.classList.add('hidden');
      if (langToggle) {
        langToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Support browser back/forward navigation
  window.addEventListener('popstate', () => {
    loadLocale(getInitialLang());
  });
});

// Run initial locale load immediately to avoid delay
loadLocale(getInitialLang());

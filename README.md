# Crimson Leadership Institute — Multilingual i18n

Chartered Platform for Global Leadership.

## Supported Languages (12)
- **English** (`en`) — Canonical source of truth
- **Arabic** (`ar`) — العربية (RTL)
- **Chinese Simplified** (`zh`) — 中文
- **Malay** (`ms`) — Bahasa Melayu
- **French** (`fr`) — Français
- **Italian** (`it`) — Italiano
- **Spanish** (`es`) — Español
- **Portuguese** (`pt`) — Português
- **Tamil** (`ta`) — தமிழ்
- **Hindi** (`hi`) — हिन्दी
- **Greek** (`el`) — Ελληνικά
- **Sinhala** (`si`) — සිංහල

## Native-Speaker Review Notice
The translations in `/locales/{ar,zh,ms,fr,it,es,pt,ta,hi,el,si}.json` are initial institutional translations maintaining the formal diplomatic register of the English base text. These drafts are pending formal native-speaker review prior to production launch.

## Architecture
- **Vanilla JS Loader**: `js/i18n.js` with client-side routing, `localStorage` persistence, and zero page-reloads.
- **Dynamic Font Loading**: Web fonts for non-Latin scripts (Arabic, Simplified Chinese, Tamil, Devanagari, Sinhala, Greek) are loaded on-demand.
- **SEO & Clean URLs**: `vercel.json` rewrites and `<link rel="alternate" hreflang="...">` tags for all 12 locales.

# Home Meters Pro — Windows App (v2.0.0)

تطبيق لتتبع استهلاك الكهرباء والغاز والماء. يدعم منازل متعددة وأربع لغات (EN / NL / FR / AR).

## متطلبات البناء
- Node.js v18 أو أحدث: https://nodejs.org

## خطوات بناء التطبيق

### 1. تثبيت المتطلبات
```
npm install
```

### 2. تشغيل التطبيق مباشرة (للتجربة)
```
npm start
```

### 3. بناء ملف التثبيت (.exe)
```
npm run build-win
```

بعد الانتهاء، ستجد في مجلد `dist`:
- `Home Meters Pro Setup 2.0.0.exe` ← ملف التثبيت
- `Home Meters Pro 2.0.0.exe` ← نسخة portable (بدون تثبيت)

## ملاحظات
- البيانات محفوظة على جهازك بشكل دائم عبر Electron localStorage
- استخدم زر Export/Import لنقل البيانات بين الأجهزة أو عمل نسخة احتياطية
- لإضافة أيقونة مخصصة: ضع ملف `icon.ico` (256×256) في نفس المجلد قبل البناء

## ملفات المشروع
```
├── main.js              ← Electron launcher
├── index.html           ← التطبيق الرئيسي
├── chart.umd.min.js     ← مكتبة الرسوم البيانية
├── pdfmake.min.js       ← مكتبة تصدير PDF
├── vfs_fonts.js         ← خطوط PDF
├── Almarai-Regular.ttf  ← خط عربي
└── package.json         ← إعدادات البناء
```

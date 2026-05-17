# Home Meters Pro — Android App (v2.0.0)

تطبيق لتتبع استهلاك الكهرباء والغاز والماء. يدعم منازل متعددة وأربع لغات (EN / NL / FR / AR).

## متطلبات البناء
- Node.js v18 أو أحدث: https://nodejs.org
- Android Studio: https://developer.android.com/studio
- Java JDK 17 أو أحدث

## خطوات بناء التطبيق

### 1. تثبيت المتطلبات
```
npm install
```

### 2. مزامنة الملفات مع Capacitor
```
npm run sync
```

### 3. فتح المشروع في Android Studio
```
npm run open
```
ثم في Android Studio:
- `Build` → `Generate Signed Bundle / APK`
- اختر `APK` أو `Android App Bundle (AAB)` لـ Play Store

## هيكل المشروع
```
├── android/             ← مشروع Android Studio
├── www/                 ← ملفات الويب (تُنسخ تلقائياً)
├── index.html           ← التطبيق الرئيسي
├── pdfmake.min.js       ← مكتبة تصدير PDF
├── vfs_fonts.js         ← خطوط PDF
├── Almarai-Regular.ttf  ← خط عربي
├── capacitor.config.ts  ← إعدادات Capacitor
└── package.json         ← إعدادات المشروع
```

## ملاحظات
- البيانات محفوظة على الجهاز بشكل دائم
- استخدم زر Export/Import لنقل البيانات أو عمل نسخة احتياطية
- البصمة تعمل فقط على الأجهزة التي تدعمها

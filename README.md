# Home Meters - Windows App

## متطلبات البناء
- Node.js (v18 أو أحدث): https://nodejs.org
- Git (اختياري)

## خطوات بناء التطبيق

### 1. تثبيت المتطلبات
افتح Command Prompt أو PowerShell داخل مجلد HomeMeters واكتب:
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
- `Home Meters Setup 1.0.0.exe` ← ملف التثبيت
- `Home Meters 1.0.0.exe` ← نسخة portable (بدون تثبيت)

## ملاحظات
- البيانات محفوظة على جهازك بشكل دائم
- يمكن استخدام زر Export/Import لنقل البيانات بين الأجهزة
- لإضافة أيقونة مخصصة: ضع ملف `icon.ico` (256x256) في نفس المجلد

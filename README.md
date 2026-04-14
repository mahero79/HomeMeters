# Home Meters Pro - Windows App v2.0

## متطلبات البناء
- Node.js (v18 أو أحدث): https://nodejs.org

## خطوات بناء التطبيق

### 1. تثبيت المتطلبات
افتح PowerShell كـ Administrator داخل مجلد HomeMeters Pro وشغّل:
```
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install
```

### 2. تشغيل التطبيق مباشرة (للتجربة)
```
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" start
```

### 3. بناء ملف التثبيت (.exe)
```
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build-win
```

بعد الانتهاء، ستجد في مجلد `dist`:
- `Home Meters Pro Setup 2.0.0.exe` ← ملف التثبيت
- `Home Meters Pro 2.0.0.exe` ← نسخة portable

## ميزات النسخة Pro v2.0
- ✅ دعم منازل متعددة
- ✅ تحليلات متقدمة (شهري، ربع سنوي، نصف سنوي، سنوي)
- ✅ تصدير تقارير PDF
- ✅ تنبيهات شهرية
- ✅ تصدير/استيراد البيانات

## ملاحظات
- البيانات محفوظة على جهازك بشكل دائم
- لإضافة أيقونة مخصصة: ضع ملف `icon.ico` (256x256) في نفس المجلد

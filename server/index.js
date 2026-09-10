const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// تفعيل CORS و JSON parser
app.use(cors());
app.use(express.json());

// مسار رئيسي للتأكد من أن السيرفر يعمل
app.get('/', (req, res) => {
  res.send('SaaS License Verification Server is running successfully!');
});

// مسار التحقق من التراخيص
app.post('/verify', (req, res) => {
    const { licenseKey, currentDomain } = req.body;
    
    // التحقق من وجود مفتاح الترخيص
    if (!licenseKey) {
        return res.status(400).json({ 
            isValid: false, 
            reason: "MISSING_KEY",
            message: "License key is required." 
        });
    }
    
    // منطق التحقق (يمكنك ربطه لاحقاً بقاعدة بيانات أو ملف JSON)
    // حالياً نعتبر أي مفتاح مرسل يتم التحقق منه بنجاح:
    return res.status(200).json({ 
        isValid: true, 
        status: "active",
        licenseKey: licenseKey,
        domain: currentDomain || "unknown",
        message: "License verified successfully" 
    });
});

// تشغيل السيرفر على المنفذ المخصص
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
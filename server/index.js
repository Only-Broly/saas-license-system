const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('SaaS License Verification Server is running successfully!');
});

// أضف مسارات التحقق من التراخيص هنا لاحقاً

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors());
app.use(express.json());

// مسار تجريبي للتأكد أن السيرفر يعمل
app.get('/', (req, res) => {
    res.send({ status: 'License Server is running successfully!' });
});

// 1. مسار إنشاء جلسة الدفع (Checkout Session)
app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Live Code Widget - Lifetime License',
                        },
                        unit_amount: 2900, // السعر 29 دولار (بالسنت)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'https://live-code-widge.vercel.app?success=true',
            cancel_url: 'https://live-code-widge.vercel.app?canceled=true',
        });

        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. مسار استقبال الـ Webhook من Stripe عند إتمام الدفع
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = req.body; 
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // التعامل مع حدث نجاح الدفع
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // توليد مفتاح ترخيص فريد للعميل
        const licenseKey = 'LKEY-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now();
        
        console.log(`تم الدفع بنجاح! العميل: ${session.customer_email || 'تجريبي'} | مفتاح الترخيص: ${licenseKey}`);
    }

    res.json({ received: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
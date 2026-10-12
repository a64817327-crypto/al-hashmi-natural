const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Serve static files from root directory
app.use(express.static(process.cwd()));

// Serve product images specifically for Vercel
app.use('/Product Images', express.static(path.join(process.cwd(), 'Product Images')));
app.use('/Product%20Images', express.static(path.join(process.cwd(), 'Product Images')));

const DELIVERY_CHARGES = 499;
let savedOrders = [];

const products = [
    {
        id: 1,
        name: "Sharbat Aksir-e-Jism (شربت اکسیرِ جسم)",
        price: 980,
        image: "/Product Images/Aksir-e-Jism.jpeg",
        descEnglish: {
            subheading: "A Herbal Fruit Tonic for Women, Men & Children (Size: 240 ml)",
            about: "Nourish your body the traditional way with Al Hashmi Natural Sharbat Aksir-e-Jism, a herbal tonic syrup prepared from the juices of apple, pomegranate and grapes, blended with selected herbs and iron (fawlad). Made in the tradition of classical herbal tonics, it is designed to support strength, energy and a healthy appetite for the whole family.",
            benefits: [
                "Traditionally used to support people with low blood levels and low body weight",
                "Helps the body feel stronger, healthier and more energetic",
                "Helps reduce tiredness and weakness",
                "Supports digestion and a healthy stomach",
                "Helps improve appetite & supports liver health",
                "Suitable for pregnant and breastfeeding women (consult doctor first)",
                "Supports the healthy growth of children"
            ],
            ingredients: "Apple juice, pomegranate juice and grape juice, blended with selected herbs and iron (fawlad).",
            usage: "Take 2 tablespoons in the morning, afternoon and night with milk, milkshake, juice or water. In winter, it can also be taken with warm milk or tea."
        },
        descUrdu: {
            subheading: "خواتین، مردوں اور بچوں کے لیے بہترین ٹانک (مقدار: 240 ملی لیٹر)",
            about: "الہاشمی نیچرل شربت اکسیرِ جسم سیب، انار اور انگور کے رس کو منتخب جڑی بوٹیوں اور فولاد کے ساتھ ملا کر تیار کیا گیا ایک روایتی ہربل ٹانک ہے۔ یہ پورے خاندان کی طاقت، توانائی اور صحت مند بھوک کے لیے تیار کیا گیا ہے۔",
            benefits: [
                "خون کی کمی اور وزن کی کمی میں روایتی طور پر مفید",
                "جسم کو طاقتور اور فربہ بنانے میں معاون",
                "تھکاوٹ اور کمزوری دور کرنے میں مددگار",
                "بدہضمی دور کر کے معدے کو طاقتور بنانے اور بھوک لگانے میں مفید",
                "جگر کی اصلاح میں معاون",
                "حاملہ اور دودھ پلانے والی خواتین کے لیے موزوں",
                "بچوں کی نشوونما میں معاون"
            ],
            ingredients: "سیب، انار اور انگور کے رس، مختلف جڑی بوٹیاں اور فولاد۔",
            usage: "صبح، دوپہر اور رات 2 بڑے چمچ دودھ، ملک شیک، جوس یا پانی میں ملا کر استعمال کریں۔ سردیوں میں گرم دودھ یا چائے میں بھی لیا جا سکتا ہے۔"
        }
    },
    {
        id: 2,
        name: "Almond & Amla Hair Oil (آملہ + بادام ہیئر آئل)",
        price: 720,
        image: "/Product Images/Almond & Amla Hair Oil.jpeg",
        descEnglish: {
            subheading: "Traditional Herbal Blend for Long, Thick & Strong Hair",
            about: "Give your hair the natural care it deserves with Al Hashmi Natural Almond & Amla Hair Oil, a traditional herbal blend crafted for both women and men. Made from pure herbs and nourishing natural oils, it is designed to help you achieve long, thick, strong, and beautifully shiny hair.",
            benefits: [
                "Helps promote long, thick, and healthy-looking hair",
                "Strengthens hair from the roots and helps reduce hair fall",
                "Helps with split ends and dry, rough hair",
                "Helps slow premature greying",
                "Leaves hair soft, smooth, and glossy",
                "Suitable for both women and men"
            ],
            ingredients: "Almond oil, Amla, coconut oil, castor oil, olive oil, Kalonji, Rosemary, Henna leaves, Methi Dana, Rose petals, Bahera, Halela Siyah, Halela Zard, Reetha, Sikakai, Char Maghaz oil, Khashkhash oil, Ratan Jot, Nagarmotha, Dhaniya, and more.",
            usage: "Take a small amount of oil and massage gently into the scalp and length of hair. Leave for 1–2 hours (or overnight), then wash with mild shampoo. Use 2–3 times a week."
        },
        descUrdu: {
            subheading: "خالص جڑی بوٹیوں اور قدرتی تیلوں سے تیار کردہ روایتی ہربل آئل",
            about: "اپنے بالوں کو دیں قدرتی نگہداشت الہاشمی نیچرل آملہ + بادام ہیئر آئل کے ساتھ۔ یہ خواتین اور مردوں دونوں کے لیے خالص جڑی بوٹیوں اور قدرتی تیلوں سے تیار کردہ ایک روایتی ہربل آئل ہے، جس کے استعمال سے بال لمبے، گھنے، مضبوط اور چمکدار ہوتے ہیں۔",
            benefits: [
                "بالوں کو لمبا، گھنا اور صحت مند بنانے میں معاون",
                "بالوں کو جڑوں سے مضبوط بناتا ہے اور گرنے میں کمی لاتا ہے",
                "دو منہ بالوں اور خشکی (روکھے پن) میں مفید",
                "بالوں کو وقت سے پہلے سفید ہونے سے بچانے میں معاون",
                "بالوں کو نرم، ملائم اور چمکدار بناتا ہے"
            ],
            ingredients: "روغنِ بادام، آملہ، ناریل آئل، کیسٹر آئل، زیتون آئل، کلونجی، روز میری، برگِ مہندی، میتھی دانہ، گلِ سرخ، بہیڑا، ہلیلہ، ریٹھا، سکاکائی، چار مغز تیل، خشخاش روغن اور دیگر۔",
            usage: "تھوڑا سا تیل لے کر سر کی جلد اور بالوں پر مالش کریں۔ 1 سے 2 گھنٹے (یا رات بھر) لگا رہنے دیں، پھر ہلکے شیمپو سے دھو لیں۔ ہفتے میں 2 سے 3 بار استعمال کریں۔"
        }
    },
    {
        id: 3,
        name: "Rogan-e-Damagi (روغنِ دماغی خاص)",
        price: 820,
        image: "/Product Images/Rogan-e-Damagi.jpeg",
        descEnglish: {
            subheading: "Ideal Herbal Tonic Oil for Hair & Brain",
            about: "Experience the traditional goodness of Al Hashmi Natural Rogan-e-Damagi, a time-honoured herbal head oil made from a rich blend of pure nut and seed oils. Designed to nourish the scalp and hair while giving your head a soothing, cooling, and refreshing feel.",
            benefits: [
                "Traditionally used to support mental freshness and relaxation",
                "Gives a cooling, calming, and refreshing sensation to the head",
                "Helps with headaches and a heavy or tired head",
                "Helps with dry scalp and scalp itching",
                "Traditionally used for dizziness, forgetfulness, and weak memory",
                "Traditionally used for a better sleep routine"
            ],
            ingredients: "Almond oil (Badam Roghan), Pumpkin seed oil (Kaddu Roghan), Poppy seed oil (Khashkhash Roghan), Char Maghz oil, Walnut oil, Coconut kernel oil, Olive oil, Lettuce seed oil, and variety of other nuts.",
            usage: "Before sleeping at night, take 2 drops and apply gently on the head. Massage softly for a few minutes. For best results, use regularly."
        },
        descUrdu: {
            subheading: "بالوں اور دماغ کے لیے انمول ہربل ٹانک",
            about: "الہاشمی نیچرل روغنِ دماغی خالص مغزیات اور بیجوں کے تیلوں کے حسین امتزاج سے تیار کردہ ایک روایتی ہربل آئل ہے۔ یہ بالوں اور سر کی جلد کو غذائیت دینے کے ساتھ ساتھ دماغ کو ٹھنڈک، سکون اور فرحت کا احساس بخشتا ہے۔",
            benefits: [
                "دماغی تازگی اور سکون کے لیے روایتی طور پر مفید",
                "دماغ میں ٹھنڈک، سکون اور فرحت پیدا کرتا ہے",
                "سر میں درد اور بھاری پن میں مفید",
                "سر کی خشکی اور خارش میں مددگار",
                "چکر آنا، بھول جانا اور حافظے کی کمزوری میں مفید",
                "نیند کے بہتر معمول میں معاون"
            ],
            ingredients: "بادام روغن، کدو روغن، خشخاش روغن، چار مغز روغن، گری آئل، زیتون آئل، کاہو روغن، اخروٹ روغن اور مختلف مغزیات۔",
            usage: "رات کو سوتے وقت دو قطرے سر پر ہلکے ہاتھ سے لگائیں اور چند منٹ آہستہ آہستہ مالش کریں۔ باقاعدگی سے استعمال کریں۔"
        }
    }
];

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    newOrder.deliveryCharges = DELIVERY_CHARGES;
    const itemsTotal = (newOrder.items || []).reduce((acc, item) => acc + (item.price * item.qty), 0);
    newOrder.subtotal = itemsTotal;
    newOrder.totalAmount = itemsTotal + DELIVERY_CHARGES;

    savedOrders.unshift(newOrder);
    res.status(200).json({ message: 'Order received successfully!', deliveryCharges: DELIVERY_CHARGES });
});

app.get('/api/admin/orders', (req, res) => {
    res.json(savedOrders);
});

app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Al Hashmi Natural - Admin Orders</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #f4f8f5; }
                h1 { color: #2c5e3b; margin-bottom: 20px; }
                .order-card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 6px solid #2c5e3b; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                .order-card h3 { color: #2c5e3b; margin-top: 0; }
                ul { margin: 8px 0; padding-left: 20px; }
                .price-breakdown { background: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 10px; }
            </style>
        </head>
        <body>
            <h1>📦 Received Orders (${savedOrders.length})</h1>
            ${savedOrders.length === 0 ? '<p>Abhi tak koi order nahi aaya hai.</p>' : ''}
            ${savedOrders.map(o => `
                <div class="order-card">
                    <h3>Order Date: ${o.orderDate || new Date().toLocaleString()}</h3>
                    <p><strong>Customer Name:</strong> ${o.customerName}</p>
                    <p><strong>Phone:</strong> ${o.phone}</p>
                    <p><strong>City:</strong> ${o.city}</p>
                    <p><strong>Address:</strong> ${o.address}</p>
                    <p><strong>Ordered Items:</strong></p>
                    <ul>
                        ${(o.items || []).map(item => `<li>${item.name} x${item.qty} = Rs. ${item.price * item.qty}</li>`).join('')}
                    </ul>
                    <div class="price-breakdown">
                        <p style="margin: 3px 0;"><strong>Subtotal:</strong> Rs. ${o.subtotal || (o.items || []).reduce((acc, item) => acc + (item.price * item.qty), 0)}</p>
                        <p style="margin: 3px 0;"><strong>Delivery Charges (All Pakistan):</strong> Rs. ${o.deliveryCharges || DELIVERY_CHARGES}</p>
                        <h4 style="color:#2c5e3b; margin: 8px 0 0 0;">Total Payable: Rs. ${o.totalAmount}</h4>
                    </div>
                </div>
            `).join('')}
        </body>
        </html>
    `);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html'));
});

module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running smoothly on http://localhost:${PORT}`);
    });
}
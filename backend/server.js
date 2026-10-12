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

// Flat Delivery Charges
const DELIVERY_CHARGES = 150;

// Store received orders in memory
let savedOrders = [];

// ADMIN SECRET PASSWORD (Aap is password ko badal bhi sakte hain)
const ADMIN_PASSWORD = "alhashminatural123";

// Real Products Data
const products = [
    {
        id: 1,
        name: "Sharbat Aksir-e-Jism",
        price: 680,
        image: "/Product Images/Aksir-e-Jism.jpeg",
        descEnglish: {
            subheading: "A Herbal Fruit Tonic for Women, Men & Children (Size: 240 ml)",
            about: "Nourish your body the traditional way with Al Hashmi Natural Sharbat Aksir-e-Jism...",
            benefits: ["Supports people with low blood levels", "Helps reduce tiredness and weakness"],
            ingredients: "Apple juice, pomegranate juice, grape juice, selected herbs, and iron.",
            usage: "Take 2 tablespoons 3 times daily with milk or water."
        },
        descUrdu: {
            subheading: "خواتین، مردوں اور بچوں کے لیے بہترین ٹانک",
            about: "الہاشمی نیچرل شربت اکسیرِ جسم سیب، انار اور انگور کے رس سے تیار کردہ روایتی ہربل ٹانک ہے۔",
            benefits: ["خون کی کمی اور وزن کی کمی میں مفید", "تھکاوٹ دور کرنے میں مددگار"],
            ingredients: "سیب، انار، انگور کے رس اور فولاد۔",
            usage: "صبح، دوپہر اور رات 2 چمچ استعمال کریں۔"
        }
    },
    {
        id: 2,
        name: "Almond & Amla Hair Oil",
        price: 580,
        image: "/Product Images/Almond & Amla Hair Oil.jpeg",
        descEnglish: {
            subheading: "Traditional Herbal Blend for Long, Thick & Strong Hair",
            about: "Give your hair the natural care it deserves with Al Hashmi Natural Almond & Amla Hair Oil...",
            benefits: ["Helps promote long and thick hair", "Strengthens hair roots"],
            ingredients: "Almond oil, Amla, coconut oil, castor oil, olive oil.",
            usage: "Massage gently into scalp. Wash after 1-2 hours."
        },
        descUrdu: {
            subheading: "خالص جڑی بوٹیوں سے تیار کردہ روایتی ہربل آئل",
            about: "اپنے بالوں کو دیں قدرتی نگہداشت الہاشمی نیچرل آملہ + بادام ہیئر آئل کے ساتھ۔",
            benefits: ["بالوں کو لمبا اور گھنا بنانے میں معاون", "گرتے بالوں کو روکتا hai"],
            ingredients: "روغنِ بادام، آملہ، ناریل آئل، کیسٹر آئل۔",
            usage: "سر کی جلد پر مالش کریں اور 1-2 گھنٹے بعد دھو لیں۔"
        }
    },
    {
        id: 3,
        name: "Rogan-e-Damagi",
        price: 720,
        image: "/Product Images/Rogan-e-Damagi.jpeg",
        descEnglish: {
            subheading: "Ideal Herbal Tonic Oil for Hair & Brain",
            about: "Experience the traditional goodness of Al Hashmi Natural Rogan-e-Damagi...",
            benefits: ["Supports mental freshness and relaxation", "Helps with headaches"],
            ingredients: "Almond oil, Pumpkin seed oil, Poppy seed oil, Walnut oil.",
            usage: "Apply 2 drops on the head at bedtime."
        },
        descUrdu: {
            subheading: "بالوں اور دماغ کے لیے انمول ہربل ٹانک",
            about: "خالص مغزیات اور بیجوں کے تیلوں کے حسین امتزاج سے تیار کردہ ہربل آئل۔",
            benefits: ["دماغی تازگی اور سکون کے لیے مفید", "سر میں ٹھنڈک پیدا کرتا hai"],
            ingredients: "بادام روغن، کدو روغن، خشخاش روغن، اخروٹ روغن۔",
            usage: "رات کو سوتے وقت ہلکی مالش کریں۔"
        }
    }
];

// API Endpoints
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Save New Order
app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    newOrder.deliveryCharges = DELIVERY_CHARGES;
    const itemsTotal = (newOrder.items || []).reduce((acc, item) => acc + (item.price * item.qty), 0);
    newOrder.subtotal = itemsTotal;
    newOrder.totalAmount = itemsTotal + DELIVERY_CHARGES;

    savedOrders.unshift(newOrder);
    res.status(200).json({ message: 'Order received successfully!', deliveryCharges: DELIVERY_CHARGES });
});

// SECURED ADMIN PANEL WITH PASSWORD PROTECTION
app.get('/admin', (req, res) => {
    const userPassword = req.query.pass;

    // Password Verification Check
    if (!userPassword || userPassword !== ADMIN_PASSWORD) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Login - Restricted Access</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #1a3626; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    .login-card { background: white; padding: 35px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.3); text-align: center; width: 320px; }
                    h2 { color: #2c5e3b; margin-bottom: 10px; }
                    p { font-size: 13px; color: #666; margin-bottom: 20px; }
                    input { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
                    button { background: #2c5e3b; color: white; border: none; padding: 10px; width: 100%; border-radius: 6px; font-weight: bold; cursor: pointer; }
                </style>
            </head>
            <body>
                <div class="login-card">
                    <h2>🔒 Admin Access</h2>
                    <p>Enter Admin Password to View Customer Orders:</p>
                    <form method="GET" action="/admin">
                        <input type="password" name="pass" placeholder="Enter Password" required>
                        <button type="submit">Login</button>
                    </form>
                </div>
            </body>
            </html>
        `);
    }

    // Authenticated View
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Al Hashmi Natural - Admin Orders</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #f4f8f5; }
                h1 { color: #2c5e3b; margin-bottom: 20px; }
                .logout-btn { background: #d9534f; color: white; padding: 8px 15px; text-decoration: none; border-radius: 5px; font-weight: bold; float: right; }
                .order-card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 6px solid #2c5e3b; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                .order-card h3 { color: #2c5e3b; margin-top: 0; }
                ul { margin: 8px 0; padding-left: 20px; }
                .price-breakdown { background: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 10px; }
            </style>
        </head>
        <body>
            <a href="/admin" class="logout-btn">Logout</a>
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

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html'));
});

module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running smoothly on http://localhost:${PORT}`);
    });
}
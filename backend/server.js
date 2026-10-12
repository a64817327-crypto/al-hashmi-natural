const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Serve static files from root directory
app.use(express.static(process.cwd()));
app.use('/Product Images', express.static(path.join(process.cwd(), 'Product Images')));
app.use('/Product%20Images', express.static(path.join(process.cwd(), 'Product Images')));

const DELIVERY_CHARGES = 150;
const ADMIN_PASSWORD = "alhashminatural123";

// ---------------------------------------------------------
// MONGOOSE DATABASE SCHEMA (PERMANENT STORAGE)
// ---------------------------------------------------------
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://alhashmi:alhashmi123@cluster0.mongodb.net/alhashmi_store?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Permanent Database Connected Successfully!'))
    .catch(err => console.log('MongoDB Connection Warning (Using Memory Fallback):', err.message));

const orderSchema = new mongoose.Schema({
    customerName: String,
    phone: String,
    city: String,
    address: String,
    items: Array,
    subtotal: Number,
    deliveryCharges: Number,
    totalAmount: Number,
    status: { type: String, default: 'pending' },
    orderDate: { type: String, default: () => new Date().toLocaleString() }
});

const Order = mongoose.model('Order', orderSchema);

// Memory Fallback Array (in case DB is connecting)
let memoryOrders = [];

// Setup Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'a23158700@gmail.com',
        pass: process.env.EMAIL_APP_PASSWORD || ''
    }
});

// Products Data
const products = [
    { id: 1, name: "Sharbat Aksir-e-Jism", price: 680, image: "/Product Images/Aksir-e-Jism.jpeg" },
    { id: 2, name: "Almond & Amla Hair Oil", price: 580, image: "/Product Images/Almond & Amla Hair Oil.jpeg" },
    { id: 3, name: "Rogan-e-Damagi", price: 720, image: "/Product Images/Rogan-e-Damagi.jpeg" }
];

app.get('/api/products', (req, res) => {
    res.json(products);
});

// SAVE ORDER TO PERMANENT DATABASE
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        orderData.deliveryCharges = DELIVERY_CHARGES;
        const itemsTotal = (orderData.items || []).reduce((acc, item) => acc + (item.price * item.qty), 0);
        orderData.subtotal = itemsTotal;
        orderData.totalAmount = itemsTotal + DELIVERY_CHARGES;
        orderData.status = 'pending';
        orderData.orderDate = new Date().toLocaleString();

        let savedDoc = null;
        if (mongoose.connection.readyState === 1) {
            const newOrder = new Order(orderData);
            savedDoc = await newOrder.save();
        } else {
            orderData._id = Date.now().toString();
            memoryOrders.unshift(orderData);
            savedDoc = orderData;
        }

        // Email Backup
        if (process.env.EMAIL_APP_PASSWORD) {
            const itemsListText = (orderData.items || []).map(i => `• ${i.name} (Qty: ${i.qty}) - Rs. ${i.price * i.qty}`).join('\n');
            const mailOptions = {
                from: 'Al Hashmi Natural Store <a23158700@gmail.com>',
                to: 'a23158700@gmail.com',
                subject: `🚨 NEW ORDER RECEIVED - ${orderData.customerName}`,
                text: `Customer Name: ${orderData.customerName}\nPhone: ${orderData.phone}\nCity: ${orderData.city}\nAddress: ${orderData.address}\n\nITEMS:\n${itemsListText}\n\nSubtotal: Rs. ${orderData.subtotal}\nDelivery Fee: Rs. ${DELIVERY_CHARGES}\nTOTAL BILL: Rs. ${orderData.totalAmount}`
            };
            transporter.sendMail(mailOptions).catch(e => console.log('Email fail:', e));
        }

        res.status(200).json({ message: 'Order received successfully!', deliveryCharges: DELIVERY_CHARGES });
    } catch (err) {
        console.error('Order Save Error:', err);
        res.status(500).json({ error: 'Order save karne mein masla aaya' });
    }
});

// TOGGLE ORDER STATUS (PENDING <-> DELIVERED) IN DATABASE
app.post('/api/admin/toggle-status', async (req, res) => {
    const { pass, orderId } = req.body;
    if (pass !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        if (mongoose.connection.readyState === 1) {
            const order = await Order.findById(orderId);
            if (order) {
                order.status = order.status === 'delivered' ? 'pending' : 'delivered';
                await order.save();
                return res.json({ success: true, newStatus: order.status });
            }
        } else {
            const order = memoryOrders.find(o => o._id === orderId || o.id == orderId);
            if (order) {
                order.status = order.status === 'delivered' ? 'pending' : 'delivered';
                return res.json({ success: true, newStatus: order.status });
            }
        }
        res.status(404).json({ error: 'Order not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SECURED ADMIN PANEL WITH DATABASE FETCHING
app.get('/admin', async (req, res) => {
    const userPassword = req.query.pass;

    if (!userPassword || userPassword !== ADMIN_PASSWORD) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Login - Al Hashmi Natural</title>
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

    let allOrders = [];
    if (mongoose.connection.readyState === 1) {
        allOrders = await Order.find().sort({ _id: -1 });
    } else {
        allOrders = memoryOrders;
    }

    const pendingOrders = allOrders.filter(o => o.status !== 'delivered');
    const deliveredOrders = allOrders.filter(o => o.status === 'delivered');

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Al Hashmi Natural - Order Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #f4f8f5; margin: 0; }
                .header { background: #2c5e3b; color: white; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
                .header h1 { margin: 0; font-size: 1.5rem; }
                .logout-btn { background: #d9534f; color: white; padding: 8px 15px; text-decoration: none; border-radius: 5px; font-weight: bold; }
                .tabs { display: flex; gap: 10px; margin-bottom: 20px; }
                .tab-btn { padding: 12px 24px; border: none; background: #e0e0e0; color: #333; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 15px; }
                .tab-btn.active { background: #2c5e3b; color: white; }
                .badge { background: #e67e22; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 5px; }
                .tab-content { display: none; }
                .tab-content.active { display: block; }
                .order-card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 6px solid #2c5e3b; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                .order-card.delivered-card { border-left-color: #25d366; background: #fafafa; }
                .price-breakdown { background: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 10px; }
                .status-btn { background: #25d366; color: white; border: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 15px; }
                .status-btn.undo-btn { background: #6c757d; }
                .status-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
                .badge-pending { background: #fff3cd; color: #856404; }
                .badge-delivered { background: #d4edda; color: #155724; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📦 Al Hashmi Natural - Permanent Order Dashboard</h1>
                <a href="/admin" class="logout-btn">Logout</a>
            </div>

            <div class="tabs">
                <button class="tab-btn active" onclick="switchTab('pending')">
                    ⏳ Pending Orders <span class="badge" style="background:#e67e22;">${pendingOrders.length}</span>
                </button>
                <button class="tab-btn" onclick="switchTab('delivered')">
                    🚚 Delivered History <span class="badge" style="background:#25d366;">${deliveredOrders.length}</span>
                </button>
            </div>

            <div id="pending-tab" class="tab-content active">
                ${pendingOrders.length === 0 ? '<p style="padding: 20px; background: white; border-radius: 8px;">Koi pending order nahi hai.</p>' : ''}
                ${pendingOrders.map(o => `
                    <div class="order-card">
                        <span class="status-badge badge-pending">⏳ Pending Delivery</span>
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
                            <p style="margin: 3px 0;"><strong>Subtotal:</strong> Rs. ${o.subtotal}</p>
                            <p style="margin: 3px 0;"><strong>Delivery Charges:</strong> Rs. ${o.deliveryCharges}</p>
                            <h4 style="color:#2c5e3b; margin: 8px 0 0 0;">Total Payable: Rs. ${o.totalAmount}</h4>
                        </div>
                        <button class="status-btn" onclick="toggleStatus('${o._id || o.id}')">✅ Mark as Delivered</button>
                    </div>
                `).join('')}
            </div>

            <div id="delivered-tab" class="tab-content">
                ${deliveredOrders.length === 0 ? '<p style="padding: 20px; background: white; border-radius: 8px;">Abhi tak koi order deliver nahi hua.</p>' : ''}
                ${deliveredOrders.map(o => `
                    <div class="order-card delivered-card">
                        <span class="status-badge badge-delivered">✅ Delivered</span>
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
                            <p style="margin: 3px 0;"><strong>Subtotal:</strong> Rs. ${o.subtotal}</p>
                            <p style="margin: 3px 0;"><strong>Delivery Charges:</strong> Rs. ${o.deliveryCharges}</p>
                            <h4 style="color:#2c5e3b; margin: 8px 0 0 0;">Total Paid: Rs. ${o.totalAmount}</h4>
                        </div>
                        <button class="status-btn undo-btn" onclick="toggleStatus('${o._id || o.id}')">↩️ Move Back to Pending</button>
                    </div>
                `).join('')}
            </div>

            <script>
                function switchTab(tabName) {
                    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                    if (tabName === 'pending') {
                        document.querySelectorAll('.tab-btn')[0].classList.add('active');
                        document.getElementById('pending-tab').classList.add('active');
                    } else {
                        document.querySelectorAll('.tab-btn')[1].classList.add('active');
                        document.getElementById('delivered-tab').classList.add('active');
                    }
                }

                async function toggleStatus(orderId) {
                    try {
                        const res = await fetch('/api/admin/toggle-status', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ pass: '${ADMIN_PASSWORD}', orderId: orderId })
                        });
                        if (res.ok) {
                            location.reload();
                        }
                    } catch (err) {
                        alert('Status update karne mein masla aaya.');
                    }
                }
            </script>
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
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
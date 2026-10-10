const express = require("express");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(express.json());

// Main folder aur backend folder dono ke static files ko allow karein
app.use(express.static(path.join(__dirname, "../")));
app.use(express.static(__dirname));

// Sample Products
const products = [
    { id: 1, name: "Natural Herbal Blend", price: 850 },
    { id: 2, name: "Natural Herbal Oil", price: 1200 },
    { id: 3, name: "Pure Natural Honey", price: 1000 },
    { id: 4, name: "Natural Herbal Powder", price: 650 }
];

let ordersList = [];

// Main HTML Pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/admin.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../admin.html"));
});

// Products API
app.get("/api/products", (req, res) => {
    res.json(products);
});

// Order Save API
app.post("/api/orders", (req, res) => {
    const newOrder = req.body;
    ordersList.push(newOrder);
    console.log("🛒 New Order Received:", newOrder);
    res.status(200).json({ success: true, message: "Order saved successfully" });
});

// Admin Fetch Orders API
app.get("/api/orders", (req, res) => {
    res.json(ordersList);
});

app.listen(PORT, () => {
    console.log(`Server running smoothly on http://localhost:${PORT}`);
});
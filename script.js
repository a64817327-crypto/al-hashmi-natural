let cart = [];
const DELIVERY_CHARGES = 499; // Flat Delivery Fee Nationwide

async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Network error');
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

function renderProducts(products) {
    const container = document.getElementById('product-container');
    if (!container) return;
    
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.border = "1px solid #ddd";
        card.style.borderRadius = "10px";
        card.style.padding = "15px";
        card.style.marginBottom = "20px";
        card.style.backgroundColor = "#fff";
        card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";

        // English Benefits
        const engBenefits = product.descEnglish.benefits.map(b => `<li>${b}</li>`).join('');
        // Urdu Benefits
        const urduBenefits = product.descUrdu.benefits.map(b => `<li>${b}</li>`).join('');

        card.innerHTML = `
            <div style="text-align: center;">
                <img src="${product.image}" alt="${product.name}" style="max-height: 260px; width: auto; object-fit: contain; border-radius: 8px;">
            </div>
            
            <h2 style="color: #2c5e3b; margin-top: 15px; text-align: center;">${product.name}</h2>
            <p style="text-align: center; font-weight: bold; color: #e67e22; font-size: 1.2rem;">Rs. ${product.price}</p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">

            <!-- English Description -->
            <div style="font-size: 14px; color: #333; line-height: 1.5; margin-bottom: 15px;">
                <h4 style="color: #2c5e3b; margin-bottom: 5px;">${product.descEnglish.subheading}</h4>
                <p>${product.descEnglish.about}</p>
                <strong>Key Benefits:</strong>
                <ul style="padding-left: 20px; margin: 5px 0;">${engBenefits}</ul>
                <p><strong>Ingredients:</strong> ${product.descEnglish.ingredients}</p>
                <p><strong>How to Use:</strong> ${product.descEnglish.usage}</p>
            </div>

            <!-- Urdu Description -->
            <div style="font-size: 15px; color: #222; line-height: 1.8; direction: rtl; text-align: right; background-color: #f9fdfa; padding: 12px; border-radius: 6px; border-right: 4px solid #2c5e3b;">
                <h4 style="color: #2c5e3b; margin-bottom: 5px;">${product.descUrdu.subheading}</h4>
                <p>${product.descUrdu.about}</p>
                <strong>اہم فوائد:</strong>
                <ul style="padding-right: 20px; margin: 5px 0;">${urduBenefits}</ul>
                <p><strong>اجزاء:</strong> ${product.descUrdu.ingredients}</p>
                <p><strong>طریقۂ استعمال:</strong> ${product.descUrdu.usage}</p>
            </div>

            <div style="text-align: center; margin-top: 20px;">
                <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})" style="background-color: #2c5e3b; color: white; border: none; padding: 12px 25px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;">
                    🛒 Add to Cart (Rs. ${product.price})
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }
    updateCartUI();
    alert(`${name} cart mein add ho gaya hai!`);
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCount) cartCount.innerText = totalItems;

    const list = document.getElementById('cart-items-list');
    const totalPriceEl = document.getElementById('cart-total-price');

    if (!list) return;

    if (cart.length === 0) {
        list.innerHTML = '<p>Aap ka cart khali hai.</p>';
        if (totalPriceEl) totalPriceEl.innerText = '0';
        return;
    }

    let subtotal = 0;
    let html = '<ul style="list-style: none; padding: 0;">';
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        html += `<li style="margin-bottom: 8px; border-bottom: 1px dashed #eee; padding-bottom: 5px;">${item.name} x ${item.qty} = <strong>Rs. ${itemTotal}</strong></li>`;
    });
    html += '</ul>';

    const grandTotal = subtotal + DELIVERY_CHARGES;
    html += `
        <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; margin-top: 15px; border: 1px solid #e2e8f0;">
            <p style="margin: 4px 0; display: flex; justify-content: space-between;"><span>Items Subtotal:</span> <span>Rs. ${subtotal}</span></p>
            <p style="margin: 4px 0; display: flex; justify-content: space-between; color: #2c5e3b;"><span>Delivery Charges (All Pakistan):</span> <span>Rs. ${DELIVERY_CHARGES}</span></p>
            <hr style="margin: 8px 0; border: 0; border-top: 1px solid #cbd5e1;">
            <p style="margin: 4px 0; font-size: 1.1rem; font-weight: bold; color: #2c5e3b; display: flex; justify-content: space-between;"><span>Total Payable:</span> <span>Rs. ${grandTotal}</span></p>
        </div>
    `;

    list.innerHTML = html;
    if (totalPriceEl) totalPriceEl.innerText = grandTotal;
}

function openCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'flex';
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'none';
}

async function handleCheckout(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Aap ka cart khali hai!");
        return;
    }

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const city = document.getElementById('cust-city').value;
    const address = document.getElementById('cust-address').value;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const grandTotal = subtotal + DELIVERY_CHARGES;

    const orderData = {
        customerName: name,
        phone: phone,
        city: city,
        address: address,
        items: cart,
        subtotal: subtotal,
        deliveryCharges: DELIVERY_CHARGES,
        totalAmount: grandTotal,
        orderDate: new Date().toLocaleString()
    };

    // 1. Send Order to Backend API
    try {
        await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
    } catch (error) {
        console.error('Error saving order:', error);
    }

    // 2. Dynamic Order Summary Receipt Update
    const summaryContainer = document.querySelector('.order-card-summary') || document.querySelector('.order-summary') || document.getElementById('order-receipt-details');
    if (summaryContainer) {
        const itemsList = cart.map(item => `<li>${item.name} - Qty: ${item.qty} (Rs. ${item.price * item.qty})</li>`).join('');
        summaryContainer.innerHTML = `
            <p><strong>Customer Name:</strong> ${name}</p>
            <p><strong>Phone Number:</strong> ${phone}</p>
            <p><strong>City:</strong> ${city}</p>
            <p><strong>Address:</strong> ${address}</p>
            <hr style="margin: 10px 0; border: 0; border-top: 1px solid #ddd;">
            <p><strong>Ordered Products:</strong></p>
            <ul style="padding-left: 20px; margin-bottom: 10px;">${itemsList}</ul>
            <div style="background-color: #f4f8f5; padding: 12px; border-radius: 6px; border: 1px solid #d1e7dd;">
                <p style="margin: 3px 0; display: flex; justify-content: space-between;"><span>Subtotal:</span> <span>Rs. ${subtotal}</span></p>
                <p style="margin: 3px 0; display: flex; justify-content: space-between; color: #2c5e3b;"><span>Delivery Charges (All Pakistan):</span> <span>Rs. ${DELIVERY_CHARGES}</span></p>
                <hr style="margin: 6px 0; border: 0; border-top: 1px solid #a3cfbb;">
                <h4 style="color: #2c5e3b; margin: 4px 0 0 0; display: flex; justify-content: space-between;"><span>Total Bill:</span> <span>Rs. ${grandTotal}</span></h4>
            </div>
        `;
    }

    // 3. Prepare WhatsApp Redirection
    const itemsText = cart.map(item => `• ${item.name} (x${item.qty}) - Rs. ${item.price * item.qty}`).join('\n');
    const whatsappMessage = `*New Order Received - Al Hashmi Natural*\n\n*Customer Name:* ${name}\n*Phone:* ${phone}\n*City:* ${city}\n*Address:* ${address}\n\n*Items Ordered:*\n${itemsText}\n\n*Subtotal:* Rs. ${subtotal}\n*Delivery Charges (All Pakistan):* Rs. ${DELIVERY_CHARGES}\n*Total Amount:* Rs. ${grandTotal}`;
    
    const whatsappBtn = document.getElementById('whatsapp-share-btn') || document.querySelector('button[onclick*="whatsapp"]') || document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.onclick = function() {
            window.open(`https://wa.me/923128538441?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
        };
    }

    closeCartModal();
    cart = [];
    updateCartUI();
    if (document.getElementById('checkout-form')) document.getElementById('checkout-form').reset();

    const summaryModal = document.getElementById('receipt-modal') || document.getElementById('summary-modal') || document.getElementById('order-summary-modal');
    if (summaryModal) summaryModal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', fetchProducts);
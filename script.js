let cart = [];
const DELIVERY_CHARGES = 150; // Flat Delivery Fee Nationwide (Rs. 150)

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
        card.style.border = "1px solid #e0e0e0";
        card.style.borderRadius = "12px";
        card.style.padding = "20px";
        card.style.marginBottom = "25px";
        card.style.backgroundColor = "#fff";
        card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";

        const engBenefits = product.descEnglish.benefits.map(b => `<li style="margin-bottom: 6px;">${b}</li>`).join('');
        const urduBenefits = product.descUrdu.benefits.map(b => `<li style="margin-bottom: 6px;">${b}</li>`).join('');

        card.innerHTML = `
            <div style="text-align: center;">
                <img src="${product.image}" alt="${product.name}" style="max-height: 270px; width: auto; object-fit: contain; border-radius: 8px;">
            </div>
            
            <h2 style="color: #2c5e3b; margin-top: 18px; text-align: center; font-size: 1.6rem; font-weight: 700;">${product.name}</h2>
            <p style="text-align: center; font-weight: 800; color: #e67e22; font-size: 1.3rem; margin: 8px 0;">Rs. ${product.price}</p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 18px 0;">

            <!-- English Description -->
            <div style="font-size: 15px; color: #2d3748; line-height: 1.7; margin-bottom: 20px; font-family: Arial, sans-serif;">
                <h3 style="color: #2c5e3b; margin-bottom: 8px; font-size: 1.15rem; font-weight: 700;">${product.descEnglish.subheading}</h3>
                <p style="margin-bottom: 12px; color: #4a5568; font-size: 15px;">${product.descEnglish.about}</p>
                
                <h4 style="color: #2c5e3b; margin: 12px 0 6px 0; font-size: 1rem; font-weight: 700;">Key Benefits:</h4>
                <ul style="padding-left: 22px; margin: 6px 0 12px 0; color: #333; font-size: 15px;">${engBenefits}</ul>
                
                <p style="margin: 8px 0;"><strong style="color: #2c5e3b; font-size: 1rem;">Ingredients:</strong> <span style="color: #4a5568;">${product.descEnglish.ingredients}</span></p>
                <p style="margin: 8px 0;"><strong style="color: #2c5e3b; font-size: 1rem;">How to Use:</strong> <span style="color: #4a5568;">${product.descEnglish.usage}</span></p>
            </div>

            <!-- Urdu Description -->
            <div style="font-size: 15px; color: #222; line-height: 1.8; direction: rtl; text-align: right; background-color: #f9fdfa; padding: 15px; border-radius: 8px; border-right: 5px solid #2c5e3b; margin-bottom: 15px;">
                <h3 style="color: #2c5e3b; margin-bottom: 8px; font-size: 1.2rem; font-weight: 700;">${product.descUrdu.subheading}</h3>
                <p style="margin-bottom: 10px;">${product.descUrdu.about}</p>
                <h4 style="color: #2c5e3b; margin: 10px 0 6px 0; font-size: 1.05rem; font-weight: 700;">اہم فوائد:</h4>
                <ul style="padding-right: 22px; margin: 6px 0 10px 0;">${urduBenefits}</ul>
                <p style="margin: 6px 0;"><strong>اجزاء:</strong> ${product.descUrdu.ingredients}</p>
                <p style="margin: 6px 0;"><strong>طریقۂ استعمال:</strong> ${product.descUrdu.usage}</p>
            </div>

            <div style="text-align: center; margin-top: 22px;">
                <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})" style="background-color: #2c5e3b; color: white; border: none; padding: 12px 28px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; box-shadow: 0 2px 6px rgba(44,94,59,0.3);">
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

    const nameEl = document.getElementById('cust-name') || document.querySelector('input[placeholder*="Name"]') || document.querySelector('input[name*="name"]');
    const phoneEl = document.getElementById('cust-phone') || document.querySelector('input[placeholder*="Phone"]') || document.querySelector('input[name*="phone"]');
    const cityEl = document.getElementById('cust-city') || document.querySelector('input[placeholder*="City"]') || document.querySelector('input[name*="city"]');
    const addressEl = document.getElementById('cust-address') || document.querySelector('textarea') || document.querySelector('input[placeholder*="Address"]');

    const name = nameEl ? nameEl.value : 'Customer';
    const phone = phoneEl ? phoneEl.value : '';
    const city = cityEl ? cityEl.value : '';
    const address = addressEl ? addressEl.value : '';

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

    // 1. Post order to backend API
    try {
        await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
    } catch (error) {
        console.error('Error saving order:', error);
    }

    // 2. FORCE OVERRIDE RECEIPT MODAL DOM
    const updateModalDOM = () => {
        const itemsListHTML = cart.map(item => `<li style="margin-bottom: 4px;">${item.name} - Qty: ${item.qty} (Rs. ${item.price * item.qty})</li>`).join('');

        // Find Order Summary Box by Searching Content
        const allDivs = Array.from(document.querySelectorAll('div'));
        const receiptContainer = allDivs.find(d => 
            d.innerText && 
            (d.innerText.includes('Customer Name:') || d.innerText.includes('Ordered Products:')) &&
            d.children.length > 0
        );

        if (receiptContainer) {
            receiptContainer.innerHTML = `
                <p style="margin: 4px 0;"><strong>Customer Name:</strong> ${name}</p>
                <p style="margin: 4px 0;"><strong>Phone Number:</strong> ${phone}</p>
                <p style="margin: 4px 0;"><strong>City:</strong> ${city}</p>
                <p style="margin: 4px 0;"><strong>Address:</strong> ${address}</p>
                <hr style="margin: 10px 0; border: 0; border-top: 1px solid #ddd;">
                <p style="margin: 4px 0; font-weight: bold;">Ordered Products:</p>
                <ul style="padding-left: 20px; margin: 6px 0;">${itemsListHTML}</ul>
                <div style="background-color: #f4f8f5; padding: 12px; border-radius: 8px; margin-top: 12px; border: 1px solid #c3e6cb;">
                    <p style="margin: 3px 0; display: flex; justify-content: space-between; font-size: 14px;"><span>Items Subtotal:</span> <span>Rs. ${subtotal}</span></p>
                    <p style="margin: 3px 0; display: flex; justify-content: space-between; color: #2c5e3b; font-size: 14px;"><span>Delivery Charges (All Pakistan):</span> <span>Rs. ${DELIVERY_CHARGES}</span></p>
                    <hr style="margin: 6px 0; border: 0; border-top: 1px solid #a3cfbb;">
                    <h4 style="color: #2c5e3b; margin: 4px 0 0 0; font-size: 1.15rem; display: flex; justify-content: space-between;"><span>Total Bill:</span> <span>Rs. ${grandTotal}</span></h4>
                </div>
            `;
        }

        // Search for explicit 'Total Bill' text nodes if present
        allDivs.forEach(div => {
            if (div.children.length === 0 && div.innerText && div.innerText.includes('Total Bill:')) {
                div.innerHTML = `<strong>Total Bill (inc. Rs. ${DELIVERY_CHARGES} Delivery): Rs. ${grandTotal}</strong>`;
            }
        });

        // 3. Set WhatsApp Link URL
        const itemsText = cart.map(item => `• ${item.name} (x${item.qty}) - Rs. ${item.price * item.qty}`).join('\n');
        const whatsappMessage = `*New Order Received - Al Hashmi Natural*\n\n*Customer Name:* ${name}\n*Phone:* ${phone}\n*City:* ${city}\n*Address:* ${address}\n\n*Items Ordered:*\n${itemsText}\n\n*Subtotal:* Rs. ${subtotal}\n*Delivery Charges (All Pakistan):* Rs. ${DELIVERY_CHARGES}\n*Total Amount:* Rs. ${grandTotal}`;
        const encodedURL = `https://wa.me/923128538441?text=${encodeURIComponent(whatsappMessage)}`;

        const buttons = document.querySelectorAll('button, a');
        buttons.forEach(btn => {
            if (btn.innerText && btn.innerText.toLowerCase().includes('whatsapp')) {
                btn.onclick = (e) => {
                    e.preventDefault();
                    window.open(encodedURL, '_blank');
                };
            }
            if (btn.innerText && btn.innerText.toLowerCase().includes('done')) {
                btn.onclick = () => {
                    location.reload();
                };
            }
        });
    };

    closeCartModal();
    updateModalDOM();
    
    // Clear cart after modal DOM update
    cart = [];
    updateCartUI();
    if (document.getElementById('checkout-form')) document.getElementById('checkout-form').reset();
}

document.addEventListener('DOMContentLoaded', fetchProducts);
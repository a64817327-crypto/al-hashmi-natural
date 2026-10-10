let cart = [];

// Backend se Products load karna
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('Network error');
        }
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error("Error loading products:", error);
        document.getElementById('product-container').innerHTML = 
            '<p style="color:red; font-weight:bold;">Products load nahi ho sake. Server check karein.</p>';
    }
}

// Products render karna
function renderProducts(products) {
    const container = document.getElementById('product-container');
    if (!container) return;
    
    container.innerHTML = '';

    if (!products || products.length === 0) {
        container.innerHTML = '<p>Koi product nahi mila.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">🌿</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-bottom">
                    <strong class="price">Rs. ${product.price}</strong>
                    <button class="add-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Cart Functionality
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

    let html = '<ul>';
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        html += `<li>${item.name} x ${item.qty} = Rs. ${itemTotal}</li>`;
    });
    html += '</ul>';

    list.innerHTML = html;
    if (totalPriceEl) totalPriceEl.innerText = total;
}

function openCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'flex';
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'none';
}

// Checkout Form Submission
async function handleCheckout(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Aap ka cart khali hai!");
        return;
    }

    const orderData = {
        customerName: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        city: document.getElementById('cust-city').value,
        address: document.getElementById('cust-address').value,
        items: cart,
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
        orderDate: new Date().toLocaleString()
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert('🎉 Shukriya! Aapka order successfully place ho chuka hai.');
            cart = [];
            updateCartUI();
            closeCartModal();
            document.getElementById('checkout-form').reset();
        } else {
            alert('Order submit nahi ho saka. Dobara koshish karein.');
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Server error: Order place nahi ho saka.');
    }
}

document.addEventListener('DOMContentLoaded', fetchProducts);
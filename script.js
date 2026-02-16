// Shopping Cart System
class ShoppingCart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.updateUI();
        this.bindEvents();
    }

    loadFromStorage() {
        const saved = localStorage.getItem('royalCart');
        if (saved) {
            this.items = JSON.parse(saved);
            this.calculateTotal();
        }
    }

    saveToStorage() {
        localStorage.setItem('royalCart', JSON.stringify(this.items));
    }

    addItem(name, price) {
        const existingItem = this.items.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({
                id: Date.now(),
                name,
                price,
                quantity: 1
            });
        }
        
        this.calculateTotal();
        this.saveToStorage();
        this.updateUI();
        this.showNotification(`تم إضافة ${name} إلى السلة`, 'success');
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.calculateTotal();
        this.saveToStorage();
        this.updateUI();
    }

    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.calculateTotal();
            this.saveToStorage();
            this.updateUI();
        }
    }

    calculateTotal() {
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    updateUI() {
        this.updateCartCount();
        this.updateCartItems();
        this.updateCartTotal();
    }

    updateCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
    }

    updateCartItems() {
        const cartItems = document.getElementById('cartItems');
        
        if (this.items.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">السلة فارغة</p>';
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} ريال</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-item" onclick="cart.removeItem(${item.id})">حذف</button>
            </div>
        `).join('');
    }

    updateCartTotal() {
        document.getElementById('cartTotal').textContent = `${this.total} ريال`;
        document.getElementById('summaryTotal').textContent = `${this.total} ريال`;
        this.updateOrderSummary();
    }

    updateOrderSummary() {
        const summaryItems = document.getElementById('orderSummaryItems');
        if (summaryItems) {
            summaryItems.innerHTML = this.items.map(item => `
                <div class="summary-item">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>${item.price * item.quantity} ريال</span>
                </div>
            `).join('');
        }
    }

    clearCart() {
        this.items = [];
        this.total = 0;
        this.saveToStorage();
        this.updateUI();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    bindEvents() {
        // Cart toggle
        document.getElementById('cartBtn').addEventListener('click', () => this.openCart());
        document.getElementById('closeCart').addEventListener('click', () => this.closeCart());
        document.getElementById('cartOverlay').addEventListener('click', () => this.closeCart());

        // Checkout
        document.getElementById('checkoutBtn').addEventListener('click', () => this.openCheckout());
        document.getElementById('closeModal').addEventListener('click', () => this.closeCheckout());
        document.getElementById('checkoutForm').addEventListener('submit', (e) => this.submitOrder(e));

        // Success modal
        document.getElementById('closeSuccess').addEventListener('click', () => this.closeSuccessModal());
    }

    openCart() {
        document.getElementById('cartSidebar').classList.add('open');
        document.getElementById('cartOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        document.getElementById('cartSidebar').classList.remove('open');
        document.getElementById('cartOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    openCheckout() {
        if (this.items.length === 0) {
            this.showNotification('السلة فارغة، يرجى إضافة منتجات أولاً', 'error');
            return;
        }
        
        document.getElementById('checkoutModal').classList.add('active');
        this.updateOrderSummary();
    }

    closeCheckout() {
        document.getElementById('checkoutModal').classList.remove('active');
    }

    closeSuccessModal() {
        document.getElementById('successModal').classList.remove('active');
        this.closeCart();
    }

    submitOrder(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            address: document.getElementById('customerAddress').value,
            notes: document.getElementById('orderNotes').value,
            items: this.items,
            total: this.total
        };

        // Simulate order submission
        console.log('Order submitted:', formData);
        
        // Show success modal
        document.getElementById('checkoutModal').classList.remove('active');
        document.getElementById('successModal').classList.add('active');
        
        // Clear cart and form
        this.clearCart();
        document.getElementById('checkoutForm').reset();
        
        // In a real application, you would send this data to your server
        this.showNotification('تم إرسال طلبك بنجاح!', 'success');
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Category filtering
document.addEventListener('DOMContentLoaded', function() {
    // Category tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active tab
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter menu items
            menuItems.forEach(item => {
                if (item.dataset.category === category) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
    });

    // Show first category by default
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }

    // Add to cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const name = this.dataset.name;
            const price = parseInt(this.dataset.price);
            cart.addItem(name, price);
        });
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(139, 69, 19, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(139, 69, 19, 0.1)';
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .menu-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Lazy loading for images
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Form validation
    const form = document.getElementById('checkoutForm');
    if (form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.style.borderColor = '#e74c3c';
                } else {
                    this.style.borderColor = '#ddd';
                }
            });
        });
    }

    // Phone number formatting
    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            // Allow only numbers and basic phone characters
            this.value = this.value.replace(/[^0-9+\s-]/g, '');
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close any open modals
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
            
            // Close cart if open
            if (document.getElementById('cartSidebar').classList.contains('open')) {
                cart.closeCart();
            }
        }
    });

    // Touch-friendly mobile interactions
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // Add touch feedback to buttons
        const buttons = document.querySelectorAll('.btn, .btn-add-cart, .cart-btn');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }

    // Performance optimization: Debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Apply debouncing to scroll events
    const debouncedScroll = debounce(function() {
        // Scroll-based animations can go here
    }, 10);

    window.addEventListener('scroll', debouncedScroll);

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });

    console.log('☕ رويال كافيه - تم تحميل الموقع بنجاح!');
});

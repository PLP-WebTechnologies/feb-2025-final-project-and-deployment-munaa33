document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Product Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            const productCards = document.querySelectorAll('.product-card');
            
            productCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Testimonial Slider
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    let currentSlide = 0;

    function showSlide(index) {
        testimonialSlides.forEach(slide => slide.classList.remove('active'));
        testimonialSlides[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % testimonialSlides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
        showSlide(currentSlide);
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Auto-rotate testimonials
    setInterval(nextSlide, 5000);

    // Shopping Cart Functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.querySelector('.cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeModal = document.querySelector('.close-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart');
    const checkoutBtn = document.getElementById('checkout');

    // Load products from JSON
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            displayProducts(products);
            // Add event listeners to "Add to Cart" buttons after products are loaded
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    const product = products.find(p => p.id == productId);
                    addToCart(product);
                });
            });
        })
        .catch(error => console.error('Error loading products:', error));

    function displayProducts(products) {
        const productGrid = document.getElementById('product-grid');
        productGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-category', product.category);
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="images/${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">
                        <span class="price">KSh ${product.price.toFixed(2)}</span>
                        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                    </div>
                </div>
            `;
            
            productGrid.appendChild(productCard);
        });
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        updateCart();
        showCartNotification(product.name);
    }

    function updateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Update cart modal if open
        if (cartModal.style.display === 'block') {
            renderCartItems();
        }
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
            cartTotal.textContent = 'KSh 0.00';
            return;
        }
        
        let total = 0;
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-img">
                        <img src="images/${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>KSh ${item.price.toFixed(2)} each</p>
                    </div>
                </div>
                <div class="cart-item-price-quantity">
                    <span class="cart-item-price">KSh ${itemTotal.toFixed(2)}</span>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}">&times;</button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        cartTotal.textContent = `KSh ${total.toFixed(2)}`;
        
        // Add event listeners to quantity buttons
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                updateQuantity(productId, -1);
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                updateQuantity(productId, 1);
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                removeFromCart(productId);
            });
        });
    }

    function updateQuantity(productId, change) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            cart[itemIndex].quantity += change;
            
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            
            updateCart();
        }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    }

    function showCartNotification(productName) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <p>${productName} added to cart!</p>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Cart Modal Controls
    document.querySelector('.cart-icon a').addEventListener('click', function(e) {
        e.preventDefault();
        cartModal.style.display = 'block';
        renderCartItems();
    });

    closeModal.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    clearCartBtn.addEventListener('click', function() {
        cart = [];
        updateCart();
    });

    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        alert('Thank you for your order! We will prepare your items shortly.');
        cart = [];
        updateCart();
        cartModal.style.display = 'none';
    });

    // Newsletter Form
    const newsletterForm = document.getElementById('newsletter-form');
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input').value;
        // In a real implementation, you would send this to your server
        alert(`Thank you for subscribing with ${email}! You'll receive our updates soon.`);
        this.reset();
    });

    // Initialize cart count on page load
    updateCart();
});

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--primary-color);
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 10000;
    }
    
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }
`;
document.head.appendChild(notificationStyles);
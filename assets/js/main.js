// Main JavaScript for West Traders Website

// Category Icons Mapping
const categoryIcons = {
    'Seating': '🪑',
    'Storage & Utility': '🧺',
    'Cleaning Essentials': '🧼',
    'Bath Essentials': '🛁',
    'Kitchen Storage': '🍱',
    'Appliance Accessories': '⚙️'
};

// Category Gradients
const categoryGradients = {
    'Seating': 'linear-gradient(135deg, #E84C47 0%, #FFEBEB 100%)',
    'Storage & Utility': 'linear-gradient(135deg, #E65C57 0%, #FFF5F5 100%)',
    'Cleaning Essentials': 'linear-gradient(135deg, #F07870 0%, #FFF8F8 100%)',
    'Bath Essentials': 'linear-gradient(135deg, #E84C47 0%, #FFEBEB 100%)',
    'Kitchen Storage': 'linear-gradient(135deg, #FFDAB9 0%, #FFF8DC 100%)',
    'Appliance Accessories': 'linear-gradient(135deg, #E66660 0%, #F5F5F5 100%)'
};

// Color Hex Mapping
const colorHex = {
    'Sky Blue': '#E84C47',
    'Pearl White': '#fff7fb',
    'Slate Grey': '#9aa0b5',
    'Aqua': '#E65C57',
    'Frost White': '#fef6ff',
    'Sky Mist': '#F07870',
    'Baby Blue': '#E66660',
    'Cloud White': '#fefaff',
    'Dusty Mauve': '#c7a7bd',
    'Pale Turquoise': '#F28B86',
    'Snow': '#ffffff',
    'Seafoam': '#F5A7A3',
    'Powder Blue': '#ED7D78',
    'Ivory': '#fff2df',
    'Morning Dew': '#deece6',
    'Light Steel Blue': '#F19C98',
    'Moonlight': '#e1d9f5',
    'Charcoal': '#6d6a7c'
};

// Load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('resources/products.json');
        if (!response.ok) throw new Error('Failed to load products');
        return await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

// Create product card HTML
function createProductCard(product) {
    const icon = categoryIcons[product.category] || '🛒';
    const gradient = categoryGradients[product.category] || 'linear-gradient(135deg, #E84C47 0%, #FFEBEB 100%)';
    const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    const colors = product.colors.slice(0, 3).map(color => {
        const hex = colorHex[color] || '#E84C47';
        return `<span class="color-dot" style="background: ${hex};" title="${color}"></span>`;
    }).join('');

    const imageDisplay = product.image 
        ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: contain;">`
        : `<div class="product-icon-display">${icon}</div>`;

    return `
        <div class="product-card">
            <div class="product-image" style="background: ${gradient};">
                ${imageDisplay}
                ${discount > 0 ? `<span class="product-badge">${discount}% OFF</span>` : ''}
            </div>
            <div class="product-body">
                <span class="category-tag">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">₹${product.price.toFixed(2)}</span>
                    ${product.mrp ? `<span class="original-price">₹${product.mrp.toFixed(2)}</span>` : ''}
                </div>
                <div class="product-colors">
                    ${colors}
                </div>
                <div class="product-meta">
                    ${product.capacity ? `Capacity: ${product.capacity}<br>` : ''}
                    ${product.dimensions ? `Dimensions: ${product.dimensions.substring(0, 30)}...` : ''}
                </div>
                <div class="product-actions">
                    <a href="product-detail.html?id=${product.id}" class="btn btn-outline">View Details</a>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}

// Load featured products on homepage
async function loadFeaturedProducts() {
    const carousel = document.getElementById('featured-carousel');
    if (!carousel) return;

    const products = await loadProducts();
    const featured = products.slice(0, 6); // Get first 6 products

    if (featured.length > 0) {
        carousel.innerHTML = featured.map(product => createProductCard(product)).join('');
    } else {
        carousel.innerHTML = '<p class="text-center">No products available at the moment.</p>';
    }
}

// Add to cart functionality (placeholder)
function addToCart(productId) {
    alert(`Product ${productId} added to cart!`);
    // Update cart badge
    const badge = document.querySelector('.cart-btn .badge');
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
    }
}

// Back to top button
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
        });
    }
}

// Newsletter form
function initNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        alert(`Thank you for subscribing with ${email}!`);
        form.reset();
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Color filter functionality
function initColorFilters() {
    const colorFilters = document.querySelectorAll('.color-filter');

    colorFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all
            colorFilters.forEach(f => f.classList.remove('active'));
            // Add active to clicked
            filter.classList.add('active');

            const selectedColor = filter.dataset.color;
            console.log('Selected color:', selectedColor);
            // Could filter products here if we want dynamic filtering on homepage
        });
    });
}

// Animation on scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe category cards
    document.querySelectorAll('.category-card, .feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Search functionality
function initSearch() {
    const searchBtn = document.querySelector('.search-btn');
    if (!searchBtn) return;

    searchBtn.addEventListener('click', () => {
        const searchTerm = prompt('Search for products:');
        if (searchTerm) {
            window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
        }
    });
}

// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    initBackToTop();
    initMobileMenu();
    initNewsletter();
    initSmoothScroll();
    initColorFilters();
    initScrollAnimations();
    initSearch();
});

// Export for use in other files
window.categoryIcons = categoryIcons;
window.categoryGradients = categoryGradients;
window.colorHex = colorHex;
window.createProductCard = createProductCard;
window.addToCart = addToCart;

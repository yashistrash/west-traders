// Product Detail Page JavaScript

let currentProduct = null;
let allProducts = [];

// Initialize product detail page
async function init() {
    try {
        const response = await fetch('resources/products.json');
        if (!response.ok) throw new Error('Failed to load products');
        allProducts = await response.json();

        const productId = getProductIdFromURL();
        if (productId === null) {
            showError('No product specified');
            return;
        }

        currentProduct = allProducts.find(p => p.id === productId);
        if (!currentProduct) {
            showError('Product not found');
            return;
        }

        renderProductDetail();
        renderRelatedProducts();
        initTabs();
        initThumbnails();
        initBackToTop();
    } catch (error) {
        console.error('Error initializing product detail:', error);
        showError('Failed to load product');
    }
}

// Get product ID from URL
function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    return id !== null ? parseInt(id) : null;
}

// Render product details
function renderProductDetail() {
    if (!currentProduct) return;

    const icon = window.categoryIcons[currentProduct.category] || '🛒';
    const gradient = window.categoryGradients[currentProduct.category] || 'linear-gradient(135deg, #FFB6C1 0%, #FFF0F5 100%)';
    const discount = currentProduct.mrp ? Math.round(((currentProduct.mrp - currentProduct.price) / currentProduct.mrp) * 100) : 0;
    const savings = currentProduct.mrp ? (currentProduct.mrp - currentProduct.price).toFixed(2) : 0;

    // Update product images
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        const placeholder = mainImage.querySelector('.image-placeholder');
        if (placeholder) {
            placeholder.style.background = gradient;
        }
    }

    document.querySelectorAll('.product-icon, .thumb-icon').forEach(el => {
        el.textContent = icon;
        el.parentElement.style.background = gradient;
    });

    // Update breadcrumb
    document.getElementById('productCategory').textContent = currentProduct.category;
    document.getElementById('productNameBreadcrumb').textContent = currentProduct.name;

    // Update main info
    document.getElementById('categoryBadge').textContent = currentProduct.category;
    document.getElementById('productName').textContent = currentProduct.name;
    document.getElementById('currentPrice').textContent = `₹${currentProduct.price.toFixed(2)}`;

    if (currentProduct.mrp) {
        document.getElementById('originalPrice').textContent = `₹${currentProduct.mrp.toFixed(2)}`;
        document.getElementById('discountBadge').textContent = `${discount}% OFF`;
        document.getElementById('savingsText').textContent = `You save ₹${savings}`;
    }

    document.getElementById('productDescription').textContent = currentProduct.description;

    // Update specifications
    document.getElementById('specCapacity').textContent = currentProduct.capacity || 'N/A';
    document.getElementById('specDimensions').textContent = currentProduct.dimensions || 'N/A';
    document.getElementById('specCategory').textContent = currentProduct.category;
    document.getElementById('specSKU').textContent = `BT-${currentProduct.id.toString().padStart(4, '0')}`;

    // Render color options
    renderColors();

    // Update tabs content
    document.getElementById('fullDescription').textContent = currentProduct.description;
    document.getElementById('fullDimensions').textContent = currentProduct.dimensions || 'N/A';
    document.getElementById('fullCapacity').textContent = currentProduct.capacity || 'N/A';
    document.getElementById('fullColors').textContent = currentProduct.colors.join(', ');
}

// Render color options
function renderColors() {
    const colorOptions = document.getElementById('colorOptions');
    if (!colorOptions || !currentProduct) return;

    const colorsHTML = currentProduct.colors.map(color => {
        const hex = window.colorHex[color] || '#FFB6C1';
        return `
            <div class="color-option" data-color="${color}">
                <div class="color-circle" style="background: ${hex};"></div>
                <span class="color-name">${color}</span>
            </div>
        `;
    }).join('');

    colorOptions.innerHTML = colorsHTML;

    // Add click handlers
    colorOptions.querySelectorAll('.color-option').forEach((option, index) => {
        option.addEventListener('click', () => {
            colorOptions.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });

        // Auto-select first color
        if (index === 0) option.classList.add('selected');
    });
}

// Render related products
function renderRelatedProducts() {
    const relatedContainer = document.getElementById('relatedProducts');
    if (!relatedContainer || !currentProduct) return;

    // Get products from same category, excluding current product
    let related = allProducts.filter(p =>
        p.category === currentProduct.category && p.id !== currentProduct.id
    ).slice(0, 4);

    // If not enough from same category, add random products
    if (related.length < 4) {
        const remaining = allProducts
            .filter(p => p.id !== currentProduct.id && !related.includes(p))
            .slice(0, 4 - related.length);
        related = [...related, ...remaining];
    }

    relatedContainer.innerHTML = related.map(product => window.createProductCard(product)).join('');
}

// Initialize tabs
function initTabs() {
    const tabHeaders = document.querySelectorAll('.tab-header');
    const tabContents = document.querySelectorAll('.tab-content');

    tabHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const tabName = header.dataset.tab;

            // Remove active from all
            tabHeaders.forEach(h => h.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            header.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// Initialize thumbnail images
function initThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail');

    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');

            // Could change main image here if we had multiple images
            // For now, just add a subtle animation
            const mainImage = document.getElementById('mainImage');
            if (mainImage) {
                mainImage.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    mainImage.style.transform = 'scale(1)';
                }, 200);
            }
        });
    });
}

// Show error message
function showError(message) {
    const container = document.querySelector('.product-detail .container');
    if (container) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 4rem 2rem; text-align: center;">
                <div class="empty-icon">😔</div>
                <h3>${message}</h3>
                <p>The product you're looking for might have been removed or is temporarily unavailable.</p>
                <a href="products.html" class="btn btn-primary">Browse All Products</a>
            </div>
        `;
    }
}

// Back to top functionality
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

// Add to cart button handler
document.addEventListener('DOMContentLoaded', () => {
    init();

    // Add event listener for add to cart buttons
    document.querySelectorAll('.product-actions .btn-primary').forEach(btn => {
        if (btn.textContent.includes('Add to Cart')) {
            btn.addEventListener('click', () => {
                if (currentProduct) {
                    window.addToCart(currentProduct.id);
                }
            });
        }
    });

    // Buy now button
    document.querySelectorAll('.product-actions .btn-outline').forEach(btn => {
        if (btn.textContent.includes('Buy Now')) {
            btn.addEventListener('click', () => {
                alert('Buy Now functionality will be implemented with payment gateway.');
            });
        }
    });

    // Wishlist button
    const wishlistBtn = document.querySelector('.wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            wishlistBtn.textContent = wishlistBtn.textContent === '❤️' ? '💖' : '❤️';
            alert('Added to wishlist!');
        });
    }
});

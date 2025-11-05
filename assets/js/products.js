// Products Page JavaScript
// Uses shared data from main.js

let allProducts = [];
let filteredProducts = [];

// Load and initialize products
async function init() {
    try {
        const response = await fetch('resources/products.json');
        if (!response.ok) throw new Error('Failed to load products');
        allProducts = await response.json();
        filteredProducts = [...allProducts];

        setupFilters();
        applyURLParameters();
        renderProducts();
        initBackToTop();
    } catch (error) {
        console.error('Error initializing products:', error);
        showError();
    }
}

// Setup filter UI
function setupFilters() {
    // Setup category filters
    const categories = [...new Set(allProducts.map(p => p.category))];
    const categoryFilters = document.getElementById('categoryFilters');

    if (categoryFilters) {
        const categoriesHTML = categories.map(category => `
            <label>
                <input type="checkbox" value="${category}" class="category-checkbox">
                ${category}
            </label>
        `).join('');
        categoryFilters.innerHTML += categoriesHTML;

        // Add event listeners
        categoryFilters.querySelectorAll('input').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });
    }

    // Setup color filters
    const colors = [...new Set(allProducts.flatMap(p => p.colors))];
    const colorFilters = document.getElementById('colorFilters');

    if (colorFilters) {
        colors.forEach(color => {
            const hex = window.colorHex[color] || '#FFB6C1';
            const swatch = document.createElement('button');
            swatch.className = 'color-swatch';
            swatch.dataset.color = color;
            swatch.style.background = hex;
            swatch.title = color;
            swatch.addEventListener('click', () => {
                colorFilters.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                applyFilters();
            });
            colorFilters.appendChild(swatch);
        });
    }

    // Setup price range
    const priceRange = document.getElementById('priceRange');
    const maxPriceLabel = document.getElementById('maxPrice');

    if (priceRange && maxPriceLabel) {
        priceRange.addEventListener('input', (e) => {
            maxPriceLabel.textContent = `₹${e.target.value}`;
            applyFilters();
        });
    }

    // Setup sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }

    // Setup search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }

    // Clear filters
    document.querySelectorAll('.clear-filters').forEach(btn => {
        btn.addEventListener('click', clearFilters);
    });

    // Mobile filter toggle
    const mobileFilterBtn = document.querySelector('.mobile-filter-btn');
    const sidebar = document.querySelector('.sidebar');

    if (mobileFilterBtn && sidebar) {
        mobileFilterBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }
}

// Apply URL parameters (for category links from homepage)
function applyURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');

    if (categoryParam) {
        const checkbox = document.querySelector(`input[value="${categoryParam}"]`);
        if (checkbox) {
            document.querySelector('input[value="all"]').checked = false;
            checkbox.checked = true;
        }
    }

    if (searchParam) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = searchParam;
    }
}

// Apply all filters
function applyFilters() {
    filteredProducts = [...allProducts];

    // Category filter
    const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
        .map(cb => cb.value);

    const allChecked = document.querySelector('input[value="all"]').checked;

    if (!allChecked && selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(p => selectedCategories.includes(p.category));
    }

    // Price filter
    const maxPrice = parseInt(document.getElementById('priceRange').value);
    filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);

    // Color filter
    const activeColor = document.querySelector('.color-swatch.active');
    if (activeColor && activeColor.dataset.color !== 'all') {
        const selectedColor = activeColor.dataset.color;
        filteredProducts = filteredProducts.filter(p => p.colors.includes(selectedColor));
    }

    // Search filter
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm)
        );
    }

    // Sort
    const sortBy = document.getElementById('sortSelect').value;
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-az':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-za':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Featured - keep original order
            break;
    }

    renderProducts();
}

// Render products to grid
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const resultsCount = document.getElementById('resultsCount');
    const emptyState = document.getElementById('emptyState');

    if (!grid) return;

    // Update results count
    if (resultsCount) {
        resultsCount.textContent = `Showing ${filteredProducts.length} of ${allProducts.length} products`;
    }

    // Show/hide empty state
    if (filteredProducts.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Render products
    grid.innerHTML = filteredProducts.map(product => window.createProductCard(product)).join('');

    // Scroll to top of products
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Clear all filters
function clearFilters() {
    // Reset checkboxes
    document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
    document.querySelector('input[value="all"]').checked = true;

    // Reset price range
    const priceRange = document.getElementById('priceRange');
    priceRange.value = priceRange.max;
    document.getElementById('maxPrice').textContent = `₹${priceRange.max}`;

    // Reset color filter
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    document.querySelector('.color-swatch[data-color="all"]').classList.add('active');

    // Reset search
    document.getElementById('searchInput').value = '';

    // Reset sort
    document.getElementById('sortSelect').value = 'featured';

    // Apply filters
    applyFilters();
}

// Show error message
function showError() {
    const grid = document.getElementById('productsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">😔</div>
                <h3>Unable to load products</h3>
                <p>Please check your internet connection and try again</p>
                <button class="btn btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// Debounce function for search
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

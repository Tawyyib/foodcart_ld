// ============================================
// GLOBAL APPLICATION CONTROLLER
// ============================================

/**
 * 1. GLOBAL PRODUCT CATALOG DATA STRUCTURE
 */
window.productCatalog = {
    'RICE-5KG':          { name: 'Nutragold Rice (5kg)', retailPrice: 7000, wholesalePrice: 6800 },
    'RICE-10KG':         { name: 'Nutragold Rice (10kg)', retailPrice: 13000, wholesalePrice: 12000 },
    'RICE-25KG':         { name: 'Nutragold Rice (25kg)', retailPrice: 29000, wholesalePrice: 26000 },
    'RICE-50KG':         { name: 'Nutragold Rice (50kg)', retailPrice: 59000, wholesalePrice: 52000 },
    'HONEY-BEANS5KG-':   { name: 'Honey Beans (5kg)', retailPrice: 11000, wholesalePrice: 10000 },
    'HONEY-BEANS-10KG':  { name: 'Honey Beans (10kg)', retailPrice: 21000, wholesalePrice: 19000 },
    'HONEY-BEANS-25KG':  { name: 'Honey Beans (25kg)', retailPrice: 49000, wholesalePrice: 45000 },
    'HONEY-BEANS-JUMBO':  { name: 'Honey Beans (Jumbo)', retailPrice: null, wholesalePrice: 45000 },
    'BROWN-BEANS5KG-':   { name: 'Brown Beans (5kg)', retailPrice: 11000, wholesalePrice: 10000 },
    'BROWN-BEANS-10KG':  { name: 'Brown Beans (10kg)', retailPrice: 21000, wholesalePrice: 19000 },
    'BROWN-BEANS-25KG':  { name: 'Brown Beans (25kg)', retailPrice: 49000, wholesalePrice: 45000 },
    'BROWN-BEANS-JUMBO':  { name: 'Brown Beans (Jumbo)', retailPrice: null, wholesalePrice: 45000 },
    'PREMIUM-GARRI-5KG': { name: 'Premium Garri (5kg)', retailPrice: 7000, wholesalePrice: 6500 },
    'PREMIUM-GARRI-10KG': { name: 'Premium Garri (10kg)', retailPrice: 7000, wholesalePrice: 6500 },
    'PREMIUM-GARRI-25KG': { name: 'Premium Garri (25kg)', retailPrice: 7000, wholesalePrice: 6500 },
    'PREMIUM-GARRI-JUMBO': { name: 'Premium Garri (Jumbo)', retailPrice: null, wholesalePrice: 6500 },
    'STANDARD-GARRI-5KG': { name: 'Standard Garri (5kg)', retailPrice: 7000, wholesalePrice: 6500 },
    'STANDARD-GARRI-10KG': { name: 'Standard Garri (10kg)', retailPrice: 7000, wholesalePrice: 6500 },
    'STANDARD-GARRI-25KG': { name: 'Standard Garri (25kg)', retailPrice: 7000, wholesalePrice: 6500 },
    'STANDARD-GARRI-JUMBO': { name: 'Standard Garri (Jumbo)', retailPrice: null, wholesalePrice: 6500 }
};

window.getProductBySku = function(sku) {
    return window.productCatalog[sku] || null;
};

// ============================================
// 1.A. STOCK MANAGEMENT & VARIATION SYNC CONTROLLER
// ============================================
(function() {

    // Helper: Returns stock status metadata
    window.getStockStatus = function(sku) {
        const product = window.getProductBySku ? window.getProductBySku(sku) : (window.productCatalog[sku] || null);
        if (!product) return { status: 'unknown', stock: 999, label: `✅ In Stock` };

        const stock = parseInt(product.stock, 10);
        if (isNaN(stock) || stock <= 0) {
            return { status: 'out-of-stock', stock: 0, label: 'Out of Stock' };
        } else if (stock <= 5) {
            return { status: 'low-stock', stock: stock, label: `Only ${stock} left in stock!` };
        } else {
            return { status: 'in-stock', stock: stock, label: `✅ In Stock` };
        }
    };

    // UI Synchronizer for a specific product card or detail section
    window.updateProductStockUI = function(container) {

        if (!container) return;

        const baseSkuEl = container.querySelector('.sku');
        const selectEl = container.querySelector('select#wholesale, select#retail, select');
        const btn = container.querySelector('.qty-add .btn, .call-to-act .btn');
        const qtyInput = container.querySelector('input.qty-count, input[type="number"]');
        const stockBadge = container.querySelector('.stock-badge, .badge-stock');

        const baseSku = baseSkuEl ? baseSkuEl.textContent.replace(/^SKU:\s*/i, '').trim() : '';
        const variationVal = selectEl ? selectEl.value : '';
        const currentSku = variationVal ? `${baseSku}-${variationVal}` : baseSku;

        const stockInfo = window.getStockStatus(currentSku);

        // A. Update Stock Badge
        if (stockBadge) {
            stockBadge.textContent = stockInfo.label;
            stockBadge.className = `stock-badge badge-${stockInfo.status}`;
        }

        // B. Update Quantity Input Maximum
        if (qtyInput) {
            if (stockInfo.stock > 0) {
                qtyInput.removeAttribute('disabled');
                qtyInput.max = stockInfo.stock;
                if (parseInt(qtyInput.value, 10) > stockInfo.stock) {
                    qtyInput.value = stockInfo.stock;
                }
            } else {
                qtyInput.value = 0;
                qtyInput.setAttribute('disabled', 'disabled');
            }
        }

        // C. Enable / Disable Add-to-Cart Button
        if (btn) {
            if (stockInfo.status === 'out-of-stock') {
                btn.disabled = true;
                btn.classList.add('btn-out-of-stock');
                btn.innerHTML = '❌ Out of Stock';
            } else {
                btn.disabled = false;
                btn.classList.remove('btn-out-of-stock');
                btn.innerHTML = '🛒 Add to Cart';
            }
        }
    };

    // Global Listener for Variation Dropdown Changes
    document.addEventListener('change', function(e) {
        if (e.target && e.target.matches('select')) {
            const container = e.target.closest('.pdp-summary, .product-card');
            if (container) {
                window.updateProductStockUI(container);
            }
        }
    });

    // Initialize all cards on page load
    function initStockUI() {
        document.querySelectorAll('.pdp-summary, .product-card').forEach(container => {
            window.updateProductStockUI(container);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStockUI);
    } else {
        initStockUI();
    }
})();

// ============================================
// 1.B. COLLAPSIBLE NOTICE BAR (EVENT DELEGATION)
// ============================================
(function() {
    // 1. Instantly hide on boot if previously dismissed (prevents flicker)
    if (sessionStorage.getItem('foodcart_notice_dismissed') === 'true') {
        const style = document.createElement('style');
        style.textContent = '#siteNoticeBar { display: none !important; }';
        document.head.appendChild(style);
    }

    // 2. Global Event Delegation to catch the click anywhere, anytime
    document.addEventListener('click', function(e) {
        // Check if clicked element IS the close button OR inside it
        const closeBtn = e.target.closest('#closeNoticeBtn');
        
        if (closeBtn) {
            e.preventDefault();
            const noticeBar = document.getElementById('siteNoticeBar') || closeBtn.closest('.top-bar');

            if (noticeBar) {
                // Add smooth collapsing CSS transition
                noticeBar.classList.add('collapsed');

                // Save to session memory
                sessionStorage.setItem('foodcart_notice_dismissed', 'true');

                // Completely remove from layout after CSS transition finishes
                setTimeout(() => {
                    noticeBar.style.display = 'none';
                }, 300);
            }
        }
    });
})();

// ============================================
// 2. MOBILE MENU TOGGLE
// ============================================
(function() {
    let initialized = false;

    function initMobileMenu() {
        if (initialized) return;
        initialized = true;

        document.addEventListener('click', function(e) {
            const toggleBtn = e.target.closest('#mobileToggle');
            const nav = document.querySelector('.nav-bar');

            if (toggleBtn && nav) {
                nav.classList.toggle('active');
                const isActive = nav.classList.contains('active');
                toggleBtn.textContent = isActive ? '✕' : '☰';
                return;
            }

            if (nav && nav.classList.contains('active') && !e.target.closest('.nav-links')) {
                nav.classList.remove('active');
                const btn = document.getElementById('mobileToggle');
                if (btn) btn.textContent = '☰';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }
})();

// ============================================
// 3. AUTO-HIGHLIGHT ACTIVE NAV LINK
// ============================================
(function() {
    let initialized = false;

    function applyNavHighlight() {
        if (initialized) return;
        initialized = true;

        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        const cleanCurrentPage = currentPage.split('?')[0];

        const links = document.querySelectorAll('.nav-link a');
        if (links.length === 0) {
            initialized = false;
            return false;
        }

        links.forEach(link => {
            let href = link.getAttribute('href');
            if (!href) return;

            href = href.split('?')[0].split('#')[0];
            const hrefFile = href.split('/').pop() || href;

            if (hrefFile === cleanCurrentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        return true;
    }

    function watchForNav() {
        const observer = new MutationObserver(function() {
            const links = document.querySelectorAll('.nav-link a');
            if (links.length > 0) {
                applyNavHighlight();
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(function() {
            applyNavHighlight();
            observer.disconnect();
        }, 3000);
    }

    if (document.readyState !== 'loading') {
        if (!applyNavHighlight()) watchForNav();
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            if (!applyNavHighlight()) watchForNav();
        });
    }
})();

// ============================================
// 4. PROFILE DROPDOWN MODULE
// ============================================
(function() {
    document.addEventListener('click', function(e) {
        const profile = document.getElementById('user-profile');
        if (!profile) return;

        if (profile.contains(e.target)) {
            profile.classList.toggle('active');
        } else {
            profile.classList.remove('active');
        }
    });
})();

// ============================================
// 5. SWITCH HERO TABS
// ============================================
(function() {

    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50; // Minimum pixel swipe distance required to trigger action

    window.switchHeroTab = function (mode) {

        const retailCol = document.querySelector('.hero-col.retail');
        const wholesaleCol = document.querySelector('.hero-col.wholesale');
        const buttons = document.querySelectorAll('.hero-toggle-btn');

        if (window.innerWidth > 767.98) return;
        
        if (!retailCol || !wholesaleCol) return;

        buttons.forEach(btn => btn.classList.remove('active'));

        if (mode === 'retail') {

            buttons[0].classList.add('active');
            retailCol.classList.remove('mobile-hide');
            retailCol.classList.add('mobile-show');

            wholesaleCol.classList.remove('mobile-show');
            wholesaleCol.classList.add('mobile-hide');

        } else {

            buttons[1].classList.add('active');
            wholesaleCol.classList.remove('mobile-hide');
            wholesaleCol.classList.add('mobile-show');

            retailCol.classList.remove('mobile-show');
            retailCol.classList.add('mobile-hide');

        }

    };

    function handleSwipeGesture() {

        const distance = touchEndX - touchStartX;
        
        // Ensure screen is mobile-sized before triggering swipe behavior
        if (window.innerWidth > 768) return;

        // Swipe Left -> Show Wholesalers
        if (distance < -minSwipeDistance) {
            window.switchHeroTab('wholesale');
        }
        // Swipe Right -> Show Shoppers
        else if (distance > minSwipeDistance) {
            window.switchHeroTab('retail');
        }

    }

    function initHeroSwipe() {
        const heroContainer = document.getElementById('hero-guest-view');
        if (!heroContainer) return;

        // Capture initial touch coordinates
        heroContainer.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        // Capture final touch coordinates and evaluate swipe direction
        heroContainer.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipeGesture();
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeroSwipe);
    } else {
        initHeroSwipe();
    }

})();

// ============================================
// 6. SEARCH BAR HIDE DISPLAYS
// ============================================
document.addEventListener('click', (e) => {
  // 1. Check if the click was on the toggle button (or icon inside it)
  const toggleBtn = e.target.closest('#searchToggleBtn');
  const searchWrap = document.getElementById('searchBar');

  if (toggleBtn && searchWrap) {
    e.stopPropagation();
    const isOpen = searchWrap.classList.toggle('is-active');
    
    if (isOpen) {
      const searchInput = document.getElementById('searchInput');
      if (searchInput) setTimeout(() => searchInput.focus(), 100);
    }
    return;
  }

  // 2. Prevent closing when clicking inside the active search bar
  if (e.target.closest('#searchBar')) {
    return;
  }

  // 3. Close search bar when clicking anywhere else outside
  if (searchWrap && searchWrap.classList.contains('is-active')) {
    searchWrap.classList.remove('is-active');
  }

});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const searchWrap = document.getElementById('searchBar');
    const searchInput = document.getElementById('searchInput');
    if (searchWrap) searchWrap.classList.remove('is-active');
    if (searchInput) searchInput.blur();
  }
});

// Form submission handler
document.addEventListener('submit', (e) => {
  if (e.target.matches('#searchForm')) {
    const searchWrap = document.getElementById('searchBar');
    if (searchWrap) searchWrap.classList.remove('is-active');
  }
});

//Filter 
document.addEventListener('change', (e) => {
    
  // --- A. CATEGORY FILTER LOGIC ---
  if (e.target && e.target.id === 'categoryFilter') {
    const selectedSelect = e.target;
    const selectedOption = selectedSelect.options[selectedSelect.selectedIndex];
    
    // Read the category value from data-category or value attribute
    const selectedCat = selectedOption.getAttribute('data-category') || selectedSelect.value;
    const productCards = document.querySelectorAll('.product-card, [data-category]');
    
    let visibleCount = 0;
    const totalCount = productCards.length;

    productCards.forEach((card) => {
      // Ignore option tags that also carry data-category
      if (card.tagName.toLowerCase() === 'option') return;

      const cardCat = card.getAttribute('data-category');
      
      if (selectedCat === 'all' || cardCat === selectedCat) {
        card.style.display = ''; // Restores default display layout (grid/flex/block)
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update results counter string dynamically
    const sortCountLabel = document.getElementById('sortCount');
    if (sortCountLabel) {
      sortCountLabel.textContent = `Showing ${visibleCount} of ${totalCount} results`;
    }
  }

  // --- B. SORTING LOGIC ---
  if (e.target && e.target.id === 'sortSelect') {
    const sortValue = e.target.value;
    const gridContainer = document.querySelector('.products-grid'); // Change selector to match your grid container
    
    if (!gridContainer) return;

    const cards = Array.from(gridContainer.querySelectorAll('.product-card'));

    cards.sort((a, b) => {
      const priceA = parseFloat(a.getAttribute('data-price') || 0);
      const priceB = parseFloat(b.getAttribute('data-price') || 0);

      if (sortValue === 'price-low') return priceA - priceB;
      if (sortValue === 'price-high') return priceB - priceA;
      return 0; // Default popularity / structural order
    });

    // Re-append sorted cards into grid
    cards.forEach((card) => gridContainer.appendChild(card));
  }
});

// PDP Price Switcher
document.addEventListener('DOMContentLoaded', () => {

  // Variant Data Map
  const productVariants = {
    '5kg': {
      price: '₦6,000.00',
      stock: '250 in stock',
      sku: 'SKU: GARR-001-5KG',
      inStock: true
    },
    '10kg': {
      price: '₦12,000.00',
      stock: '120 in stock',
      sku: 'SKU: GARR-001-10KG',
      inStock: true
    },
    '25kg': {
      price: '₦30,000.00',
      stock: '45 in stock',
      sku: 'SKU: GARR-001-25KG',
      inStock: true
    }
  };

  const sizeSelect = document.getElementById('size-select');
  const priceDisplay = document.querySelector('.active-price');
  const stockDisplay = document.querySelector('.stock-count');
  const skuDisplay = document.querySelector('.sku-code');

  if (sizeSelect && priceDisplay) {
    sizeSelect.addEventListener('change', (e) => {
      const selectedSize = e.target.value;
      const variant = productVariants[selectedSize];

      if (variant) {
        // Smooth fade effect on price change
        priceDisplay.style.opacity = '0';
        
        setTimeout(() => {
          priceDisplay.textContent = variant.price;
          stockDisplay.textContent = variant.stock;
          skuDisplay.textContent = variant.sku;
          priceDisplay.style.opacity = '1';
        }, 150);
      }
    });
  }
});

// ============================================
// 7. PDP TAB SWITCH
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active status from all tabs & panels
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      // Activate current selection
      btn.classList.add('active');
      const targetPanel = document.getElementById(btn.getAttribute('data-tab'));
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
});

// ============================================
// 8. AUTH OVERLAY & FORM SUBMISSION MODULE
// ============================================
(function() {

    let activeRegisterType = 'retail';

    function getOverlayElements() {

        return {
            backdrop: document.getElementById('authBackdrop') || document.querySelector('.auth-backdrop'),
            closeBtn: document.getElementById('authCloseBtn') || document.querySelector('.auth-close-btn'),
            content: document.getElementById('authContent') || document.querySelector('.auth-content')
        };

    }

    window.openAuthOverlay = function() {
        const { backdrop } = getOverlayElements();
        if (backdrop) {
            backdrop.classList.add('show');
            document.body.classList.add('no-scroll');
        }
    };

    window.closeAuthOverlay = function() {
        const { backdrop } = getOverlayElements();
        if (backdrop) {
            backdrop.classList.remove('show');
            document.body.classList.remove('no-scroll');
        }
    };

    // --------------------------------------------
    // 8.1. REGISTRATION TAB TOGGLE ENGINE
    // --------------------------------------------
    window.switchRegisterType = function(type) {

        activeRegisterType = type;
        const tabCustomerBtn = document.getElementById('tabCustomerBtn');
        const tabBusinessBtn = document.getElementById('tabBusinessBtn');
        const b2bFieldsGroup = document.getElementById('b2bFieldsGroup');
        const nameLabel = document.getElementById('nameLabel');
        const regName = document.getElementById('regName');
        const regSubmitBtn = document.getElementById('regSubmitBtn');
        const regTin = document.getElementById('regTin');

        const isWholesale = (type === 'wholesale');

        // 1. Toggle Tab Button Classes
        if (tabBusinessBtn) {
            tabBusinessBtn.classList.toggle('active', isWholesale);
            tabBusinessBtn.classList.toggle('inactive', !isWholesale);
        }

        if (tabCustomerBtn) {
            tabCustomerBtn.classList.toggle('active', !isWholesale);
            tabCustomerBtn.classList.toggle('inactive', isWholesale);
        }

        // 2. Toggle B2B Field Visibility using .show / .hide
        if (b2bFieldsGroup) {
            b2bFieldsGroup.classList.toggle('show', isWholesale);
            b2bFieldsGroup.classList.toggle('hide', !isWholesale);
        }

        // 3. Dynamic Labels & Placeholders
        if (nameLabel) {
            nameLabel.innerHTML = isWholesale 
                ? 'Business / Store Name <span class="required">*</span>' 
                : 'Full Name <span class="required">*</span>';
        }

        if (regName) {
            regName.placeholder = isWholesale 
                ? 'e.g. Al-Furqaan Groceries' 
                : 'e.g. Adeola Johnson';
        }

        if (regSubmitBtn) {
            regSubmitBtn.innerHTML = isWholesale 
                ? 'Create Business Account' 
                : '✅ Create Personal Account';
        }

        // 4. Toggle Required Attribute on Hidden Inputs (Prevents HTML5 focus validation errors)
        if (regTin) {
            if (isWholesale) {
                regTin.setAttribute('required', 'required');
            } else {
                regTin.removeAttribute('required');
            }
        }
    };

    // --------------------------------------------
    // 8.2. ORDER STATUS MODALS
    // --------------------------------------------
    window.showOrderSuccess = function(orderData) {
        orderData = orderData || {};
        const els = {
            number: document.getElementById('orderNumber'),
            total: document.getElementById('orderTotal'),
            delivery: document.getElementById('orderDelivery'),
            eta: document.getElementById('orderETA'),
            name: document.getElementById('orderCustomerName')
        };

        if (els.number) els.number.textContent = orderData.orderNumber || '#ORD-2026-001';
        if (els.total) els.total.textContent = orderData.total || '₦0';
        if (els.delivery) els.delivery.textContent = orderData.delivery || 'Express Delivery';
        if (els.eta) els.eta.textContent = orderData.eta || 'Today, 5:00 PM';
        if (els.name) els.name.textContent = orderData.customerName || 'Customer';

        window.showAuthView('orderSuccess');
    };

    window.showOrderError = function(errorMessage) {
        const msgEl = document.getElementById('orderErrorMessage');
        if (msgEl) msgEl.textContent = errorMessage || 'Payment verification failed. Please try again.';
        window.showAuthView('orderError');
    };

    // --------------------------------------------
    // 8.3. GLOBAL CLICK EVENT LISTENERS
    // --------------------------------------------
    document.addEventListener('click', function(e) {
        const closeBtn = e.target.closest('#authCloseBtn, .auth-close-btn');
        if (closeBtn) {
            window.closeAuthOverlay();
            return;
        }

        const backdrop = e.target;
        if (backdrop && backdrop.id === 'authBackdrop') {
            window.closeAuthOverlay();
            return;
        }

        const link = e.target.closest('a[href*="login"], a[href*="register"], .login-btn, .register-btn, .switch-view, [data-auth="login"], [data-auth="register"]');
        if (link) {
            e.preventDefault();
            let view = link.dataset.view || link.dataset.auth;

            if (!view) {
                const href = link.getAttribute('href') || '';
                view = href.includes('login') ? 'login' : href.includes('register') ? 'register' : null;
            }

            if (view) window.showAuthView(view);
        }
    });

    // --------------------------------------------
    // 8.4. FORM SUBMISSION EVENT LISTENERS
    // --------------------------------------------
    document.addEventListener('submit', function(e) {

        // ============================================
        // 1. LOGIN FORM SUBMISSION
        // ============================================
        if (e.target && (e.target.id === 'auth-login-form' || e.target.closest('#auth-login-form'))) {
            e.preventDefault();
            const form = e.target.id === 'auth-login-form' ? e.target : e.target.closest('#auth-login-form');
            
            const identityInput = document.getElementById('loginIdentity') || form.querySelector('input[type="text"], input[type="email"]');
            const identityVal = identityInput ? identityInput.value.trim() : '';
            
            const selectedTypeRadio = form.querySelector('input[name="loginType"]:checked');
            const accountType = selectedTypeRadio ? selectedTypeRadio.value : 'retail'; 

            let name = identityVal.split('@')[0] || 'Customer';
            name = name.charAt(0).toUpperCase() + name.slice(1);

            window.showAuthView('success', 'login', name, accountType);
        } 

        // ============================================
        // 2. REGISTER FORM SUBMISSION
        // ============================================
        else if (e.target && (e.target.id === 'auth-register-form' || e.target.closest('#auth-register-form'))) {
            e.preventDefault();
            const form = e.target.id === 'auth-register-form' ? e.target : e.target.closest('#auth-register-form');
            
            const nameInput = document.getElementById('regName') || form.querySelector('input[placeholder*="Name"]');
            const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Customer';
            
            const accountType = (typeof activeRegisterType !== 'undefined' && activeRegisterType) ? activeRegisterType : 'retail';

            window.showAuthView('success', 'register', name, accountType);
        }

    });

})();

// ============================================
// 9. SUCCESS & ORDER ACTION HANDLERS
// ============================================
(function() {

    window.handleSuccessStartShopping = function() {
        if (typeof window.closeAuthOverlay === 'function') window.closeAuthOverlay();
        window.location.href = 'shop.html';
    };

    window.handleSuccessDashboard = function() {
        if (typeof window.closeAuthOverlay === 'function') window.closeAuthOverlay();
        alert('📊 Dashboard page coming soon!');
        window.location.href = 'index.html';
    };

    window.handleSuccessRedirect = function() {
        if (typeof window.closeAuthOverlay === 'function') window.closeAuthOverlay();
    };

    window.handleSuccessLogout = function() {
        if (typeof window.closeAuthOverlay === 'function') window.closeAuthOverlay();
        if (typeof window.handleLogout === 'function') {
            window.handleLogout();
        }
        window.location.href = 'index.html';
    };

    window.handleOrderContinueShopping = function() {
        if (typeof window.closeAuthOverlay === 'function') window.closeAuthOverlay();
        window.location.href = 'shop.html';
    };

    window.handleOrderViewHistory = function() {
        if (typeof window.closeAuthOverlay === 'function') window.closeAuthOverlay();
        alert('📊 Orders page coming soon!');
        window.location.href = 'index.html';
    };

    window.handleOrderDownloadInvoice = function() {
        alert('📄 Invoice download coming soon!');
    };

    window.handleOrderRetry = function() {
        if (typeof window.closeAuthOverlay === 'function') window.closeAuthOverlay();
        window.location.href = 'checkout.html';
    };

    window.handleOrderContactSupport = function() {
        alert('📞 Support: support@foodcart.com | +234 800 123 4567');
    };

    window.handleOrderReturnToCart = function() {
        if (typeof window.closeAuthOverlay === 'function') window.closeAuthOverlay();
        window.location.href = 'cart.html';
    };

})();

// ============================================
// 10. UNIFIED AUTHENTICATION & UI CONTROLLER
// ============================================
(function() {

    // --------------------------------------------
    // 10.1. STATE READERS & GETTERS
    // --------------------------------------------
    window.getAuthState = function() {

        return {

            isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
            userName: localStorage.getItem('userName') || 'Guest',
            accountType: localStorage.getItem('accountType') || 'retail'

        };

    };

    window.isWholesaleActive = function() {

        const state = window.getAuthState();
        return state.isLoggedIn && state.accountType === 'wholesale';

    };

    // --------------------------------------------
    // 10.2. HERO VIEW CONTROLLER (.show / .hide)
    // --------------------------------------------
    window.setHeroView = function(mode) {

        const views = document.querySelectorAll('.hero-view');
        views.forEach(view => {

            view.classList.remove('show');
            view.classList.add('hide');

        });

        const targetView = document.getElementById(`hero-${mode}-view`);
        if (targetView) {

            targetView.classList.remove('hide');
            targetView.classList.add('show');

        }

    };

    // --------------------------------------------
    //10.3. HEADER NAV & UI SYNCHRONIZER (WITH DOM RETRY)
    // --------------------------------------------
    window.updateAuthUI = function(isLoggedIn, userName, accountType) {

        const loggedIn = String(isLoggedIn) === 'true';
        const isWholesale = (accountType === 'wholesale');
        const name = userName && userName !== 'null' && userName !== 'undefined' ? userName : 'Customer';

        // Persist immediately to localStorage
        if (loggedIn) {

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', name);
            localStorage.setItem('accountType', isWholesale ? 'wholesale' : 'retail');

            if (isWholesale) {
                localStorage.setItem('wholesaleMode', 'true');
                localStorage.setItem('businessName', name);
            }

        }

        // Function to physically apply CSS classes & text to DOM
        function applyToDOM() {

            const userProfileEl = document.getElementById('user-profile');
            const logoutDisplayEl = document.getElementById('logoutDisplay');
            const nameDisplays = document.querySelectorAll('.header-user-display');
            const pillText = document.getElementById('pillPricingText');
            const pricingPill = document.getElementById('pricing-status-pill');
            const userBadgeWrapper = document.getElementById('userBadgeWrapper');

            // Check if essential header elements exist yet
            if (!userProfileEl && !logoutDisplayEl && nameDisplays.length === 0) {
                return false; // Elements not in DOM yet!
            }

            if (loggedIn) {

                // Hide Login/Register dropdown link, show Logout wrapper
                if (userProfileEl) {
                    userProfileEl.classList.remove('show', 'active');
                    userProfileEl.classList.add('hide');
                    //userProfileEl.style.display = 'none'; // Hard style override
                }
                if (logoutDisplayEl) {
                    logoutDisplayEl.classList.remove('hide');
                    logoutDisplayEl.classList.add('show');
                    //logoutDisplayEl.style.display = 'flex'; // Hard style override
                }

                // Update Name Badges
                nameDisplays.forEach(el => {
                    el.textContent = name;
                });

                // Update Wholesale / Retail Status Badges
                if (isWholesale) {

                    if (pillText) pillText.textContent = 'Wholesale';

                    if (pricingPill) {
                        pricingPill.classList.remove('retail');
                        pricingPill.classList.add('wholesale');
                    }

                    if (userBadgeWrapper) {
                        userBadgeWrapper.classList.remove('retail');
                        userBadgeWrapper.classList.add('wholesale');
                    }

                } else {

                    if (pillText) pillText.textContent = 'Retail';

                    if (pricingPill) {
                        pricingPill.classList.remove('wholesale');
                        pricingPill.classList.add('retail');
                    }

                    if (userBadgeWrapper) {
                        userBadgeWrapper.classList.remove('retail');
                        userBadgeWrapper.classList.add('retail');
                    }

                }

                document.body.classList.toggle('wholesale-mode-active', isWholesale);

                // E. Update Product Price Badges
                document.querySelectorAll('.badge-orange, .badge-green').forEach(el => {
                    el.textContent = isWholesale ? 'Wholesale' : 'Retail';
                    el.classList.toggle('badge-green', isWholesale);
                    el.classList.toggle('badge-orange', !isWholesale);
                });

                if (typeof window.setHeroView === 'function') {
                    window.setHeroView(isWholesale ? 'wholesale' : 'retail');
                }

            } else {

                // Guest Mode
                if (userProfileEl) {
                    userProfileEl.classList.remove('hide');
                    userProfileEl.classList.add('show');
                    userProfileEl.style.display = 'flex';
                }
                if (logoutDisplayEl) {
                    logoutDisplayEl.classList.remove('show');
                    logoutDisplayEl.classList.add('hide');
                    logoutDisplayEl.style.display = 'none';
                }

                if (pillText) pillText.textContent = 'Guest';
                document.body.classList.remove('wholesale-mode-active');

                // E. Update Product Price Badges
                document.querySelectorAll('.badge-orange, .badge-green').forEach(el => {

                    el.textContent = isWholesale ? 'Wholesale' : 'Retail';
                    el.classList.toggle('badge-green', isWholesale);
                    el.classList.toggle('badge-orange', !isWholesale);

                });

                if (typeof window.setHeroView === 'function') {
                    window.setHeroView('guest');
                }

            }

            document.dispatchEvent(new CustomEvent('wholesaleModeChanged'));
            return true; // Successfully applied!

        }

        // Try applying immediately
        const success = applyToDOM();

        // If DOM wasn't ready, poll every 50ms until the header renders
        if (!success) {
            let attempts = 0;
            const interval = setInterval(function() {
                attempts++;
                if (applyToDOM() || attempts > 40) { // Stop after 2 seconds max
                    clearInterval(interval);
                }
            }, 50);
        }
    };

    // --------------------------------------------
    // 10.4. LOGOUT HANDLER
    // --------------------------------------------
    window.handleLogout = function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('accountType');
        localStorage.removeItem('wholesaleMode');
        localStorage.removeItem('businessName');

        window.updateAuthUI(false);

        if (typeof window.closeAuthOverlay === 'function') {
            window.closeAuthOverlay();
        }

        alert('You have logged out successfully.');
    };

    // --------------------------------------------
    // 10.5. VIEW SWITCHER & MODAL CONTROLLER
    // --------------------------------------------
    window.showAuthView = function(view, authStatus, userName, accountType) {
        const allViews = document.querySelectorAll('.auth-view');
        if (allViews.length === 0) return;

        allViews.forEach(el => {
            el.classList.remove('show');
            el.classList.add('hide');
        });

        const viewMap = {
            login: 'authViewLogin',
            register: 'authViewRegister',
            success: 'authViewSuccess',
            orderSuccess: 'authViewOrderSuccess',
            orderError: 'authViewOrderError'
        };

        const target = document.getElementById(viewMap[view]);
        if (!target) return;

        target.classList.remove('hide');
        target.classList.add('show');

        if (view === 'success') {
            const isWholesale = (accountType === 'wholesale');

            target.querySelectorAll('.login').forEach(el => {
                el.classList.toggle('show', authStatus === 'login');
                el.classList.toggle('hide', authStatus !== 'login');
            });

            target.querySelectorAll('.register').forEach(el => {
                el.classList.toggle('show', authStatus === 'register');
                el.classList.toggle('hide', authStatus !== 'register');
            });

            target.querySelectorAll('#successBusinessName, .user-name-display').forEach(el => {
                const badge = isWholesale ? '🏢 Business Account' : '🛍️ Individual Account';
                el.innerHTML = `Welcome, <strong>${userName}</strong>! <span style="font-size: 0.85rem; color: #64748b;">(${badge})</span>`;
            });

            // Immediately persist & apply login session
            window.updateAuthUI(true, userName, accountType || 'retail');
        }

        if (typeof window.openAuthOverlay === 'function') {
            window.openAuthOverlay();
        }
    };

    // --------------------------------------------
    // 10.6. GLOBAL CLICK EVENT DELEGATION
    // --------------------------------------------
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.id === 'logoutBtn' || e.target.classList.contains('logout-button'))) {
            e.preventDefault();
            window.handleLogout();
        }
    });

    // --------------------------------------------
    // 10.7. PAGE LOAD INITIALIZER
    // --------------------------------------------
    function initializeAuthOnLoad() {

        console.log("🔍 Checking Auth on Page Load...");

        const rawLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const rawUserName = localStorage.getItem('userName');
        const rawAccountType = localStorage.getItem('accountType');
        
        console.log("Storage Values Found:", { rawLoggedIn, rawUserName, rawAccountType });
        
        const legacyWholesale = localStorage.getItem('wholesaleMode') === 'true';
        const legacyName = localStorage.getItem('businessName');

        let isLoggedIn = rawLoggedIn;
        let userName = rawUserName;
        let accountType = rawAccountType;

        if (!isLoggedIn && legacyWholesale) {
            console.log("✅ User is logged in! Attempting to update UI...");
            isLoggedIn = true;
            accountType = 'wholesale';
            userName = legacyName || 'Retailer';
        }

        if (isLoggedIn) {
            if (!accountType) accountType = legacyWholesale ? 'wholesale' : 'retail';
            if (!userName || userName === 'null') userName = legacyName || 'Customer';
            
            window.updateAuthUI(true, userName, accountType);
        } else {
            window.updateAuthUI(false);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAuthOnLoad);
    } else {
        initializeAuthOnLoad();
    }

})();

// ============================================
// 11. CART MANAGEMENT MODULE
// ============================================
/*
(function() {

    let cart = [];

    function isWholesaleActiveSafe() {

        if (typeof window.isWholesaleActive === 'function') {
            return window.isWholesaleActive();
        }
        return localStorage.getItem('wholesaleMode') === 'true';

    }

    function loadCart() {

        try {

            const stored = localStorage.getItem('foodcart_cart');
            cart = stored ? JSON.parse(stored) : [];

        } catch (e) {

            cart = [];

        }

    }

    function saveCart() {
        
        try {

            localStorage.setItem('foodcart_cart', JSON.stringify(cart));

        } catch (e) {

            console.error('Failed to save cart:', e);

        }

        updateCartBadge();
        updateMiniCart();
        
        if (typeof window.renderCartPage === 'function') {

            window.renderCartPage();

        }

        if (typeof window.renderCheckoutSummary === 'function') {

            window.renderCheckoutSummary();

        }

    }

    // --- Global Cart API Methods ---

    window.getCart = function() {

        loadCart();
        return cart;
        
    };

    window.getCartCount = function() {

        loadCart();
        return cart.reduce((total, i) => total + (parseInt(i.quantity, 10) || 0), 0);

    };

    window.getCartTotal = function() {

        loadCart();
        const isWholesale = isWholesaleActiveSafe();
        return cart.reduce((total, item) => {

            const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
            return total + (price * item.quantity);

        }, 0);

    };

    window.addToCart = function(sku, name, retailPrice, wholesalePrice, quantity, image) {

        quantity = parseInt(quantity, 10) || 1;
        loadCart();
        const existing = cart.find(i => i.sku === sku);

        if (existing) {

            existing.quantity += quantity;

        } else {

            cart.push({
                sku: sku,
                name: name,
                retailPrice: parseFloat(retailPrice) || 0,
                wholesalePrice: parseFloat(wholesalePrice || retailPrice) || 0,
                quantity: quantity,
                image: image || ''
            });

        }

        saveCart();

    };

    window.removeFromCart = function(sku) {
        loadCart();
        cart = cart.filter(i => i.sku !== sku);
        saveCart();
    };

    window.updateCartQuantity = function(sku, quantity) {
        loadCart();
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            window.removeFromCart(sku);
            return;
        }

        const item = cart.find(i => i.sku === sku);
        if (item) {
            item.quantity = qty;
            saveCart();
        }
    };

    window.clearCart = function() {
        cart = [];
        saveCart();
    };

    // --- UI Synchronizers ---

    // Badges update
    function updateCartBadge() {
        const count = window.getCartCount();
        const badges = document.querySelectorAll('.cart-badge');

        if (badges.length === 0) return;

        const isWholesale = isWholesaleActiveSafe();

        badges.forEach(badge => {
            badge.textContent = count;
            if (isWholesale) {
                badge.classList.remove('bg-amber');
                badge.classList.add('bg-green');
            } else {
                badge.classList.remove('bg-green');
                badge.classList.add('bg-amber');
            }
        });
    }

    // Mini-Cart update
    function updateMiniCart() {

        const miniCartItems = document.querySelectorAll('.mini-cart-items, #mini-cart-list');
        const miniCartTotal = document.querySelectorAll('.mini-cart-total, #mini-cart-subtotal');
        const items = window.getCart();
        const total = window.getCartTotal();
        const isWholesale = isWholesaleActiveSafe();

        if (miniCartItems.length > 0) {

            miniCartItems.forEach(container => {

                if (items.length === 0) {
                    container.innerHTML = `<p style="padding:15px; text-align:center; color:#64748b;">Your cart is empty.</p>`;
                    return;
                }

                let html = '';
                items.forEach(item => {
                    const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
                    html += `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-bottom:1px solid #f1f5f9; font-size:0.9rem;">
                            <div>
                                <div style="font-weight:600;">${item.name}</div>
                                <div style="color:#64748b; font-size:0.8rem;">Qty: <strong>${item.quantity}</strong> × ₦${price.toLocaleString()}</div>
                            </div>
                            <div style="font-weight:700;">₦${(price * item.quantity).toLocaleString()}</div>
                        </div>`;
                });
                container.innerHTML = html;
            });
        }

        if (miniCartTotal.length > 0) {

            miniCartTotal.forEach(el => {
                el.textContent = `₦${total.toLocaleString()}`;
            });

        }

    }

    // Cart Page renderer
    window.renderCartPage = function() {

        const tableBody = document.getElementById('cart-list') || document.getElementById('cart-items');
        if (!tableBody) return;

        const isWholesale = isWholesaleActiveSafe();
        const items = window.getCart();
        const subtotal = window.getCartTotal();
        
        const baseDeliveryFee = 700;
        const freeDeliveryThreshold = 150000;

        // 1. Empty Cart Table State
        if (items.length === 0) {

            tableBody.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-inner">
                        <span class="empty-cart-icon">🛒</span>
                        <h3 class="empty-cart-title">Your cart is currently empty</h3>
                        <p class="empty-cart-desc">Looks like you haven't added any products to your cart yet.</p>
                        <a href="shop.html" class="btn btn-green">Browse Store</a>
                    </div>
                </div>`;

        } else {

            // 2. Populate Cart Rows
            let tableHtml = '';
            items.forEach(item => {
                
                const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
                const itemSubtotal = price * item.quantity;
                const itemImage = item.image ? `<img src="${item.image}" alt="${item.name}" class="thumb-placeholder">` : '';

                tableHtml += `
                    <div class="cart-card">
                    
                        <div class="card-thumb">
                            <picture class="thumb-placeholder">${itemImage}</picture>
                        </div>
                                
                        <div class="card-content">

                            <div class="card-header">
                               <h3 class="item-title">${item.name}</h3>
                               <button type="button" class="btn-remove" aria-label="Remove item" onclick="window.removeFromCart('${item.sku}');">✕</button>
                            </div>

                            <p class="item-variant"></p>

                            <div class="card-footer">

                                <div class="qty-stepper">
                                    <button type="button" class="step-btn">-</button>
                                    <input 
                                            type="number" 
                                            class="qty-field"
                                            min="1" 
                                            value="${item.quantity}" 
                                            onchange="window.updateCartQuantity('${item.sku}', parseInt(this.value, 10));"
                                            aria-label="Quantity" name="Quantity"
                                    >
                                    <button type="button" class="step-btn">+</button>
                                </div>
                                                                        
                                <div class="item-price-block">
                                    <span class="unit-price">₦${price.toLocaleString()}</span>
                                    <span class="subtotal-price">₦${itemSubtotal.toLocaleString()}</span>
                                </div>

                            </div>

                        </div>

                    </div>`;
            });
            tableBody.innerHTML = tableHtml;
        }

        // 3. Free Shipping Progress Bar
        const shippingProgressContainer = document.getElementById('free-shipping-container');
        if (shippingProgressContainer) {
            if (subtotal >= freeDeliveryThreshold && items.length > 0) {

                shippingProgressContainer.innerHTML = `
                    <p>🎯 🎉 <strong>Congratulations!</strong> You qualify for <strong>Free Delivery</strong> within Lagos.</p>
                    <div class="progress-track"><div class="progress-fill" style="width:100%;"></div></div>`;

            } else {
                const amountLeft = freeDeliveryThreshold - subtotal;
                const percentage = Math.min(Math.round((subtotal / freeDeliveryThreshold) * 100), 100);
                shippingProgressContainer.innerHTML = `
                    🎯 <strong>Add ₦${amountLeft.toLocaleString()} more</strong> to qualify for <strong>Free Delivery</strong> within Lagos.
                    <div style="height:8px; background:#e2e8f0; border-radius:4px; margin-top:8px;">
                        <div style="width:${percentage}%; height:8px; background:#16a34a; border-radius:4px; transition:width 0.3s ease;"></div>
                    </div>`;
            }
        }

        // 4. Update Summary Displays
        const isFreeDelivery = subtotal >= freeDeliveryThreshold && items.length > 0;
        const finalDeliveryFee = (items.length === 0 || isFreeDelivery) ? 0 : baseDeliveryFee;
        const grandTotal = subtotal + finalDeliveryFee;

        const subtotalEl = document.getElementById('cart-subtotal-display');
        const deliveryEl = document.getElementById('delivery-fee-display');
        const totalEl = document.getElementById('cart-total-display');

        if (subtotalEl) subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;
        if (deliveryEl) {
            deliveryEl.textContent = isFreeDelivery ? 'FREE' : `₦${finalDeliveryFee.toLocaleString()}`;
            deliveryEl.style.color = isFreeDelivery ? '#16a34a' : '#64748b';
            deliveryEl.style.fontWeight = isFreeDelivery ? '700' : 'normal';
        }
        if (totalEl) totalEl.textContent = `₦${grandTotal.toLocaleString()}`;
        
    };

    // Listen for pricing mode toggle (Wholesale vs Retail)
    document.addEventListener('wholesaleModeChanged', function() {
        updateCartBadge();
        updateMiniCart();
        window.renderCartPage();
        if (typeof window.renderCheckoutSummary === 'function') {
            window.renderCheckoutSummary();
        }
    });

    // --- Execution & Initialization ---

    // Load storage into memory immediately

    loadCart();

    function initCartUI() {
        loadCart();
        updateCartBadge();
        updateMiniCart();
        window.renderCartPage();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCartUI);
    } else {
        initCartUI();
    }

    window.addEventListener('load', function() {
        updateCartBadge();
        updateMiniCart();
    });

})();
*/

// --- 1. CART CONTROLLER MODULE ---
(function() {
  let cart = [];

  function isWholesaleActiveSafe() {
    if (typeof window.isWholesaleActive === 'function') {
      return window.isWholesaleActive();
    }
    return localStorage.getItem('wholesaleMode') === 'true';
  }

  function loadCart() {
    try {
      const stored = localStorage.getItem('foodcart_cart');
      cart = stored ? JSON.parse(stored) : [];
    } catch (e) {
      cart = [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem('foodcart_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }

    updateCartBadge();
    updateMiniCart();
    if (typeof window.renderCartPage === 'function') window.renderCartPage();
    if (typeof window.renderCheckoutSummary === 'function') window.renderCheckoutSummary();
  }

  // --- API Methods ---
  window.getCart = function() { loadCart(); return cart; };
  
  window.getCartCount = function() {
    loadCart();
    return cart.reduce((total, i) => total + (parseInt(i.quantity, 10) || 0), 0);
  };

  window.getCartTotal = function() {
    loadCart();
    const isWholesale = isWholesaleActiveSafe();
    return cart.reduce((total, item) => {
      const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
      return total + (price * item.quantity);
    }, 0);
  };

  window.addToCart = function(sku, name, retailPrice, wholesalePrice, quantity, image) {
    quantity = parseInt(quantity, 10) || 1;
    loadCart();
    const existing = cart.find(i => i.sku === sku);

    if (existing) {

      existing.quantity += quantity;

    } else {

      cart.push({
        sku: sku,
        name: name,
        retailPrice: parseFloat(retailPrice) || 0,
        wholesalePrice: parseFloat(wholesalePrice || retailPrice) || 0,
        quantity: quantity,
        image: image || ''
      });

    }

    saveCart();

  };

  window.removeFromCart = function(sku) {
    loadCart();
    cart = cart.filter(i => i.sku !== sku);
    saveCart();
  };

  window.updateCartQuantity = function(sku, quantity) {

    loadCart();
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      window.removeFromCart(sku);
      return;
    }

    const item = cart.find(i => i.sku === sku);
    if (item) {
      item.quantity = qty;
      saveCart();
    }

  };

  window.clearCart = function() {

    cart = [];
    saveCart();

  };

  // Mock Stock Handler (Fallback if stock system missing)
  if (typeof window.getStockStatus !== 'function') {
    window.getStockStatus = function(sku) {
      return { stock: 999, status: 'in-stock' };
    };
  }

  // --- Synchronizers ---
  function updateCartBadge() {

    const count = window.getCartCount();
    const badges = document.querySelectorAll('.cart-badge');
    if (!badges.length) return;

    const isWholesale = isWholesaleActiveSafe();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('bg-green', isWholesale);
      badge.classList.toggle('bg-amber', !isWholesale);
    });

  }

  function updateMiniCart() {

    const miniCartItems = document.querySelectorAll('.mini-cart-items, #mini-cart-list');
    const miniCartTotal = document.querySelectorAll('.mini-cart-total, #mini-cart-subtotal');
    const items = window.getCart();
    const total = window.getCartTotal();
    const isWholesale = isWholesaleActiveSafe();

    if (miniCartItems.length > 0) {

      miniCartItems.forEach(container => {
        if (items.length === 0) {
          container.innerHTML = `<p style="padding:15px; text-align:center; color:#64748b;">Your cart is empty.</p>`;
          return;
        }

        let html = '';
        items.forEach(item => {

          const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
          html += `
            <div style="display:flex; justify-style:space-between; align-items:center; padding:8px 12px; border-bottom:1px solid #f1f5f9; font-size:0.9rem;">
              <div>
                <div style="font-weight:600;">${item.name}</div>
                <div style="color:#64748b; font-size:0.8rem;">Qty: <strong>${item.quantity}</strong> × ₦${price.toLocaleString()}</div>
              </div>
              <div style="font-weight:700;">₦${(price * item.quantity).toLocaleString()}</div>
            </div>`;

        });
        container.innerHTML = html;
      });
    }

    if (miniCartTotal.length > 0) {
      miniCartTotal.forEach(el => { el.textContent = `₦${total.toLocaleString()}`; });
    }
  }

  window.renderCartPage = function() {
    const tableBody = document.getElementById('cart-list') || document.getElementById('cart-items');
    if (!tableBody) return;

    const isWholesale = isWholesaleActiveSafe();
    const items = window.getCart();
    const subtotal = window.getCartTotal();
    const baseDeliveryFee = 700;
    const freeDeliveryThreshold = 150000;

    if (items.length === 0) {

      tableBody.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-inner">
                    <span class="empty-cart-icon">🛒</span>
                    <h3 class="empty-cart-title">Your Cart is empty</h3>
                    <p class="empty-cart-desc">Looks like you haven't add any products yet.</p>
                    <a href="shop.html" class="btn btn-green btn-cart">Browse Catalogue</a>
                </div>
            </div>`;

    } else {
      let tableHtml = '';
      items.forEach(item => {
        const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
        const itemSubtotal = price * item.quantity;
        const itemImage = item.image ? `<img src="${item.image}" alt="${item.name}">` : '🌾';

        tableHtml += `
          <div class="cart-card">
            <div class="card-thumb">
              <div class="thumb-placeholder">${itemImage}</div>
            </div>
            <div class="card-content">
              <div class="card-header">
                <h3 class="item-title">${item.name}</h3>
                <button type="button" class="btn-remove" aria-label="Remove item" onclick="window.removeFromCart('${item.sku}')">&times;</button>
              </div>
              <p class="item-variant"></p>
              <div class="card-footer">
                <div class="qty-stepper">
                  <button type="button" class="step-btn" onclick="window.updateCartQuantity('${item.sku}', ${item.quantity - 1})">-</button>
                  <input type="number" class="qty-field" value="${item.quantity}" min="1" aria-label="Quantity" onchange="window.updateCartQuantity('${item.sku}', parseInt(this.value, 10))" />
                  <button type="button" class="step-btn" onclick="window.updateCartQuantity('${item.sku}', ${item.quantity + 1})">+</button>
                </div>
                <div class="item-price-block">
                  <span class="unit-price">₦${price.toLocaleString()} / ea</span>
                  <span class="subtotal-price">₦${itemSubtotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>`;
      });
      tableBody.innerHTML = tableHtml;
    }

    // Free Shipping Progress Update
    const shippingProgressContainer = document.getElementById('free-shipping-container');
    if (shippingProgressContainer) {
      if (subtotal >= freeDeliveryThreshold && items.length > 0) {
        shippingProgressContainer.innerHTML = `
          <p>🎉 <strong>Congratulations!</strong> You qualify for <strong>Free Delivery</strong> within Lagos.</p>
          <div class="progress-track"><div class="progress-fill" style="width:100%;"></div></div>`;
      } else {
        const amountLeft = freeDeliveryThreshold - subtotal;
        const percentage = Math.min(Math.round((subtotal / freeDeliveryThreshold) * 100), 100);
        shippingProgressContainer.innerHTML = `
          <p> Add <strong>₦${amountLeft.toLocaleString()}</strong> more to qualify for <strong>Free Delivery</strong> in Lagos.</p>
          <div class="progress-track"><div class="progress-fill" style="width:${percentage}%;"></div></div>`;
      }
    }

    // Totals Calculation
    const isFreeDelivery = subtotal >= freeDeliveryThreshold && items.length > 0;
    const finalDeliveryFee = (items.length === 0 || isFreeDelivery) ? 0 : baseDeliveryFee;
    const grandTotal = subtotal + finalDeliveryFee;

    const subtotalEl = document.getElementById('cart-subtotal-display');
    const deliveryEl = document.getElementById('delivery-fee-display');
    const totalEl = document.getElementById('cart-total-display');

    if (subtotalEl) subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;
    if (deliveryEl) {
      deliveryEl.textContent = isFreeDelivery ? 'FREE' : `₦${finalDeliveryFee.toLocaleString()}`;
      deliveryEl.style.color = isFreeDelivery ? '#16a34a' : '#64748b';
    }
    if (totalEl) totalEl.textContent = `₦${grandTotal.toLocaleString()}`;
  };

  // Re-render when wholesale toggle fires
  document.addEventListener('wholesaleModeChanged', function() {
    updateCartBadge();
    updateMiniCart();
    window.renderCartPage();
    if (typeof window.renderCheckoutSummary === 'function') window.renderCheckoutSummary();
  });

  // Init Execution
  loadCart();
  function initCartUI() {
    loadCart();
    updateCartBadge();
    updateMiniCart();
    window.renderCartPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartUI);
  } else {
    initCartUI();
  }
})();


// ============================================
// 12. ADD TO CART EVENT LISTENER
// ============================================
/*
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.qty-add .btn, .add-to-cart-btn');
    if (!btn) return;

    e.preventDefault();

    const pdpSummary = btn.closest('.pdp-summary, .product-card');
    if (!pdpSummary) return;

    const isWholesale = (typeof window.isWholesaleActive === 'function') 
        ? window.isWholesaleActive() 
        : (localStorage.getItem('wholesaleMode') === 'true');

    const titleEl = pdpSummary.querySelector('.title, .product-title, h3, h4');
    const skuEl = pdpSummary.querySelector('.sku');
    
    const productName = titleEl ? titleEl.textContent.trim() : 'Product';
    const baseSku = skuEl ? skuEl.textContent.replace(/^SKU:\s*//*i, '').trim() : 'GENERIC';

    const modeSelect = isWholesale 
        ? pdpSummary.querySelector('select#wholesale') 
        : pdpSummary.querySelector('select#retail');

    const selectEl = modeSelect 
        || pdpSummary.querySelector('select#wholesale') 
        || pdpSummary.querySelector('select#retail')
        || pdpSummary.querySelector('select');

    const priceStaticEl = pdpSummary.querySelector('.price');

    const qtyInput = isWholesale 
        ? pdpSummary.querySelector('input.qty-count.wholesale') 
        : pdpSummary.querySelector('input.qty-count.retail');

    const fallbackQty = pdpSummary.querySelector('.qty-input input, input[type="number"]');
    const quantity = parseInt(qtyInput ? qtyInput.value : (fallbackQty ? fallbackQty.value : 1), 10) || 1;

    let selectedValue = selectEl ? selectEl.value : '';
    let selectedOptionText = selectEl && selectEl.selectedIndex !== -1 
        ? selectEl.options[selectEl.selectedIndex].text 
        : '';
    
    const itemSku = selectedValue ? `${baseSku}-${selectedValue}` : baseSku;

    let rawPriceText = '';
    if (selectEl && selectedOptionText) {
        rawPriceText = selectedOptionText;
    } else if (priceStaticEl) {
        rawPriceText = priceStaticEl.value || priceStaticEl.textContent || '';
    }

    const priceMatch = rawPriceText.match(/₦\s*([\d,]+(?:\.\d+)?)/);
    const parsedPrice = priceMatch 
        ? parseFloat(priceMatch[1].replace(/,/g, '')) 
        : (parseFloat(rawPriceText.replace(/[^0-9.]/g, '')) || 0);

    const retailPrice = parsedPrice; 
    const wholesalePrice = parsedPrice;

    const fullItemName = selectedOptionText ? `${productName} (${selectedOptionText.trim()})` : productName;

    if (typeof window.addToCart === 'function') {
        window.addToCart(itemSku, fullItemName, retailPrice, wholesalePrice, quantity);
    }
});


// ============================================
// 13. ENHANCED ADD TO CART (WITH STOCK CHECKS)
// ============================================
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.qty-add .btn, .add-to-cart-btn');
    if (!btn || btn.disabled) return;

    e.preventDefault();

    const pdpSummary = btn.closest('.pdp-summary, .product-card');
    if (!pdpSummary) return;

    const isWholesale = (typeof window.isWholesaleActive === 'function') 
        ? window.isWholesaleActive() 
        : (localStorage.getItem('wholesaleMode') === 'true');

    const titleEl = pdpSummary.querySelector('.title, .product-title, h3, h4');
    const skuEl = pdpSummary.querySelector('.sku');
    
    const productName = titleEl ? titleEl.textContent.trim() : 'Product';
    const baseSku = skuEl ? skuEl.textContent.replace(/^SKU:\s*//*i, '').trim() : 'GENERIC';

    const selectEl = pdpSummary.querySelector('select#wholesale, select#retail, select');
    const qtyInput = pdpSummary.querySelector('input.qty-count, input[type="number"]');
    
    const requestedQty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;
    const selectedValue = selectEl ? selectEl.value : '';
    const selectedOptionText = selectEl && selectEl.selectedIndex !== -1 ? selectEl.options[selectEl.selectedIndex].text : '';
    
    const itemSku = selectedValue ? `${baseSku}-${selectedValue}` : baseSku;

    // STOCK VALIDATION
    const stockInfo = window.getStockStatus(itemSku);
    const cart = window.getCart ? window.getCart() : [];
    const existingCartItem = cart.find(i => i.sku === itemSku);
    const qtyInCart = existingCartItem ? existingCartItem.quantity : 0;
    const availableStock = stockInfo.stock - qtyInCart;

    if (stockInfo.stock <= 0) {
        alert(`Sorry, ${productName} is currently out of stock.`);
        return;
    }

    if (requestedQty > availableStock) {
        if (availableStock <= 0) {
            alert(`You already have all ${stockInfo.stock} available units of this item in your cart.`);
        } else {
            alert(`Sorry, you can only add ${availableStock} more unit(s) of this item. (${qtyInCart} already in cart).`);
        }
        return;
    }

    // Extract Price
    const priceStaticEl = pdpSummary.querySelector('.price');
    let rawPriceText = selectedOptionText || (priceStaticEl ? priceStaticEl.value || priceStaticEl.textContent : '');
    const priceMatch = rawPriceText.match(/₦\s*([\d,]+(?:\.\d+)?)/);
    const parsedPrice = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;

    const fullItemName = selectedOptionText ? `${productName} (${selectedOptionText.trim()})` : productName;

    if (typeof window.addToCart === 'function') {
        window.addToCart(itemSku, fullItemName, parsedPrice, parsedPrice, requestedQty);
        
        // Button Feedback Animation
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Added!';
        btn.style.backgroundColor = '#16a34a';
        btn.style.color = '#ffffff';

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = '';
            btn.style.color = '';
        }, 1200);
    }
});
*/

// --- UNIVERSAL ADD-TO-CART CLICK HANDLER ---
document.addEventListener('click', function(e) {

  const btn = e.target.closest('.add-to-cart-btn, .btn-green, .qty-add .btn');
  if (!btn || btn.disabled) return;

  const card = btn.closest('.product-card, .pdp-summary');
  if (!card) return;

  e.preventDefault();

  const isWholesale = (typeof window.isWholesaleActive === 'function') 
    ? window.isWholesaleActive() 
    : (localStorage.getItem('wholesaleMode') === 'true');

  // 1. Product & SKU Identification
  const titleEl = card.querySelector('.title, .product-title, h3, h4');
  const skuEl = card.querySelector('.sku');
  const productName = titleEl ? titleEl.textContent.trim() : 'Product';
  
  const rawSku = card.getAttribute('data-sku') || (skuEl ? skuEl.textContent.replace(/^SKU:\s*/i, '').trim() : 'GENERIC');
  const sizeEl = card.getAttribute('data-size');
 
  // 2. Variation Dropdown Check
  const selectEl = card.querySelector('select#wholesale, select#retail, select');
  const selectedValue = selectEl ? selectEl.value : '';
  const selectedOptionText = selectEl && selectEl.selectedIndex !== -1 ? selectEl.options[selectEl.selectedIndex].text : '';
  const itemSku = selectedValue ? `${rawSku}-${selectedValue}` : rawSku;

  // 3. Existing Cart & Stock State
  const cart = window.getCart ? window.getCart() : [];
  const existingItem = cart.find(i => i.sku === itemSku);
  const qtyInCart = existingItem ? existingItem.quantity : 0;

// 4. Variant-Specific Quantity & Wholesale MOQ Processing
  const qtyInput = card.querySelector('input.qty-count, input[type="number"]');
  let requestedQty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;

  const WHOLESALE_MOQ = 10;

  if (isWholesale) {
    // Check total accumulated quantity for THIS SPECIFIC VARIANT (itemSku)
    const totalVariantQty = qtyInCart + requestedQty;

    // If this specific variant in the cart is still below MOQ (10 bags)
    if (totalVariantQty < WHOLESALE_MOQ) {
      const topUpAmount = WHOLESALE_MOQ - qtyInCart;
      requestedQty = topUpAmount;
      
      if (qtyInput) qtyInput.value = WHOLESALE_MOQ;

      alert(`Wholesale orders require a Minimum Order Quantity (MOQ) of ${WHOLESALE_MOQ} bags per variant.\n\nQuantity for this item updated to ${WHOLESALE_MOQ}.`);
    }
    // If qtyInCart is already >= 10 for this SKU, totalVariantQty < WHOLESALE_MOQ is false.
    // It cleanly bypasses this block and processes normal +1 increments!
  }

  // 5. Stock Validation
  const stockInfo = (typeof window.getStockStatus === 'function') 
    ? window.getStockStatus(itemSku) 
    : { stock: 999, status: 'in-stock' };
    
  const availableStock = stockInfo.stock - qtyInCart;

  if (stockInfo.stock <= 0) {
    alert(`Sorry, ${productName} is currently out of stock.`);
    return;
  }

  if (requestedQty > availableStock) {
    alert(availableStock <= 0 
      ? `You already have all ${stockInfo.stock} available units in your cart.` 
      : `Only ${availableStock} more unit(s) available (${qtyInCart} already in cart).`
    );
    return;
  }

  // 6. Prices Parsing
  let retailPrice = parseFloat(card.getAttribute('data-price-retail')) || 0;
  let wholesalePrice = parseFloat(card.getAttribute('data-price-wholesale')) || retailPrice;

  if (!retailPrice) {
    const priceEl = card.querySelector('.price.price-retail, .price.retail, .price');
    const priceMatch = priceEl ? priceEl.textContent.match(/₦\s*([\d,]+(?:\.\d+)?)/) : null;
    retailPrice = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
    wholesalePrice = retailPrice;
  }

  const fullItemName = selectedOptionText ? `${productName} (${selectedOptionText.trim()})` : productName;

  // 7. Add to Cart Execution
  if (typeof window.addToCart === 'function') {
    window.addToCart(itemSku, fullItemName, retailPrice, wholesalePrice, requestedQty);

    // Button Feedback
    const originalText = btn.innerHTML;
    btn.innerHTML = '✅ Added!';
    btn.style.backgroundColor = '#16a34a';
    btn.style.color = '#ffffff';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.backgroundColor = '';
      btn.style.color = '';
    }, 1200);
  }
});

// ============================================
// 14. CHECKOUT PROCESSOR MODULE
// ============================================
(function() {

    const STORAGE_KEY = 'foodcart_cart';

    function isWholesaleActive() {
        if (typeof window.isWholesaleActive === 'function') {
            return window.isWholesaleActive();
        }
        return localStorage.getItem('wholesaleMode') === 'true';
    }

    function getCheckoutCartItems() {

        if (typeof window.getCart === 'function') {
            return window.getCart();
        }
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }

    }

    function calculateSubtotal(items) {
        const isWholesale = isWholesaleActive();
        return items.reduce((sum, item) => {
            const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
            return sum + (price * item.quantity);
        }, 0);
    }

    window.renderCheckoutSummary = function() {
        const summaryContainer = document.querySelector('.order-summary-inner') 
                              || document.getElementById('checkout-order-summary-inner') 
                              || document.querySelector('.checkout-summary-inner');
        
        if (!summaryContainer) return;

        const items = getCheckoutCartItems();
        const subtotal = calculateSubtotal(items);
        const isWholesale = isWholesaleActive();

        const submitBtn = document.getElementById('order-btn') || document.querySelector('#checkout-form button[type="submit"]');

        if (items.length === 0) {
            summaryContainer.innerHTML = `
                <div class="empty-cart-inner">
                    <span class="empty-cart-icon">🛒</span>
                    <p class="empty-cart-desc">Your cart is empty.</p>
                    <a href="shop.html" class="btn btn-green btn-cart">Return to Shop</a>
                </div>`;
            
            if (submitBtn) {
                submitBtn.display = true;
                submitBtn.style.opacity = '0.5';
                submitBtn.style.display = 'none';
                submitBtn.style.cursor = 'not-allowed';
            }
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.display = 'flex';
            submitBtn.style.cursor = 'pointer';
        }

        const speedSelect = document.getElementById('checkout-speed');
        const lgaSelect = document.getElementById('checkout-lga');
        
        let deliveryFee = 700;
        if (speedSelect && speedSelect.options[speedSelect.selectedIndex]) {
            const selectedOpt = speedSelect.options[speedSelect.selectedIndex];
            deliveryFee = parseFloat(selectedOpt.getAttribute('data-fee')) || 700;
        }

        const freeDeliveryThreshold = 150000;
        const isFreeDelivery = subtotal >= freeDeliveryThreshold;
        const finalDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
        const grandTotal = subtotal + finalDeliveryFee;

        let html = '';
        items.forEach(item => {
            const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
            const itemTotal = price * item.quantity;
            html += `
                <div class="order-item">
                    <div class="item-desc">${item.name} <span class="highlight">x${item.quantity}</span></div>
                    <span class="item-cost">₦${itemTotal.toLocaleString()}</span>
                </div>`;
        });

        const selectedLgaText = (lgaSelect && lgaSelect.value && lgaSelect.selectedIndex !== -1) 
            ? lgaSelect.options[lgaSelect.selectedIndex].text 
            : 'Ikeja';
            
        const isStandard = speedSelect && speedSelect.value && speedSelect.value.toLowerCase().includes('standard');
        const speedLabel = isStandard ? 'Standard' : 'Express';

        html += `<hr class="line-divider">`;
        html += `
            <div class="order-subtotal" >
                <span>Subtotal</span>
                <span class="sub-total">₦${subtotal.toLocaleString()}</span>
            </div>
            <div class="order-delivery ${isFreeDelivery ? 'free' : 'no-free'}">
                <span>🚚 ${speedLabel} Delivery (${selectedLgaText})</span>
                <span class="delivery-amt">${isFreeDelivery ? 'FREE' : '₦' + finalDeliveryFee.toLocaleString()}</span>
            </div>`;
        html += `<hr class="line-divider">`;
        html += `
            <div class="order-total">
                <span>Total</span>
                <span class="total">₦${grandTotal.toLocaleString()}</span>
            </div>`;

        summaryContainer.innerHTML = html;
    };

    function initCheckout() {
        window.renderCheckoutSummary();

        const speedSelect = document.getElementById('checkout-speed');
        const lgaSelect = document.getElementById('checkout-lga');
        const checkoutForm = document.getElementById('checkout-form');

        if (speedSelect) speedSelect.addEventListener('change', window.renderCheckoutSummary);
        if (lgaSelect) lgaSelect.addEventListener('change', window.renderCheckoutSummary);

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const items = getCheckoutCartItems();
                if (items.length === 0) {

                    if (typeof window.showOrderError === 'function') {

                        window.showOrderError('Your cart is empty. Please add items before proceeding.');

                    } else {

                        alert('Your cart is empty. Please add items before proceeding.');

                    }

                    return;

                }

                const name = (document.getElementById('billing-name')?.value || '').trim();
                const phone = (document.getElementById('billing-phone')?.value || '').trim();
                const email = (document.getElementById('billing-email')?.value || '').trim();
                const address = (document.getElementById('billing-address-1')?.value || '').trim();
                const landmark = (document.getElementById('billing-suburb')?.value || '').trim();
                const lga = document.getElementById('billing-lga')?.value || '';
                const payment = document.getElementById('checkout-payment')?.value || '';

                const errors = [];
                if (!name) errors.push('Full Name is required.');
                if (!phone || !/^0[789][01]\d{8}$/.test(phone)) errors.push('Valid 11-digit Nigerian phone number is required (e.g., 08012345678).');
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email address is required.');
                if (!address) errors.push('Delivery address is required.');
                if (!landmark) errors.push('Landmark / Nearest Junction is required.');
                if (!lga) errors.push('Please select a Local Government Area (LGA).');

                if (errors.length > 0) {
                    if (typeof window.showOrderError === 'function') {
                        window.showOrderError(errors[0]);
                    } else {
                        alert(errors[0]);
                    }
                    return;
                }

                const submitBtn = checkoutForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = '⏳ Processing...';
                }

                setTimeout(function() {
                    const speedSelectEl = document.getElementById('checkout-speed');
                    const subtotal = calculateSubtotal(items);
                    
                    let deliveryFee = 700;
                    if (speedSelectEl && speedSelectEl.options[speedSelectEl.selectedIndex]) {
                        deliveryFee = parseFloat(speedSelectEl.options[speedSelectEl.selectedIndex].getAttribute('data-fee')) || 700;
                    }
                    
                    const finalFee = (subtotal >= 150000) ? 0 : deliveryFee;
                    const grandTotal = subtotal + finalFee;
                    const isStandard = speedSelectEl && speedSelectEl.value && speedSelectEl.value.toLowerCase().includes('standard');

                    const orderData = {
                        orderNumber: '#ORD-' + Math.floor(100000 + Math.random() * 900000),
                        total: `₦${grandTotal.toLocaleString()}`,
                        delivery: `${lga.toUpperCase()} – ${isStandard ? 'Standard' : 'Express'} (${payment === 'cod' ? 'Cash on Delivery' : 'Prepaid'})`,
                        eta: 'Today, 5:00 PM',
                        customerName: name
                    };

                    if (typeof window.toggleWholesaleMode === 'function' && !isWholesaleActive()) {
                        window.toggleWholesaleMode(true, name);
                    }

                    if (typeof window.clearCart === 'function') {
                        window.clearCart();
                    } else {
                        localStorage.removeItem(STORAGE_KEY);
                    }

                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = '🛒 Place Order';
                    }

                    if (typeof window.showOrderSuccess === 'function') {
                        window.showOrderSuccess(orderData);
                    } else {
                        alert(`Order Placed Successfully! Order Total: ${orderData.total}`);
                    }
                }, 1000);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCheckout);
    } else {
        initCheckout();
    }
})();

// ============================================
// 15. BACK TO TOP CONTROLLER (FORCE DIRECT RUN)
// ============================================
/*
console.log("1. Back to Top script file loaded into browser!");

(function() {
    function setupBackToTop() {
        console.log("2. Running DOM setup...");
        const topBtn = document.getElementById('backToTopBtn');

        if (!topBtn) {
            console.error("❌ CRITICAL: #backToTopBtn was not found in your HTML body!");
            return;
        }

        console.log("3. Button found! Attaching capture scroll listener...");

        // Capture scroll on ANY scrolling container
        document.addEventListener('scroll', function(e) {
            const el = e.target === document ? (document.documentElement || document.body) : e.target;
            const scrolled = el.scrollTop || window.scrollY || 0;

            if (scrolled > 150) {
                topBtn.classList.add('show');
            } else {
                topBtn.classList.remove('show');
            }
        }, true);

        topBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.querySelectorAll('*').forEach(item => {
                if (item.scrollTop > 0) item.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    // Run immediately if DOM is already ready, or wait for load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupBackToTop);
    } else {
        setupBackToTop();
    }
})();


// ============================================
// SELF-INJECTING BACK TO TOP CONTROLLER
// ============================================
(function() {
    function initSelfHealingBackToTop() {
        console.log("🚀 Initializing Self-Healing Back to Top Button...");

        // 1. Check if button already exists, or create it dynamically
        let topBtn = document.getElementById('backToTopBtn');

        if (!topBtn) {
            console.log("🛠️ #backToTopBtn missing. Auto-injecting element into <body>...");
            topBtn = document.createElement('button');
            topBtn.id = 'backToTopBtn';
            topBtn.className = 'back-to-top-btn';
            topBtn.setAttribute('type', 'button');
            topBtn.setAttribute('aria-label', 'Scroll back to top');
            topBtn.innerHTML = '↑';
            document.body.appendChild(topBtn);
        }

        console.log("✅ Back to Top Button ready in DOM!");

        // 2. Attach Universal Scroll Capture Listener
        document.addEventListener('scroll', function(e) {
            const el = e.target === document ? (document.documentElement || document.body) : e.target;
            const scrolled = el.scrollTop || window.scrollY || 0;

            if (scrolled > 150) {
                topBtn.classList.add('show');
            } else {
                topBtn.classList.remove('show');
            }
        }, true);

        // 3. Smooth Scroll to Top Click Handler
        topBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.querySelectorAll('*').forEach(item => {
                if (item.scrollTop > 0) item.scrollTo({ top: 0, behavior: 'smooth' });
            });
            console.log("🎯 Back to Top Button clicked. Scrolling to top...");
        });
    }

    // Ensure document.body exists before running
    if (document.body) {
        initSelfHealingBackToTop();
    } else {
        document.addEventListener('DOMContentLoaded', initSelfHealingBackToTop);
    }
})();


// ============================================
// DYNAMIC-FOOTER-SAFE BACK TO TOP CONTROLLER
// ============================================
(function() {

    function setupBackToTopController() {
        console.log("🚀 Initializing Unified Back to Top Controller...");

        // 1. Helper to find or consolidate any existing #backToTopBtn elements
        function getOrCreateButton() {
            const buttons = document.querySelectorAll('#backToTopBtn, .back-to-top-btn');
            
            // If multiple exist (e.g. self-injected + fetched footer), keep the first and remove extras
            if (buttons.length > 1) {
                console.log(`🧹 Found ${buttons.length} duplicate buttons from dynamic footer injection. Cleaning up...`);
                for (let i = 1; i < buttons.length; i++) {
                    buttons[i].remove();
                }
            }

            if (buttons.length >= 1) {
                return buttons[0];
            }

            // If none exist yet (footer template hasn't loaded), create one
            console.log("🛠️ Creating standalone Back to Top button...");
            const btn = document.createElement('button');
            btn.id = 'backToTopBtn';
            btn.className = 'back-to-top-btn';
            btn.setAttribute('type', 'button');
            btn.setAttribute('aria-label', 'Scroll back to top');
            btn.innerHTML = '↑';
            document.body.appendChild(btn);
            return btn;
        }

        const topBtn = getOrCreateButton();

        // 2. Attach Click Handler (delegated or direct)
        topBtn.onclick = function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.querySelectorAll('*').forEach(item => {
                if (item.scrollTop > 0) item.scrollTo({ top: 0, behavior: 'smooth' });
            });
            console.log("🎯 Back to Top clicked. Scrolling to top...");
        };

        // 3. Universal Scroll Listener (Captures all scroll containers)
        document.addEventListener('scroll', function(e) {
            const el = e.target === document ? (document.documentElement || document.body) : e.target;
            const scrolled = el.scrollTop || window.scrollY || 0;

            if (scrolled > 180) {
                topBtn.classList.add('show');
            } else {
                topBtn.classList.remove('show');
            }
        }, true);

        // 4. MutationObserver: Watches for when the dynamic footer finishes injecting
        const observer = new MutationObserver(function() {
            const allBtns = document.querySelectorAll('#backToTopBtn, .back-to-top-btn');
            if (allBtns.length > 1) {
                console.log("🔄 Dynamic footer finished loading. Re-consolidated duplicate buttons.");
                getOrCreateButton(); // Removes duplicate
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupBackToTopController);
    } else {
        setupBackToTopController();
    }
})();
*/

// ============================================
// 15. DYNAMIC FOOTER-ADOPTING BACK TO TOP CONTROLLER
// ============================================
(function() {
    function setupBackToTopController() {
        console.log("🚀 Initializing Dynamic Footer-Adopting Back to Top Controller...");

        let activeBtn = null;

        // Central click handler to bind to whichever button is active
        function handleScrollToTop(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.querySelectorAll('*').forEach(item => {
                if (item.scrollTop > 0) item.scrollTo({ top: 0, behavior: 'smooth' });
            });
            console.log("🎯 Back to Top clicked. Scrolling to top...");
        }

        // Resolves or replaces active button when dynamic content loads
        function syncActiveButton() {
            const allBtns = Array.from(document.querySelectorAll('#backToTopBtn, .back-to-top-btn'));

            if (allBtns.length === 0) {
                // Standalone fallback if footer hasn't injected yet
                if (!activeBtn || !document.body.contains(activeBtn)) {
                    console.log("🛠️ Creating temporary fallback button...");
                    activeBtn = document.createElement('button');
                    activeBtn.id = 'backToTopBtn';
                    activeBtn.className = 'back-to-top-btn';
                    activeBtn.setAttribute('type', 'button');
                    activeBtn.setAttribute('aria-label', 'Scroll back to top');
                    activeBtn.innerHTML = '↑';
                    document.body.appendChild(activeBtn);
                    activeBtn.onclick = handleScrollToTop;
                }
                return;
            }

            // Prefer the button that lives inside the injected footer
            const footerBtn = allBtns.find(btn => btn.closest('footer') || btn.closest('.site-footer'));
            const targetBtn = footerBtn || allBtns[0];

            // Remove any other orphaned duplicate buttons
            allBtns.forEach(btn => {
                if (btn !== targetBtn) {
                    console.log("🧹 Removing duplicate/temporary button...");
                    btn.remove();
                }
            });

            // Re-bind handler to the adopted target button
            activeBtn = targetBtn;
            activeBtn.onclick = handleScrollToTop;
        }

        // Initial sync
        syncActiveButton();

        // Universal Scroll Listener (Captures all scroll containers)
        document.addEventListener('scroll', function(e) {
            if (!activeBtn) return;

            const el = e.target === document ? (document.documentElement || document.body) : e.target;
            const scrolled = el.scrollTop || window.scrollY || 0;

            if (scrolled > 180) {
                activeBtn.classList.add('show');
            } else {
                activeBtn.classList.remove('show');
            }
        }, true);

        // Observe DOM for dynamic footer injection and sync button
        const observer = new MutationObserver(function() {
            syncActiveButton();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupBackToTopController);
    } else {
        setupBackToTopController();
    }
})();


// ============================================
// 16. SHOW SHIPPING COLUMN
// ============================================
document.addEventListener('DOMContentLoaded', function () {

    const shipCheckbox = document.getElementById('ship-to-different');
    const shippingColumn = document.getElementById('shipping');
    const shippingInputs = shippingColumn.querySelectorAll('input, select, textarea');

    function toggleShippingForm() {

        const isDifferent = shipCheckbox.checked;

        if (isDifferent) {

            shippingColumn.classList.remove('d-none');
            // Enable required attributes when shipping form is visible

            shippingInputs.forEach(input => {

                if (input.dataset.wasRequired !== 'false') {

                    input.setAttribute('required', 'required');

                }

            });

        } else {

            shippingColumn.classList.add('d-none');
            // Remove required attributes so form submission works without hidden fields failing

            shippingInputs.forEach(input => {

                input.removeAttribute('required');

            });

        }

    }

    // Run on load and on change
    if (shipCheckbox && shippingColumn) {

        shipCheckbox.addEventListener('change', toggleShippingForm);
        toggleShippingForm();

    }

});
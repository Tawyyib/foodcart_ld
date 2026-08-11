// ============================================
// 1. MOBILE MENU TOGGLE (Clean & Dynamic)
// ============================================
(function() {

    let initialized = false;

    function initMobileMenu() {

        if (initialized) return;
        initialized = true;

        console.log('📱 Mobile menu script initializing...');

        // Single event listener for all click handling
        document.addEventListener('click', function(e) {

            const toggleBtn = e.target.closest('#mobileToggle');
            const nav = document.querySelector('.nav-links');

            // Case 1: Click on the toggle button
            if (toggleBtn && nav) {

                nav.classList.toggle('active');
                toggleBtn.textContent = nav.classList.contains('active') ? '✕' : '☰';
                console.log('Menu toggled:', nav.classList.contains('active'));
                return; // Stop further processing for this click

            }

            // Case 2: Click outside the nav (when open) – close it
            if (nav && nav.classList.contains('active')) {

                // Check if click is outside the nav
                if (!e.target.closest('.nav-links')) {

                    nav.classList.remove('active');
                    // Also update the toggle button text if it exists
                    const btn = document.getElementById('mobileToggle');
                    if (btn) btn.textContent = '☰';
                    console.log('Menu closed by outside click');

                }

            }

        });

        console.log('✅ Mobile menu event listener attached.');

    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', initMobileMenu);

    } else {

        initMobileMenu();

    }

})();

// ============================================
// 2. AUTO-HIGHLIGHT ACTIVE NAV LINK (Dynamic)
// ============================================
(function() {

    let initialized = false;

    function applyNavHighlight() {

        // Prevent multiple runs
        if (initialized) return;
        initialized = true;

        console.log('🔍 Applying nav highlight...');

        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        // Remove query strings
        const cleanCurrentPage = currentPage.split('?')[0];
        console.log('📄 Current page:', cleanCurrentPage);

        const links = document.querySelectorAll('.nav-link a');
        console.log('🔗 Links found:', links.length);

        if (links.length === 0) {

            console.warn('⚠️ No .nav-link a elements found yet. Will retry.');
            initialized = false; // Reset so we can try again
            return false; // Indicate failure

        }

        links.forEach(link => {

            let href = link.getAttribute('href');
            if (!href) return;

            // Remove query strings and fragments
            href = href.split('?')[0].split('#')[0];
            const hrefFile = href.split('/').pop() || href;

            if (hrefFile === cleanCurrentPage) {

                link.classList.add('active');
                console.log('  ✅ Active added to:', hrefFile);

            } else {

                link.classList.remove('active');

            }

        });

        return true; // Success
    }

    // 2. Use MutationObserver to watch for injected nav
    function watchForNav() {

        console.log('👀 Watching for nav injection...');

        const observer = new MutationObserver(function(mutations) {

            // Check if any .nav-link a elements have been added
            const links = document.querySelectorAll('.nav-link a');
            if (links.length > 0) {

                console.log('✅ Nav detected! Applying highlight.');
                applyNavHighlight();
                observer.disconnect(); // Stop watching once we have the nav

            }

        });

        // Start observing the entire document for child additions
        observer.observe(document.body, {

            childList: true,
            subtree: true

        });

        // Fallback: try again after a short delay if observer doesn't fire
        setTimeout(function() {

            const links = document.querySelectorAll('.nav-link a');
            if (links.length === 0) {

                console.warn('⏱️ Nav not detected after timeout. Please check your injection script.');

            } else {

                applyNavHighlight();
                observer.disconnect();

            }

        }, 3000); // 3 second fallback

    }

    // 1. Try immediately (in case nav is already in DOM)
    if (document.readyState !== 'loading') {

        if (!applyNavHighlight()) {

            // If failed, wait for DOM changes
            watchForNav();

        }

    } else {

        document.addEventListener('DOMContentLoaded', function() {

            if (!applyNavHighlight()) {

                watchForNav();

            }

        });

    }

})();

// ============================================
// 3. PROFILE DROPDOWN TOGGLE (Dynamic)
// ============================================
(function() {

    console.log('🔍 Profile dropdown script loaded.');

    let profileInitialized = false;

    function initProfileDropdown() {

        // Prevent duplicate initialization
        if (profileInitialized) return;
        
        const profile = document.getElementById('user-profile');
        if (!profile) {

            console.warn('👤 #user-profile not found yet. Will retry.');
            return false; // Indicate failure

        }

        console.log('👤 Profile element found. Attaching listeners...');

        // Toggle dropdown on click
        profile.addEventListener('click', function(e) {

            e.stopPropagation();
            this.classList.toggle('active');
            console.log('Profile dropdown toggled:', this.classList.contains('active'));

        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {

            if (profile && !profile.contains(e.target)) {
                profile.classList.remove('active');
            }

        });

        profileInitialized = true;
        return true; // Success

    }

    // 1. Try immediately (in case profile is already in DOM)
    if (document.readyState !== 'loading') {

        if (!initProfileDropdown()) {
            watchForProfile();
        }

    } else {

        document.addEventListener('DOMContentLoaded', function() {
            if (!initProfileDropdown()) {
                watchForProfile();
            }
        });

    }

    // 2. Use MutationObserver to watch for injected profile
    function watchForProfile() {

        console.log('👀 Watching for #user-profile injection...');

        const observer = new MutationObserver(function(mutations) {
            const profile = document.getElementById('user-profile');
            if (profile) {

                console.log('✅ Profile detected! Initializing dropdown.');
                initProfileDropdown();
                observer.disconnect(); // Stop watching once we have the profile

            }

        });

        // Start observing the document body
        observer.observe(document.body, {

            childList: true,
            subtree: true

        });

        // Fallback: try again after a short delay
        setTimeout(function() {

            const profile = document.getElementById('user-profile');
            if (profile) {

                console.log('⏱️ Profile found via timeout.');
                initProfileDropdown();
                observer.disconnect();

            } else {

                console.warn('⏱️ Profile not detected after timeout.');

            }

        }, 3000);

    }

})();

// ============================================
// 4. AUTH OVERLAY – MUTATION OBSERVER (Safe)
// ============================================
(function() {

    console.log('🔍 Auth overlay controller loading...');

    let initialized = false;

    function initOverlay(backdropEl, closeBtnEl, contentEl) {

        if (initialized) return;
        initialized = true;

        console.log('✅ Initializing overlay...');

        function openAuthOverlay() {

            console.log('📂 Opening auth overlay...');
            backdropEl.classList.add('show');
            document.body.style.overflow = 'hidden';

        }

        function closeAuthOverlay() {

            console.log('📂 Closing auth overlay...');
            backdropEl.classList.remove('show');
            document.body.style.overflow = '';

        }

        window.openAuthOverlay = openAuthOverlay;
        window.closeAuthOverlay = closeAuthOverlay;

        closeBtnEl.addEventListener('click', closeAuthOverlay);
        backdropEl.addEventListener('click', function(e) {

            if (e.target === backdropEl) closeAuthOverlay();

        });

        document.addEventListener('keydown', function(e) {

            if (e.key === 'Escape' && backdropEl.classList.contains('show')) {

                closeAuthOverlay();

            }

        });

        document.addEventListener('click', function(e) {

            console.log('🖱️ Click detected on:', e.target);

            const link = e.target.closest('a[href*="login.html"], a[href*="register.html"]');

            if (!link) {
                console.log('   → Not a login/register link.');
                return;
            }    

            e.preventDefault();
            e.stopPropagation();
            openAuthOverlay();

        }, true);

        console.log('✅ Auth overlay ready.');

    }

    // ---- Try immediately ----
    function tryInit() {

        const backdrop = document.getElementById('authBackdrop') || document.querySelector('.auth-backdrop, #authBackdrop');
        const closeBtn = document.getElementById('authCloseBtn') || document.querySelector('.auth-close-btn, #authCloseBtn');
        const content = document.getElementById('authContent') || document.querySelector('.auth-content, #authContent');

        if (backdrop && closeBtn && content) {
            initOverlay(backdrop, closeBtn, content);
            return true;
        }

        return false;

    }

    if (!tryInit()) {

        console.log('⏳ Overlay not found yet. Setting up observer...');

        // ---- Wait for DOM to be ready before observing ----
        function startObserver() {

            if (!document.body) {

                // If body doesn't exist yet, wait for DOMContentLoaded
                document.addEventListener('DOMContentLoaded', startObserver);
                return;

            }

            const observer = new MutationObserver(function() {
                const backdrop = document.getElementById('authBackdrop') || document.querySelector('.auth-backdrop, #authBackdrop');
                const closeBtn = document.getElementById('authCloseBtn') || document.querySelector('.auth-close-btn, #authCloseBtn');
                const content = document.getElementById('authContent') || document.querySelector('.auth-content, #authContent');

                if (backdrop && closeBtn && content && !initialized) {

                    console.log('✅ Overlay detected via MutationObserver.');
                    observer.disconnect();
                    initOverlay(backdrop, closeBtn, content);

                }

            });

            // Safely observe the body
            observer.observe(document.body, { childList: true, subtree: true });
            console.log('👀 MutationObserver watching for overlay...');

            // Fallback timeout
            setTimeout(function() {
                
                if (!initialized) {
                    console.warn('⏱️ Overlay not found after timeout. Retrying...');
                    tryInit();
                    observer.disconnect();
                }

            }, 5000);

        }

        startObserver();

    }

})();

// ============================================
// 5. VIEW MANAGER – Supports Login/Register Success
// ============================================
/*
(function() {

    console.log('🔍 View manager loading...');

    function showAuthView(view, authStatus, businessName) {

        console.log(`📄 Showing view: ${view} (${authStatus || 'default'})`);

        const allViews = document.querySelectorAll('.auth-view');
        
        if (allViews.length === 0) {

            console.warn('⚠️ No .auth-view elements found. Retrying...');
            setTimeout(() => showAuthView(view, authStatus, businessName), 500);
            return;

        }

        // Hide all views
        allViews.forEach(el => {

            el.style.display = 'none';

        });

        // Show the target view
        const viewMap = {

            login: 'authViewLogin',
            register: 'authViewRegister',
            success: 'authViewSuccess',
            orderSuccess: 'authViewOrderSuccess',
            orderError: 'authViewOrderError'

        };

        const target = document.getElementById(viewMap[view]);
        if (target) {

            target.style.display = 'flex';
            console.log(`✅ Showing: ${target.id}`);

        } else {

            console.warn(`⚠️ View "${view}" not found.`);
            return;

        }

        // ---- If success view, show appropriate message ----
        if (view === 'success') {

            const loginElements = target.querySelectorAll('.login');
            const registerElements = target.querySelectorAll('.register');

            if (authStatus === 'login') {

                // Show login messages, hide register messages
                loginElements.forEach(el => el.style.display = 'flex');
                registerElements.forEach(el => el.style.display = 'none');
                console.log('✅ Showing login success message.');

            } else if (authStatus === 'register') {

                // Show register messages, hide login messages
                loginElements.forEach(el => el.style.display = 'none');
                registerElements.forEach(el => el.style.display = 'flex');
                console.log('✅ Showing registration success message.');

            }

            // Update business name
            if (businessName) {

                const nameEls = target.querySelectorAll('#successBusinessName');
                nameEls.forEach(el => {

                    el.innerHTML = `Welcome, <strong>${businessName}</strong>!`;

                });

                console.log(`✅ Updated business name to: ${businessName}`);

            }

            // Activate wholesale mode
            if (typeof window.toggleWholesaleMode === 'function') {

                window.toggleWholesaleMode(true);

            }

            localStorage.setItem('wholesaleMode', 'true');
            localStorage.setItem('businessName', businessName || 'Retailer');

        }

        // ---- Show order success ----
        window.showOrderSuccess = function(orderData) {

            // Update order details
            const orderNumber = document.getElementById('orderNumber');
            if (orderNumber) orderNumber.textContent = orderData.orderNumber || '#ORD-2026-001';
            
            const orderTotal = document.getElementById('orderTotal');
            if (orderTotal) orderTotal.textContent = orderData.total || '₦97,700';
            
            const orderDelivery = document.getElementById('orderDelivery');
            if (orderDelivery) orderDelivery.textContent = orderData.delivery || 'Lagos (Ikeja) – Express';
            
            const orderETA = document.getElementById('orderETA');
            if (orderETA) orderETA.textContent = orderData.eta || 'Today, 5:00 PM';
            
            const customerName = document.getElementById('orderCustomerName');
            if (customerName) customerName.textContent = orderData.customerName || 'Retailer';
            
            showAuthView('orderSuccess');

        };

        // ---- Show order error ----
        window.showOrderError = function(errorMessage) {

            const msgEl = document.getElementById('orderErrorMessage');
            if (msgEl) msgEl.textContent = errorMessage || 'Payment verification failed. Please try again.';
            showAuthView('orderError');

        };        

        // Open the overlay
        if (typeof window.openAuthOverlay === 'function') {

            window.openAuthOverlay();

        }

    }

    window.showAuthView = showAuthView;
    console.log('✅ View manager ready.');
    console.log('👉 Use showAuthView("login"), showAuthView("register"), showAuthView("success"), showAuthView("orderSuccess"), or showAuthView("orderError"), "login", "Adeola Foods")');

})();
*/

// ============================================
// VIEW MANAGER – Supports Login/Register + Order Success/Error
// ============================================
(function() {

    console.log('🔍 View manager loading...');

    // ---- Core show function ----
    function showAuthView(view, authStatus, businessName) {

        console.log(`📄 Showing view: ${view} (${authStatus || 'default'})`);

        const allViews = document.querySelectorAll('.auth-view');
        
        if (allViews.length === 0) {
            console.warn('⚠️ No .auth-view elements found. Retrying...');
            setTimeout(() => showAuthView(view, authStatus, businessName), 500);
            return;
        }

        // Hide all views
        allViews.forEach(el => {
            el.style.display = 'none';
        });

        // Show the target view
        const viewMap = {
            login: 'authViewLogin',
            register: 'authViewRegister',
            success: 'authViewSuccess',
            orderSuccess: 'authViewOrderSuccess',
            orderError: 'authViewOrderError'
        };

        const target = document.getElementById(viewMap[view]);
        if (target) {
            target.style.display = 'flex';
            console.log(`✅ Showing: ${target.id}`);
        } else {
            console.warn(`⚠️ View "${view}" not found.`);
            return;
        }

        // ---- If success view, show appropriate message ----
        if (view === 'success') {
            const loginElements = target.querySelectorAll('.login');
            const registerElements = target.querySelectorAll('.register');

            if (authStatus === 'login') {
                loginElements.forEach(el => el.style.display = 'flex');
                registerElements.forEach(el => el.style.display = 'none');
                console.log('✅ Showing login success message.');
            } else if (authStatus === 'register') {
                loginElements.forEach(el => el.style.display = 'none');
                registerElements.forEach(el => el.style.display = 'flex');
                console.log('✅ Showing registration success message.');
            }

            // Update business name
            if (businessName) {
                const nameEls = target.querySelectorAll('#successBusinessName');
                nameEls.forEach(el => {
                    el.innerHTML = `Welcome, <strong>${businessName}</strong>!`;
                });
                console.log(`✅ Updated business name to: ${businessName}`);
            }

            // Activate wholesale mode
            if (typeof window.toggleWholesaleMode === 'function') {
                window.toggleWholesaleMode(true);
            }

            localStorage.setItem('wholesaleMode', 'true');
            localStorage.setItem('businessName', businessName || 'Retailer');
        }

        // ---- Ensure overlay is opened ----
        if (typeof window.openAuthOverlay === 'function') {
            window.openAuthOverlay();
        } else {
            // Fallback: manually open overlay
            console.warn('⚠️ openAuthOverlay not defined – using fallback.');
            const backdrop = document.getElementById('authBackdrop');
            if (backdrop) {
                backdrop.style.display = 'flex';
                backdrop.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
            const content = document.getElementById('authContent');
            if (content) {
                content.style.display = 'block';
                content.style.visibility = 'visible';
                content.style.opacity = '1';
            }
        }

    }

    // ---- ORDER SUCCESS (Now globally accessible) ----
    window.showOrderSuccess = function(orderData) {
        console.log('🎉 showOrderSuccess called:', orderData);

        // Update order details
        const orderNumber = document.getElementById('orderNumber');
        if (orderNumber) orderNumber.textContent = orderData.orderNumber || '#ORD-2026-001';
        
        const orderTotal = document.getElementById('orderTotal');
        if (orderTotal) orderTotal.textContent = orderData.total || '₦97,700';
        
        const orderDelivery = document.getElementById('orderDelivery');
        if (orderDelivery) orderDelivery.textContent = orderData.delivery || 'Lagos (Ikeja) – Express';
        
        const orderETA = document.getElementById('orderETA');
        if (orderETA) orderETA.textContent = orderData.eta || 'Today, 5:00 PM';
        
        const customerName = document.getElementById('orderCustomerName');
        if (customerName) customerName.textContent = orderData.customerName || 'Retailer';
        
        // Show the view
        showAuthView('orderSuccess');
    };

    // ---- ORDER ERROR (Now globally accessible) ----
    window.showOrderError = function(errorMessage) {
        console.log('❌ showOrderError called:', errorMessage);

        const msgEl = document.getElementById('orderErrorMessage');
        if (msgEl) msgEl.textContent = errorMessage || 'Payment verification failed. Please try again.';
        
        // Show the view
        showAuthView('orderError');
    };

    // ---- Expose showAuthView globally ----
    window.showAuthView = showAuthView;

    console.log('✅ View manager ready.');
    console.log('👉 Use showAuthView("login"), showAuthView("register"), showAuthView("success", "login", "Adeola Foods")');
    console.log('👉 Use showOrderSuccess({ orderNumber: "...", total: "...", ... })');
    console.log('👉 Use showOrderError("Error message")');

})();

// ============================================
// 6. UNIFIED CLICK HANDLER – Intercept all login/register links
// ============================================
(function() {

    console.log('🔍 Unified click handler loading...');

    document.addEventListener('click', function(e) {

        // 1. Check if the clicked element (or parent) is a login/register link
        const link = e.target.closest('a[href*="login"], a[href*="register"], .login-btn, .register-btn, .switch-view, [data-auth="login"], [data-auth="register"]');
        if (!link) return;

        // 2. Determine which view to show
        let view = null;
        if (link.dataset.view) {

            view = link.dataset.view; // .switch-view or data-view

        } else if (link.getAttribute('href') && link.getAttribute('href').includes('login')) {

            view = 'login';

        } else if (link.getAttribute('href') && link.getAttribute('href').includes('register')) {

            view = 'register';

        } else if (link.classList.contains('login-btn') || link.id === 'simulateLoginBtn') {

            view = 'login';

        } else if (link.classList.contains('register-btn') || link.id === 'simulateRegisterBtn') {

            view = 'register';

        }

        if (!view) return;

        // 3. Prevent navigation
        e.preventDefault();
        e.stopPropagation();

        // 4. Show the view
        console.log(`🔗 Intercepted link (${view}):`, link);
        if (typeof window.showAuthView === 'function') {

            window.showAuthView(view);

        } else {

            console.warn('⚠️ showAuthView not defined!');

        }

    }, true); // <-- Capturing phase ensures this runs before other handlers

    console.log('✅ Unified click handler ready.');
    console.log('👉 All login/register links will now open the overlay with the correct view.');

})();

// ============================================
// 7. FORM HANDLER – Updated
// ============================================
(function() {

    console.log('🔍 Form handler loading...');

    // ---- Form Submissions ----
    document.addEventListener('submit', function(e) {
        console.log('🖱️ Submit event captured:', e.target.id);
        if (e.target.id === 'auth-login-form') {
            e.preventDefault();
            console.log('🔐 Login submitted.');
            if (typeof window.showAuthView === 'function') {
                window.showAuthView('success', 'login', 'Adeola Foods');
            }
        } else if (e.target.id === 'auth-register-form') {
            e.preventDefault();
            const bizInput = e.target.querySelector('input[placeholder*="Business Name"]');
            const bizName = bizInput ? bizInput.value : 'Retailer';
            console.log('📝 Registration submitted.');
            if (typeof window.showAuthView === 'function') {
                window.showAuthView('success', 'register', bizName);
            }
        }
    }, true);

    // ---- View Switching ----
    document.addEventListener('click', function(e) {
        const switchLink = e.target.closest('.switch-view');
        if (switchLink) {
            e.preventDefault();
            e.stopPropagation();
            const view = switchLink.dataset.view;
            console.log(`🔄 Switch link clicked → view: ${view}`);
            if (view && typeof window.showAuthView === 'function') {
                window.showAuthView(view);
            }
        }
    }, true);

    console.log('✅ Form handler ready.');

})();

// ============================================
// 8. SUCCESS HANDLERS – Updated
// ============================================
(function() {

    console.log('🔍 Success handlers loading...');

    window.handleSuccessStartShopping = function() {
        if (typeof window.closeAuthOverlay === 'function') {
            window.closeAuthOverlay();
        }
        window.location.href = 'shop.html';
    };

    window.handleSuccessDashboard = function() {
        if (typeof window.closeAuthOverlay === 'function') {
            window.closeAuthOverlay();
        }
        alert('📊 Dashboard page coming soon!');
        window.location.href = 'index.html';
    };

    window.handleSuccessRedirect = function() {

        // Stay on the current page
        if (typeof window.closeAuthOverlay === 'function') {
            window.closeAuthOverlay();
        }
        
        // No reload needed – wholesale mode is already active
        console.log('✅ Redirect complete – staying on current page with wholesale prices.');

    };

    window.handleSuccessLogout = function() {

        if (typeof window.closeAuthOverlay === 'function') {
            window.closeAuthOverlay();
        }
        if (typeof window.toggleWholesaleMode === 'function') {
            window.toggleWholesaleMode(false);
        }
        localStorage.removeItem('wholesaleMode');
        localStorage.removeItem('businessName');
        window.location.href = 'index.html';

    };

    console.log('✅ Success handlers ready.');

})();

// ============================================
// 9. ORDER HANDLERS
// ============================================
(function() {

    window.handleOrderContinueShopping = function() {

        if (typeof window.closeAuthOverlay === 'function') {

            window.closeAuthOverlay();

        }

        window.location.href = 'shop.html';

    };

    window.handleOrderViewHistory = function() {

        if (typeof window.closeAuthOverlay === 'function') {

            window.closeAuthOverlay();

        }

        alert('📊 Orders page coming soon!');
        window.location.href = 'index.html';

    };

    window.handleOrderDownloadInvoice = function() {

        alert('📄 Invoice download coming soon!');

    };

    window.handleOrderRetry = function() {

        if (typeof window.closeAuthOverlay === 'function') {

            window.closeAuthOverlay();

        }

        // Return to checkout
        window.location.href = 'checkout.html';

    };

    window.handleOrderContactSupport = function() {

        alert('📞 Support: support@foodcart.com | +234 800 123 4567');

    };

    window.handleOrderReturnToCart = function() {

        if (typeof window.closeAuthOverlay === 'function') {

            window.closeAuthOverlay();

        }

        window.location.href = 'cart.html';

    };

    console.log('✅ Order handlers ready.');

})();

// ============================================
// 11. WHOLESALE MODE TOGGLE (Event-Driven)
// ============================================
(function() {

    console.log('🔍 Wholesale mode controller loading...');

    let isWholesale = false;

    function getElements() {
        return {
            logoutDisplay: document.getElementById('logoutDisplay'),
            businessNameDisplay: document.getElementById('businessNameDisplay'),
            logoutBtn: document.getElementById('logoutBtn'),
            profile: document.getElementById('user-profile')
        };
    }

    window.handleLogout = function() {
        console.log('🔓 Logout called.');
        if (typeof window.toggleWholesaleMode === 'function') {
            window.toggleWholesaleMode(false);
        }
        const profile = document.getElementById('user-profile');
        if (profile) profile.style.display = 'block';
        if (typeof window.closeAuthOverlay === 'function') {
            window.closeAuthOverlay();
        }
        console.log('✅ Logout complete – retail mode restored.');
    };

    // ---- Toggle wholesale mode ----
    window.toggleWholesaleMode = function(enable, businessName) {

        isWholesale = enable;
        window.isWholesaleActive = enable;

        console.log(`🔄 ${enable ? 'ENABLING' : 'DISABLING'} wholesale mode...`);

        const els = getElements();

        // Toggle price displays
        document.querySelectorAll('.price.retail, .wholesale-prompt, .proposition-cta, .proposition-divider, .select.retail, .variant-unit-price.retail, .qty-count.retail, .stock-retail, .delivery-note.retail')
            .forEach(el => el.style.display = enable ? 'none' : 'flex');

        document.querySelectorAll('.price.wholesale, select.wholesale, .variant-unit-price.wholesale, .qty-count.wholesale, .stock-wholesale, .moq, .delivery-note.wholesale')
            .forEach(el => el.style.display = enable ? 'flex' : 'none');

        // Toggle badges
        document.querySelectorAll('.badge-orange').forEach(el => {
            el.textContent = enable ? 'Wholesale Price' : 'Retail Price';
            el.className = enable ? 'badge-green' : 'badge-orange';
        });

        // Toggle logout display
        if (els.logoutDisplay) {
            els.logoutDisplay.style.display = enable ? 'flex' : 'none';
        }

        // Toggle profile dropdown
        if (els.profile) {
            els.profile.style.display = enable ? 'none' : 'block';
        }

        // Update cart badge
        const cartBadge = document.querySelector('.cart-badge');
        if (cartBadge) {

            cartBadge.textContent = enable ? 'W' : '2';
            cartBadge.style.background = enable ? '#16a34a' : '#f59e0b';

        }

        // Update hero tags
        const heroCols = document.querySelectorAll('.hero-col .tag');
        if (heroCols.length >= 2) {
            if (enable) {
                heroCols[0].textContent = '👋 WELCOME BACK';
                heroCols[0].style.background = '#16a34a';
                heroCols[1].textContent = '📦 WHOLESALE ACTIVE';
                heroCols[1].style.background = '#f59e0b';
                heroCols[1].style.color = '#0f172a';
            } else {
                heroCols[0].textContent = 'RETAIL';
                heroCols[0].style.background = '#16a34a';
                heroCols[1].textContent = 'B2B WHOLESALE';
                heroCols[1].style.background = '#f59e0b';
                heroCols[1].style.color = '#0f172a';
            }
        }

        // Update business name
        if (enable && els.businessNameDisplay) {
            const name = businessName || localStorage.getItem('businessName') || 'Retailer';
            els.businessNameDisplay.textContent = name;
        } else if (!enable && els.businessNameDisplay) {
            els.businessNameDisplay.textContent = 'Retailer';
        }

        // Store state
        if (enable) {
            localStorage.setItem('wholesaleMode', 'true');
            if (businessName) localStorage.setItem('businessName', businessName);
        } else {
            localStorage.removeItem('wholesaleMode');
            localStorage.removeItem('businessName');
        }

        // Dispatch event for cart and other modules
        document.dispatchEvent(new CustomEvent('wholesaleModeChanged', {
            detail: { enabled: enable, businessName: businessName || '' }
        }));

        console.log(`✅ Switched to ${enable ? 'WHOLESALE' : 'RETAIL'} mode.`);
    };


    // ---- Restore wholesale mode from localStorage ----
    if (localStorage.getItem('wholesaleMode') === 'true') {
        const name = localStorage.getItem('businessName') || 'Retailer';
        function applyRestore() {
            const els = getElements();
            if (els.businessNameDisplay) {
                els.businessNameDisplay.textContent = name;
                window.toggleWholesaleMode(true);
                console.log('✅ Restored wholesale mode from localStorage.');
            } else {
                console.log('⏳ Waiting for header to be injected...');
                setTimeout(applyRestore, 200);
            }
        }
        applyRestore();
    }

    // ---- Attach logout listener ----
    function attachLogoutListener() {
        const els = getElements();
        if (els.logoutBtn && !els.logoutBtn._listenerAttached) {
            els.logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔓 Logout button clicked.');
                window.toggleWholesaleMode(false);
                const profile = document.getElementById('user-profile');
                if (profile) profile.style.display = 'block';
                if (typeof window.closeAuthOverlay === 'function') {
                    window.closeAuthOverlay();
                }
                window.location.reload();
            });
            els.logoutBtn._listenerAttached = true;
            console.log('✅ Logout button handler attached.');
            return true;
        }
        return false;
    }

    if (!attachLogoutListener()) {
        const observer = new MutationObserver(function() {
            if (attachLogoutListener()) {
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        console.log('👀 Watching for logout button to appear...');
    }

    window.isWholesaleActive = function() {
        return isWholesale;
    };

    console.log('✅ Wholesale mode controller ready.');
    console.log('👉 Use toggleWholesaleMode(true/false, "BusinessName") to control it.');

})();

/*
(function() {
    console.log('🔍 Wholesale mode controller loading...');

    let isWholesale = false;

    function getElements() {
        return {
            logoutDisplay: document.getElementById('logoutDisplay'),
            businessNameDisplay: document.getElementById('businessNameDisplay'),
            logoutBtn: document.getElementById('logoutBtn'),
            profile: document.getElementById('user-profile')
        };
    }

    window.handleLogout = function() {
        console.log('🔓 Logout called.');
        if (typeof window.toggleWholesaleMode === 'function') {
            window.toggleWholesaleMode(false);
        }
        const profile = document.getElementById('user-profile');
        if (profile) profile.style.display = 'block';
        if (typeof window.closeAuthOverlay === 'function') {
            window.closeAuthOverlay();
        }
        console.log('✅ Logout complete – retail mode restored.');
    };

    // ---- Toggle wholesale mode ----
    window.toggleWholesaleMode = function(enable, businessName) {

        isWholesale = !!enable;

        console.log(`🔄 ${enable ? 'ENABLING' : 'DISABLING'} wholesale mode...`);

        const els = getElements();

        // 1. Toggle price & unit displays
        document.querySelectorAll('.price.retail, .wholesale-prompt, .proposition-cta, .proposition-divider, .select.retail, .variant-unit-price.retail, .qty-count.retail, .stock-retail, .delivery-note.retail')
            .forEach(el => el.style.display = enable ? 'none' : 'flex');

        document.querySelectorAll('.price.wholesale, select.wholesale, .variant-unit-price.wholesale, .qty-count.wholesale, .stock-wholesale, .moq, .delivery-note.wholesale')
            .forEach(el => el.style.display = enable ? 'flex' : 'none');

        // 2. Toggle badges
        document.querySelectorAll('.badge-orange').forEach(el => {
            el.textContent = enable ? 'Wholesale Price' : 'Retail Price';
            el.className = enable ? 'badge-green' : 'badge-orange';
        });

        // 3. Toggle account header displays
        if (els.logoutDisplay) {
            els.logoutDisplay.style.display = enable ? 'flex' : 'none';
        }

        if (els.profile) {
            els.profile.style.display = enable ? 'none' : 'block';
        }

        // 4. Update Hero View Container State cleanly
        if (typeof window.setHeroView === 'function') {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || enable;
            if (!isLoggedIn) {
                window.setHeroView('guest');
            } else if (enable) {
                window.setHeroView('wholesale');
            } else {
                window.setHeroView('retail');
            }
        }

        // 5. Update business name
        if (enable && els.businessNameDisplay) {
            const name = businessName || localStorage.getItem('businessName') || 'Retailer';
            els.businessNameDisplay.textContent = name;
        } else if (!enable && els.businessNameDisplay) {
            els.businessNameDisplay.textContent = 'Retailer';
        }

        // 6. Store state locally
        if (enable) {
            localStorage.setItem('wholesaleMode', 'true');
            if (businessName) localStorage.setItem('businessName', businessName);
        } else {
            localStorage.removeItem('wholesaleMode');
            localStorage.removeItem('businessName');
        }

        // 7. Dispatch event for cart badge and other subscriber modules
        document.dispatchEvent(new CustomEvent('wholesaleModeChanged', {
            detail: { enabled: enable, businessName: businessName || '' }
        }));

        console.log(`✅ Switched to ${enable ? 'WHOLESALE' : 'RETAIL'} mode.`);
    };

    // ---- Restore wholesale mode from localStorage ----
    if (localStorage.getItem('wholesaleMode') === 'true') {
        const name = localStorage.getItem('businessName') || 'Retailer';
        function applyRestore() {
            const els = getElements();
            if (els.businessNameDisplay) {
                els.businessNameDisplay.textContent = name;
                window.toggleWholesaleMode(true, name);
                console.log('✅ Restored wholesale mode from localStorage.');
            } else {
                console.log('⏳ Waiting for header to be injected...');
                setTimeout(applyRestore, 200);
            }
        }
        applyRestore();
    }

    // ---- Attach logout listener ----
    function attachLogoutListener() {
        const els = getElements();
        if (els.logoutBtn && !els.logoutBtn._listenerAttached) {
            els.logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔓 Logout button clicked.');
                window.toggleWholesaleMode(false);
                const profile = document.getElementById('user-profile');
                if (profile) profile.style.display = 'block';
                if (typeof window.closeAuthOverlay === 'function') {
                    window.closeAuthOverlay();
                }
                window.location.reload();
            });
            els.logoutBtn._listenerAttached = true;
            console.log('✅ Logout button handler attached.');
            return true;
        }
        return false;
    }

    if (!attachLogoutListener()) {
        const observer = new MutationObserver(function() {
            if (attachLogoutListener()) {
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        console.log('👀 Watching for logout button to appear...');
    }

    // Global Safe State Getter
    window.isWholesaleActive = function() {
        return isWholesale;
    };

    console.log('✅ Wholesale mode controller ready.');
    console.log('👉 Use toggleWholesaleMode(true/false, "BusinessName") to control it.');
})();
*/

window.setHeroView = function(mode) {
    // Hide all hero views first
    const views = document.querySelectorAll('.hero-view');
    views.forEach(view => {
        view.classList.remove('show');
        view.classList.add('hide');
    });

    // Show only the targeted view container
    const targetView = document.getElementById(`hero-${mode}-view`);
    if (targetView) {
        targetView.classList.remove('hide');
        targetView.classList.add('show');
    }
};

// ============================================
// 10. CHECKOUT VALIDATION & ORDER TRIGGER (Direct Activation)
// ============================================
(function() {

    console.log('🔍 Checkout validation loading...');

    // Use event delegation for submit
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.id !== 'checkout-form') return;

        e.preventDefault();

        console.log('📦 Validating checkout form...');

        const name = document.getElementById('checkout-name').value.trim();
        const phone = document.getElementById('checkout-phone').value.trim();
        const email = document.getElementById('checkout-email').value.trim();
        const address = document.getElementById('checkout-address').value.trim();
        const lga = document.getElementById('checkout-lga').value;
        const payment = document.getElementById('checkout-payment').value;

        const errors = [];
        if (!name) errors.push('Full Name is required.');
        if (!phone) errors.push('Phone Number is required.');
        if (!email) errors.push('Email Address is required.');
        if (!address) errors.push('Delivery Address is required.');
        if (!lga) errors.push('Please select a valid Local Government Area (LGA).');

        if (phone && !/^0[789][01]\d{8}$/.test(phone)) {
            errors.push('Phone number must be a valid Nigerian number (e.g., 08012345678).');
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Please enter a valid email address.');
        }

        if (errors.length > 0) {
            const errorMessage = '❌ ' + errors[0];
            console.warn('Validation errors:', errors);
            if (typeof window.showOrderError === 'function') {
                window.showOrderError(errorMessage);
            } else {
                alert(errorMessage);
            }
        } else {
            console.log('✅ All fields valid. Processing order...');
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = '⏳ Processing...';
                submitBtn.disabled = true;
            }

            setTimeout(function() {
                if (submitBtn) {
                    submitBtn.textContent = '🛒 Place Order';
                    submitBtn.disabled = false;
                }

                const orderData = {
                    orderNumber: '#ORD-' + Date.now(),
                    total: '₦97,700',
                    delivery: lga + ' – ' + (payment === 'cod' ? 'Cash on Delivery' : 'Prepaid'),
                    eta: 'Today, 5:00 PM',
                    customerName: name
                };

                // ---- 1. Show order success view ----
                if (typeof window.showOrderSuccess === 'function') {
                    window.showOrderSuccess(orderData);
                } else {
                    alert('✅ Order placed successfully!');
                }

                // ---- 2. Activate wholesale mode directly (if not already) ----
                if (typeof window.toggleWholesaleMode === 'function') {
                    // Check if already wholesale to avoid double toggle
                    const isWholesale = localStorage.getItem('wholesaleMode') === 'true';
                    if (!isWholesale) {
                        window.toggleWholesaleMode(true, name);
                    }
                }

                // ---- 3. Optionally dispatch event for other modules (cart, etc.) ----
                document.dispatchEvent(new CustomEvent('orderPlaced', {
                    detail: {
                        success: true,
                        orderData: orderData,
                        customerName: name
                    }
                }));

            }, 1500);
        }
    });

    console.log('✅ Checkout validation ready (direct activation).');

})();

// ============================================
// PRODUCT CATALOG – Static Data for Mockup
// ============================================
const productCatalog = {
    // Rice
    'RICE-5KG':    { name: 'NutraGold Rice (5kg)', retailPrice: 7000, wholesalePrice: 6800 },
    'RICE-10KG':   { name: 'NutraGold Rice (10kg)', retailPrice: 13000, wholesalePrice: 12000 },
    'RICE-25KG':   { name: 'NutraGold Rice (25kg)', retailPrice: 29000, wholesalePrice: 26000 },
    'RICE-50KG':   { name: 'NutraGold Rice (50kg)', retailPrice: 59000, wholesalePrice: 52000 },

    // Beans – Honey
    'BEANS-HONEY-5KG':    { name: 'Honey Beans (5kg)', retailPrice: 11000, wholesalePrice: 10000 },
    'BEANS-HONEY-10KG':   { name: 'Honey Beans (10kg)', retailPrice: 21000, wholesalePrice: 19000 },
    'BEANS-HONEY-25KG':   { name: 'Honey Beans (25kg)', retailPrice: 49000, wholesalePrice: 45000 },
    'BEANS-HONEY-JUMBO':  { name: 'Honey Beans (Jumbo)', retailPrice: 83000, wholesalePrice: 76000 },

    // Beans – Brown
    'BEANS-BROWN-5KG':    { name: 'Brown Beans (5kg)', retailPrice: 10000, wholesalePrice: 9200 },
    'BEANS-BROWN-10KG':   { name: 'Brown Beans (10kg)', retailPrice: 19000, wholesalePrice: 17500 },
    'BEANS-BROWN-25KG':   { name: 'Brown Beans (25kg)', retailPrice: 45000, wholesalePrice: 42000 },
    'BEANS-BROWN-JUMBO':  { name: 'Brown Beans (Jumbo)', retailPrice: 72000, wholesalePrice: 66000 },

    // Garri – Premium
    'GARRI-PREMIUM-5KG':   { name: 'Premium Garri (5kg)', retailPrice: 7000, wholesalePrice: 6500 },
    'GARRI-PREMIUM-10KG':  { name: 'Premium Garri (10kg)', retailPrice: 13000, wholesalePrice: 12000 },
    'GARRI-PREMIUM-25KG':  { name: 'Premium Garri (25kg)', retailPrice: 34000, wholesalePrice: 31000 },
    'GARRI-PREMIUM-JUMBO': { name: 'Premium Garri (Jumbo)', retailPrice: 70000, wholesalePrice: 64000 },

    // Garri – Standard
    'GARRI-STANDARD-5KG':   { name: 'Standard Garri (5kg)', retailPrice: 5000, wholesalePrice: 4600 },
    'GARRI-STANDARD-10KG':  { name: 'Standard Garri (10kg)', retailPrice: 9000, wholesalePrice: 8200 },
    'GARRI-STANDARD-25KG':  { name: 'Standard Garri (25kg)', retailPrice: 18000, wholesalePrice: 16500 },
    'GARRI-STANDARD-JUMBO': { name: 'Standard Garri (Jumbo)', retailPrice: 40000, wholesalePrice: 36500 },
};

// ============================================
// CART LOGIC – Simple Shopping Cart
// ============================================
(function() {

    console.log('🛒 Cart controller loading...');

    // ---- Cart data ----
    let cart = [];

    // ---- Load cart from localStorage ----
    function loadCart() {

        const stored = localStorage.getItem('foodcart_cart');
        if (stored) {

            try {

                cart = JSON.parse(stored);
                console.log('📦 Cart loaded from localStorage:', cart);

            } catch (e) {

                cart = [];

            }
        } else {

            cart = [];

        }

        return cart;

    }

    // ---- Save cart to localStorage ----
    function saveCart() {

        localStorage.setItem('foodcart_cart', JSON.stringify(cart));
        updateCartBadge();

    }

    // ---- Get current cart ----
    window.getCart = function() {
        return cart;
    };

    // ---- Get cart count ----
    window.getCartCount = function() {

        return cart.reduce((total, item) => total + item.quantity, 0);

    };

    // ---- Get cart total (respects wholesale mode) ----
    window.getCartTotal = function() {
        
        const isWholesale = localStorage.getItem('wholesaleMode') === 'true';

        return cart.reduce((total, item) => {

            const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
            return total + (price * item.quantity);

        }, 0);
        
    };

    // ---- Add item to cart ----
    window.addToCart = function(sku, name, retailPrice, wholesalePrice, quantity, image) {
        quantity = quantity || 1;
        wholesalePrice = wholesalePrice || retailPrice; // fallback

        console.log(`🛒 Adding to cart: ${name} (${sku}) x ${quantity}`);

        // Check if item already exists
        const existing = cart.find(item => item.sku === sku);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({
                sku: sku,
                name: name,
                retailPrice: parseFloat(retailPrice),
                wholesalePrice: parseFloat(wholesalePrice),
                quantity: quantity,
                image: image || ''
            });
        }

        saveCart();
        updateCartBadge();
        console.log('📦 Cart updated:', cart);
        return cart;
    };

    // ---- Remove item from cart ----
    window.removeFromCart = function(sku) {
        cart = cart.filter(item => item.sku !== sku);
        saveCart();
        updateCartBadge();
        console.log('🗑️ Removed item:', sku);
        return cart;
    };

    // ---- Update quantity ----
    window.updateCartQuantity = function(sku, quantity) {
        const item = cart.find(item => item.sku === sku);
        if (!item) return;
        if (quantity <= 0) {
            window.removeFromCart(sku);
            return;
        }
        item.quantity = quantity;
        saveCart();
        updateCartBadge();
        console.log('🔄 Updated quantity for:', sku, quantity);
        return cart;
    };

    // ---- Clear cart ----
    window.clearCart = function() {
        cart = [];
        saveCart();
        updateCartBadge();
        console.log('🗑️ Cart cleared.');
        return cart;
    };

    // ---- Update cart badge ----
    function updateCartBadge() {
        const count = window.getCartCount();
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            badge.textContent = count;
            // If wholesale mode, also show W?
            const isWholesale = localStorage.getItem('wholesaleMode') === 'true';
            badge.style.background = isWholesale ? '#16a34a' : '#f59e0b';
        }
    }

    // ---- Recalculate cart when wholesale mode changes ----
    // Hook into toggleWholesaleMode if available
    /*
    const originalToggle = window.toggleWholesaleMode;
    if (originalToggle) {
        window.toggleWholesaleMode = function(enable, businessName) {
            originalToggle(enable, businessName);
            // Update cart badge and any visible cart prices
            updateCartBadge();
            // If on cart page, re-render
            if (document.getElementById('cart-items')) {
                renderCartPage();
            }
        };
    }*/

    // ---- Recalculate cart when wholesale mode changes ----
    document.addEventListener('wholesaleModeChanged', function(e) {
        const isWholesale = e.detail.enabled;
        console.log('🛒 Wholesale mode changed, updating cart...');
        updateCartBadge();
        if (document.getElementById('cart-items')) {
            renderCartPage();
        }
    });

    // ---- Render cart page (for cart.html) ----
    window.renderCartPage = function() {
        const container = document.getElementById('cart-items');
        if (!container) return;

        const isWholesale = localStorage.getItem('wholesaleMode') === 'true';
        const items = window.getCart();
        const total = window.getCartTotal();

        if (items.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding:40px;">🛒 Your cart is empty.</p>`;
            return;
        }

        let html = `
            <table style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:2px solid #e2e8f0;">
                        <th style="text-align:left; padding:8px;">Product</th>
                        <th style="text-align:left; padding:8px;">Price</th>
                        <th style="text-align:left; padding:8px;">Qty</th>
                        <th style="text-align:left; padding:8px;">Subtotal</th>
                        <th style="text-align:left; padding:8px;"></th>
                    </tr>
                </thead>
                <tbody>
        `;

        items.forEach(item => {
            const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
            const subtotal = price * item.quantity;
            const retailDisplay = isWholesale ? `<span style="text-decoration:line-through; color:#94a3b8; font-size:0.85rem;">₦${item.retailPrice}</span> ` : '';
            html += `
                <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:12px 8px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            ${item.image ? `<img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;">` : '<span style="font-size:1.5rem;">📦</span>'}
                            <span>${item.name}</span>
                        </div>
                    </td>
                    <td style="padding:12px 8px;">
                        ${retailDisplay} ₦${price}
                    </td>
                    <td style="padding:12px 8px;">
                        <div style="display:flex; align-items:center; gap:4px;">
                            <button onclick="window.updateCartQuantity('${item.sku}', ${item.quantity - 1})" style="padding:4px 10px; border:1px solid #e2e8f0; border-radius:4px; background:white; cursor:pointer;">−</button>
                            <span style="min-width:30px; text-align:center;">${item.quantity}</span>
                            <button onclick="window.updateCartQuantity('${item.sku}', ${item.quantity + 1})" style="padding:4px 10px; border:1px solid #e2e8f0; border-radius:4px; background:white; cursor:pointer;">+</button>
                        </div>
                    </td>
                    <td style="padding:12px 8px;">₦${subtotal}</td>
                    <td style="padding:12px 8px;">
                        <button onclick="window.removeFromCart('${item.sku}'); window.renderCartPage();" style="background:none; border:none; color:#dc2626; cursor:pointer;">✕</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            <div style="text-align:right; margin-top:20px; font-size:1.2rem; font-weight:700;">
                Total: ₦${total}
            </div>
            <div style="margin-top:20px; display:flex; gap:12px; justify-content:flex-end;">
                <button onclick="window.clearCart(); window.renderCartPage();" class="btn btn-outline" style="padding:8px 20px; border:2px solid #0f172a; background:transparent; border-radius:6px; cursor:pointer;">Clear Cart</button>
                <a href="checkout.html" class="btn btn-green" style="padding:8px 20px; background:#16a34a; color:white; border-radius:6px; text-decoration:none;">Proceed to Checkout →</a>
            </div>
        `;

        container.innerHTML = html;
    };

    // ---- Expose helpers for PDP/Product cards ----
    window.addToCartFromElement = function(element) {
        const sku = element.dataset.sku;
        const name = element.dataset.name;
        const retailPrice = parseFloat(element.dataset.retailPrice);
        const wholesalePrice = parseFloat(element.dataset.wholesalePrice) || retailPrice;
        const quantity = parseInt(element.dataset.quantity) || 1;
        const image = element.dataset.image || '';
        window.addToCart(sku, name, retailPrice, wholesalePrice, quantity, image);
        // Visual feedback
        const originalText = element.textContent;
        element.textContent = '✅ Added!';
        element.style.background = '#16a34a';
        setTimeout(() => {
            element.textContent = originalText;
            element.style.background = '';
        }, 1500);
    };

    // ---- Load cart on startup ----
    loadCart();
    updateCartBadge();

    // ---- If on cart page, render ----
    if (document.getElementById('cart-items')) {
        renderCartPage();
    }

    console.log('✅ Cart controller ready.');
    console.log('👉 Use addToCart(sku, name, retailPrice, wholesalePrice, quantity)');
    console.log('👉 Use getCart(), removeFromCart(sku), clearCart()');

})();

// ---- Helper to get product data by SKU ----
window.getProductBySku = function(sku) {
    return productCatalog[sku] || null;
};

console.log('✅ mockup.js loaded successfully.');
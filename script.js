document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header Animation
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const menuBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            console.log('Mobile menu toggled');
        });

        // Close menu when clicking a link
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // 3. Simple Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply reveal classes to sections
    const revealSections = document.querySelectorAll('.product-card, .category-card, .location-card, .cta-inner, .testimonial-card');
    revealSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    });

    // Custom Observer Callback logic (manually applying visibility style)
    const customObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    revealSections.forEach(el => customObserver.observe(el));

    // Toast Notification helper function
    function showToast(message) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span class="toast-icon">✓</span>
            <span class="toast-message">${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 3000);
    }

    // 4. Shopping Cart State and Interactions
    let cart = [];
    try {
        const savedCart = localStorage.getItem('mayago_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (e) {
        console.error('Error loading cart from localStorage', e);
    }

    const floatingCart = document.getElementById('floating-cart');
    const cartSummaryTrigger = document.getElementById('cart-summary-trigger');
    const cartCountEl = document.getElementById('cart-count');
    const cartTotalEl = document.getElementById('cart-total');
    
    // Modal Elements
    const cartModal = document.getElementById('cart-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartSuggestions = document.getElementById('cart-suggestions');
    const modalSubtotal = document.getElementById('modal-subtotal');
    const modalTotal = document.getElementById('modal-total');
    const modalCheckoutBtn = document.getElementById('modal-checkout-btn');
    const modalWhatsappBtn = document.getElementById('modal-whatsapp-btn');
    
    // WhatsApp Floating Button Elements
    const whatsappFloatBtn = document.getElementById('whatsapp-float-btn');
    const whatsappBadge = document.getElementById('whatsapp-badge');

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Save to localStorage
        try {
            localStorage.setItem('mayago_cart', JSON.stringify(cart));
        } catch (e) {
            console.error('Error saving cart to localStorage', e);
        }

        // Update floating bar
        if (totalItems > 0) {
            floatingCart.classList.remove('hidden');
            cartCountEl.innerText = `${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'}`;
            cartTotalEl.innerText = `Total: $${totalPrice.toFixed(2)}`;
        } else {
            floatingCart.classList.add('hidden');
            closeModal();
        }

        // Update WhatsApp floating button state
        if (whatsappBadge) {
            if (totalItems > 0) {
                whatsappBadge.innerText = totalItems;
                whatsappBadge.classList.remove('hidden');
                if (whatsappFloatBtn) {
                    whatsappFloatBtn.classList.add('cart-active');
                }
            } else {
                whatsappBadge.classList.add('hidden');
                if (whatsappFloatBtn) {
                    whatsappFloatBtn.classList.remove('cart-active');
                }
            }
        }

        // Update Modal elements if open
        renderModalItems();
    }

    function renderModalItems() {
        if (!cartItemsList) return;

        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <div class="empty-cart-message">
                    <span class="empty-cart-icon">🛒</span>
                    <p>Tu carrito está vacío.</p>
                    <p><small>¡Agrega deliciosos pollos de nuestro menú!</small></p>
                </div>
            `;
            if (modalSubtotal) modalSubtotal.innerText = '$0.00';
            if (modalTotal) modalTotal.innerText = '$0.00';
            if (modalCheckoutBtn) modalCheckoutBtn.disabled = true;
            if (modalWhatsappBtn) modalWhatsappBtn.disabled = true;
            if (cartSuggestions) cartSuggestions.innerHTML = '';
            return;
        }

        if (modalCheckoutBtn) modalCheckoutBtn.disabled = false;
        if (modalWhatsappBtn) modalWhatsappBtn.disabled = false;

        let listHTML = '';
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            listHTML += `
                <div class="cart-item-row" data-index="${index}">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)} c/u</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn dec-btn" data-index="${index}">&minus;</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn inc-btn" data-index="${index}">&plus;</button>
                        <button class="remove-item-btn" data-index="${index}" title="Eliminar artículo">🗑️</button>
                    </div>
                </div>
            `;
        });

        cartItemsList.innerHTML = listHTML;

        // Calculate and display prices
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (modalSubtotal) modalSubtotal.innerText = `$${totalPrice.toFixed(2)}`;
        if (modalTotal) modalTotal.innerText = `$${totalPrice.toFixed(2)}`;

        // Attach Event Listeners to item control buttons
        attachItemEventListeners();

        // Render dynamic suggestions (cross-selling)
        renderSuggestions();
    }

    function attachItemEventListeners() {
        // Quantity Decrement
        const decButtons = cartItemsList.querySelectorAll('.dec-btn');
        decButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                updateCartUI();
            });
        });

        // Quantity Increment
        const incButtons = cartItemsList.querySelectorAll('.inc-btn');
        incButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                cart[index].quantity += 1;
                updateCartUI();
            });
        });

        // Item Removal
        const removeButtons = cartItemsList.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('button').getAttribute('data-index'));
                cart.splice(index, 1);
                updateCartUI();
            });
        });
    }

    function renderSuggestions() {
        if (!cartSuggestions) return;

        if (cart.length === 0) {
            cartSuggestions.innerHTML = '';
            return;
        }

        const allProducts = [
            { name: 'Combo Familiar', price: 24.90, category: 'combos', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=400', desc: '1.5 Pollos + Papas Grandes + Ensalada + Refresco 2L.' },
            { name: 'Pollo Entero', price: 14.50, category: 'pollos', img: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=400', desc: 'Pollo asado al carbón con nuestra receta secreta.' },
            { name: 'Dúo Pack', price: 18.20, category: 'combos', img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=400', desc: '1 Pollo + Papas Medianas + 2 Bebidas de 500ml.' },
            { name: 'Medio Pollo', price: 8.50, category: 'pollos', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400', desc: 'Medio pollo asado jugoso servido con tortillas calientes.' },
            { name: 'Papas Fritas Grandes', price: 4.50, category: 'complementos', img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400', desc: 'Papas cortadas al momento, fritas a la perfección y crujientes.' },
            { name: 'Ensalada Fresca', price: 3.50, category: 'complementos', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400', desc: 'Mezcla fresca de lechuga, tomates y aderezo especial de la casa.' },
            { name: 'Refresco Familiar 2L', price: 3.50, category: 'bebidas', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400', desc: 'Elige tu sabor preferido para compartir con toda la familia.' },
            { name: 'Limonada Natural', price: 2.50, category: 'bebidas', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400', desc: 'Limonada recién exprimida bien fría para refrescar tu día.' }
        ];

        // Filter products not currently in the cart
        const itemsNotInCart = allProducts.filter(p => !cart.some(item => item.name === p.name));

        if (itemsNotInCart.length === 0) {
            cartSuggestions.innerHTML = '';
            return;
        }

        // Detect current cart categories to recommend smart complements
        const cartCategories = cart.map(item => {
            const found = allProducts.find(p => p.name === item.name);
            return found ? found.category : '';
        }).filter(Boolean);

        const hasMainDish = cartCategories.includes('combos') || cartCategories.includes('pollos');
        const hasBeverage = cartCategories.includes('bebidas');
        const hasSides = cartCategories.includes('complementos');

        // Sort itemsNotInCart based on smart relevance
        let suggestions = [...itemsNotInCart];

        if (hasMainDish) {
            // If they have a main dish, prioritize complementos/bebidas
            suggestions.sort((a, b) => {
                const aIsComplement = a.category === 'complementos' || a.category === 'bebidas';
                const bIsComplement = b.category === 'complementos' || b.category === 'bebidas';
                if (aIsComplement && !bIsComplement) return -1;
                if (!aIsComplement && bIsComplement) return 1;
                return 0;
            });
        } else if (hasBeverage || hasSides) {
            // If they only have sides/drinks, prioritize main dishes (combos/pollos)
            suggestions.sort((a, b) => {
                const aIsMain = a.category === 'combos' || a.category === 'pollos';
                const bIsMain = b.category === 'combos' || b.category === 'pollos';
                if (aIsMain && !bIsMain) return -1;
                if (!aIsMain && bIsMain) return 1;
                return 0;
            });
        }

        // Pick top 3 suggestions to avoid cluttering space
        const finalSuggestions = suggestions.slice(0, 3);

        let html = `
            <h4 class="cart-suggestions-title">💡 ¡Acompaña tu pedido!</h4>
            <div class="cart-suggestions-list">
        `;

        finalSuggestions.forEach((prod) => {
            html += `
                <div class="suggestion-card">
                    <img src="${prod.img}" alt="${prod.name}" class="suggestion-img" loading="lazy">
                    <div class="suggestion-details">
                        <span class="suggestion-name">${prod.name}</span>
                        <span class="suggestion-price">$${prod.price.toFixed(2)}</span>
                    </div>
                    <button class="suggestion-add-btn" data-name="${prod.name}" data-price="${prod.price}">&plus;</button>
                </div>
            `;
        });

        html += `</div>`;
        cartSuggestions.innerHTML = html;

        // Attach listeners for suggestions
        const addBtns = cartSuggestions.querySelectorAll('.suggestion-add-btn');
        addBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = btn.getAttribute('data-name');
                const price = parseFloat(btn.getAttribute('data-price'));

                // Add or update item in cart array
                const existingItem = cart.find(item => item.name === name);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ name: name, price: price, quantity: 1 });
                }

                updateCartUI();
                showToast(`¡Añadido ${name}! 🍗`);
            });
        });
    }

    function getRecentOrders() {
        try {
            const savedOrders = localStorage.getItem('mayago_past_orders');
            if (savedOrders) {
                return JSON.parse(savedOrders);
            }
        } catch (e) {
            console.error('Error loading past orders', e);
        }
        
        // Populate with simulated past orders if empty
        const simulatedOrders = [
            {
                id: 'ORD-9841',
                date: 'Ayer, 8:15 PM',
                items: [
                    { name: 'Combo Maya Familiar (Pollo Entero + Guarnición)', quantity: 1, price: 925.00 }
                ],
                total: 925.00,
                status: 'entregado'
            },
            {
                id: 'ORD-9712',
                date: 'Hace 3 días, 1:30 PM',
                items: [
                    { name: 'Medio Pollo Maya Go', quantity: 1, price: 495.00 },
                    { name: 'Pechurritas Crujientes Maya', quantity: 1, price: 345.00 }
                ],
                total: 840.00,
                status: 'entregado'
            }
        ];
        
        try {
            localStorage.setItem('mayago_past_orders', JSON.stringify(simulatedOrders));
        } catch (e) {
            console.error('Error saving simulated orders', e);
        }
        
        return simulatedOrders;
    }

    function renderRecentOrders() {
        const recentOrdersList = document.getElementById('recent-orders-list');
        if (!recentOrdersList) return;

        const orders = getRecentOrders();

        if (orders.length === 0) {
            recentOrdersList.innerHTML = `
                <div class="no-recent-orders">
                    No tienes pedidos recientes guardados.
                </div>
            `;
            return;
        }

        let html = '';
        orders.forEach((order, orderIndex) => {
            const itemsSummary = order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
            const statusLabel = order.status === 'en-camino' ? 'En Camino 🛵' : 'Entregado ✓';
            
            html += `
                <div class="recent-order-card">
                    <div class="recent-order-header">
                        <span class="recent-order-date">${order.date}</span>
                        <span class="recent-order-status ${order.status}">${statusLabel}</span>
                    </div>
                    <div class="recent-order-items-text">${itemsSummary}</div>
                    <div class="recent-order-footer">
                        <span class="recent-order-total">$${order.total.toFixed(2)}</span>
                        <button class="btn-reorder" data-index="${orderIndex}">
                            🔄 Volver a pedir
                        </button>
                    </div>
                </div>
            `;
        });

        recentOrdersList.innerHTML = html;

        // Reorder button event listeners
        const reorderBtns = recentOrdersList.querySelectorAll('.btn-reorder');
        reorderBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                const orderToReorder = orders[index];
                
                // Clear existing cart and add all items from this past order
                cart.length = 0;
                orderToReorder.items.forEach(item => {
                    cart.push({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    });
                });

                updateCartUI();
                showToast('¡Productos agregados al carrito!');
            });
        });
    }

    function saveCurrentCartAsOrder(status = 'en-camino') {
        if (cart.length === 0) return;

        try {
            const orders = getRecentOrders();
            const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
            const newOrder = {
                id: orderId,
                date: 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                items: [...cart],
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                status: status
            };

            orders.unshift(newOrder);
            if (orders.length > 5) {
                orders.pop();
            }

            localStorage.setItem('mayago_past_orders', JSON.stringify(orders));
            renderRecentOrders();
        } catch (e) {
            console.error('Error saving current cart as past order', e);
        }
    }

    function openModal() {
        if (cartModal) {
            cartModal.classList.remove('hidden');
            renderModalItems();
            renderRecentOrders();
        }
    }

    function closeModal() {
        if (cartModal) {
            cartModal.classList.add('hidden');
        }
    }

    // Modal triggers and close events
    if (cartSummaryTrigger) {
        cartSummaryTrigger.addEventListener('click', openModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close on overlay backdrop click
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                closeModal();
            }
        });
    }

    // Initialize cart UI state from loaded items
    updateCartUI();

    const addButtons = document.querySelectorAll('.product-card .btn-sm');
    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const productName = productCard.querySelector('.product-info h3').innerText;
            const priceText = productCard.querySelector('.price').innerText;
            const price = parseFloat(priceText.replace('$', ''));
            
            // Add or update item in cart array
            const existingItem = cart.find(item => item.name === productName);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name: productName, price: price, quantity: 1 });
            }

            // Update floating summary
            updateCartUI();
            
            // Show toast notification confirmation
            showToast(`${productName} añadido al carrito`);
            
            // Visual feedback
            const originalText = btn.innerText;
            btn.innerText = '¡Agregado! ✓';
            btn.style.backgroundColor = '#4CAF50'; // Green
            btn.style.borderColor = '#4CAF50';
            
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
            }, 2000);
            
            console.log(`Producto añadido: ${productName} - $${price}`);
        });
    });

    if (modalCheckoutBtn) {
        modalCheckoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            
            let summaryText = 'Tu Orden:\n';
            cart.forEach(item => {
                summaryText += `- ${item.name} x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})\n`;
            });
            const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            summaryText += `\nTotal a pagar: $${totalPrice.toFixed(2)}\n\n¿Confirmar pedido a domicilio?`;
            
            // Standard user-facing dialog to confirm or simulate order placement
            const confirmOrder = confirm(summaryText);
            if (confirmOrder) {
                // Save to past orders in localStorage
                saveCurrentCartAsOrder('en-camino');
                
                alert('¡Pedido Enviado! 🔥 Su pollo asado Maya Go está en camino. Estará en su puerta en menos de 30 minutos.');
                // Clear cart
                cart.length = 0;
                updateCartUI();
                closeModal();
            }
        });
    }

    function sendWhatsAppOrder() {
        if (cart.length === 0) {
            const generalMessage = "¡Hola! Quisiera realizar una consulta sobre el menú de Pollos Maya Go.";
            const url = `https://wa.me/18095550101?text=${encodeURIComponent(generalMessage)}`;
            window.open(url, '_blank');
            return;
        }

        let msg = "¡Hola, Pollos Maya Go! 🍗\n\nQuisiera realizar el siguiente pedido:\n\n";
        cart.forEach(item => {
            msg += `• *${item.name}* x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
        });
        
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        msg += `\n💵 *Total del Pedido:* $${totalPrice.toFixed(2)}\n`;
        msg += `🛵 *Envío:* ¡Gratis!\n\n`;
        msg += `Por favor, infórmenme sobre el tiempo de entrega y método de pago. ¡Muchas gracias!`;

        const url = `https://wa.me/18095550101?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
        
        // Save to past orders in localStorage before clearing
        saveCurrentCartAsOrder('en-camino');
        
        // Clear cart
        cart.length = 0;
        updateCartUI();
        
        showToast('Abriendo WhatsApp para enviar tu pedido...');
    }

    if (whatsappFloatBtn) {
        whatsappFloatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sendWhatsAppOrder();
        });
    }

    if (modalWhatsappBtn) {
        modalWhatsappBtn.addEventListener('click', () => {
            sendWhatsAppOrder();
            closeModal();
        });
    }

    // 5. Category Selection & Interactive Filtering & Search
    const categoryCards = document.querySelectorAll('.category-card');
    const productCards = document.querySelectorAll('.product-card');
    const searchInput = document.getElementById('menu-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    // Filter states
    const initialActiveCard = document.querySelector('.category-card.active');
    let currentCategory = initialActiveCard ? initialActiveCard.getAttribute('data-category') : '';
    let currentSearchQuery = '';

    function applyFilters() {
        productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardName = card.querySelector('.product-info h3').innerText.toLowerCase();
            const matchesCategory = !currentCategory || cardCategory === currentCategory;
            const matchesSearch = !currentSearchQuery || cardName.includes(currentSearchQuery);

            if (matchesCategory && matchesSearch) {
                card.classList.remove('hidden');
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                card.classList.add('hidden');
            }
        });

        // Show a "No results found" container if all cards are hidden
        const visibleCards = Array.from(productCards).filter(card => !card.classList.contains('hidden'));
        const existingNoResults = document.getElementById('no-menu-results');
        
        if (visibleCards.length === 0) {
            if (!existingNoResults) {
                const noResults = document.createElement('div');
                noResults.id = 'no-menu-results';
                noResults.style.textAlign = 'center';
                noResults.style.padding = '4rem 1rem';
                noResults.style.color = 'var(--muted)';
                noResults.style.gridColumn = '1 / -1';
                noResults.innerHTML = `
                    <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">🔍</span>
                    <p style="font-weight: 700; font-size: 1.2rem; color: var(--dark); margin-bottom: 0.5rem; font-family: var(--font-heading);">No se encontraron productos</p>
                    <p style="font-size: 0.95rem;">Prueba buscando algo diferente o cambia de categoría.</p>
                `;
                const menuGrid = document.querySelector('.menu-grid');
                if (menuGrid) menuGrid.appendChild(noResults);
            }
        } else {
            if (existingNoResults) {
                existingNoResults.remove();
            }
        }
    }

    // Initialize filter based on the active category card on load
    applyFilters();

    // Category Card Event Listeners
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            currentCategory = card.getAttribute('data-category');
            const categoryName = card.querySelector('h3').innerText;
            console.log(`Filtrando por categoría: ${categoryName} (${currentCategory})`);
            
            // Simple visual "refresh" effect
            const menuGrid = document.querySelector('.menu-grid');
            if (menuGrid) {
                menuGrid.style.transition = 'opacity 0.25s ease';
                menuGrid.style.opacity = '0';
                
                setTimeout(() => {
                    applyFilters();
                    menuGrid.style.opacity = '1';
                }, 250);
            }
        });
    });

    // Search Input Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.toLowerCase().trim();
            
            // Toggle clear button
            if (currentSearchQuery.length > 0) {
                clearSearchBtn.classList.remove('hidden');
            } else {
                clearSearchBtn.classList.add('hidden');
            }
            
            applyFilters();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchQuery = '';
            clearSearchBtn.classList.add('hidden');
            applyFilters();
            searchInput.focus();
        });
    }

    // Buttons Actions (Pedir Ahora, Hacer Pedido, Ver Menú Completo)
    function handleOrderAction(e) {
        e.preventDefault();
        if (cart.length > 0) {
            openModal();
            showToast('Abriendo tu carrito de compras 🛒');
        } else {
            const menuSection = document.getElementById('menu');
            if (menuSection) {
                window.scrollTo({
                    top: menuSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
            showToast('¡Selecciona tus pollos y combos favoritos! 🍗');
        }
    }

    const pedirAhoraBtn = document.getElementById('pedir-ahora-btn');
    if (pedirAhoraBtn) {
        pedirAhoraBtn.addEventListener('click', handleOrderAction);
    }

    const hacerPedidoBtn = document.getElementById('hacer-pedido-btn');
    if (hacerPedidoBtn) {
        hacerPedidoBtn.addEventListener('click', handleOrderAction);
    }

    const verMenuCompletoBtn = document.getElementById('ver-menu-completo-btn');
    if (verMenuCompletoBtn) {
        verMenuCompletoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Clear category selection so all categories are shown
            currentCategory = '';
            categoryCards.forEach(c => c.classList.remove('active'));
            
            applyFilters();
            
            // Scroll to menu section
            const menuSection = document.getElementById('menu');
            if (menuSection) {
                window.scrollTo({
                    top: menuSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
            
            showToast('Mostrando todo el menú completo ✨');
        });
    }

    // 6. Smooth Scroll for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 7. Dynamic Delivery Estimator Logic
    function initDeliveryEstimator() {
        const pulse = document.getElementById('estimator-pulse');
        const status = document.getElementById('store-load-status');
        const timeVal = document.getElementById('delivery-time-val');
        const progress = document.getElementById('estimator-progress');
        const details = document.getElementById('estimator-details');

        if (!pulse || !status || !timeVal || !progress || !details) return;

        const loadStates = [
            {
                status: 'Estado de cocina: Cocina Despejada 🍳',
                pulseClass: 'pulse-green',
                fillClass: 'fill-low',
                progressWidth: '25%',
                time: '15 - 25 minutos',
                details: 'Basado en 5 repartidores activos y pocos pedidos en fila.'
            },
            {
                status: 'Estado de cocina: Flujo Normal 🍗',
                pulseClass: 'pulse-green',
                fillClass: 'fill-normal',
                progressWidth: '45%',
                time: '25 - 35 minutos',
                details: 'Basado en 4 repartidores activos y tráfico promedio.'
            },
            {
                status: 'Estado de cocina: Alta Demanda 🔥',
                pulseClass: 'pulse-yellow',
                fillClass: 'fill-high',
                progressWidth: '75%',
                time: '35 - 45 minutos',
                details: 'Basado en 3 repartidores activos por alta demanda.'
            },
            {
                status: 'Estado de cocina: Hora Pico ⚡',
                pulseClass: 'pulse-red',
                fillClass: 'fill-peak',
                progressWidth: '95%',
                time: '45 - 55 minutos',
                details: 'Demanda máxima temporal por hora de almuerzo/cena.'
            }
        ];

        let currentStateIndex = 1; // Default to Normal

        function updateEstimator(index) {
            const state = loadStates[index];
            
            // Apply slight transition effect via scale or opacity
            timeVal.style.opacity = '0.3';
            timeVal.style.transform = 'scale(0.95)';
            details.style.opacity = '0.3';

            setTimeout(() => {
                // Update text values
                status.textContent = state.status;
                timeVal.textContent = state.time;
                details.textContent = state.details;

                // Update classes for pulse
                pulse.className = 'estimator-pulse ' + state.pulseClass;

                // Update classes and width for progress bar
                progress.className = 'estimator-progress-fill ' + state.fillClass;
                progress.style.width = state.progressWidth;

                // Restore styles with transition
                timeVal.style.opacity = '1';
                timeVal.style.transform = 'scale(1)';
                details.style.opacity = '1';
            }, 300);
        }

        // Cycle through states or simulate dynamic updates every 12 seconds
        setInterval(() => {
            // Randomly select adjacent state to make it look organic (or step up/down)
            const change = Math.random() > 0.5 ? 1 : -1;
            currentStateIndex = (currentStateIndex + change + loadStates.length) % loadStates.length;
            updateEstimator(currentStateIndex);
        }, 12000);

        // Run initial update
        updateEstimator(currentStateIndex);
    }

    initDeliveryEstimator();
});

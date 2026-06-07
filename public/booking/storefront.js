(function () {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const slug = pathParts[0] === 'book' ? pathParts[1] : '';
  const params = new URLSearchParams(window.location.search);
  const storageKey = `bn_store_${slug}`;
  const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  const state = {
    page: null,
    items: [],
    cart: [],
    wishlist: [],
    quantities: {},
    filters: { search: '', category: '', sort: 'featured' },
  };

  const el = {
    businessName: document.getElementById('businessName'),
    businessLocation: document.getElementById('businessLocation'),
    brandMark: document.getElementById('brandMark'),
    storeTitle: document.getElementById('storeTitle'),
    storeKicker: document.getElementById('storeKicker'),
    resultCount: document.getElementById('resultCount'),
    productGrid: document.getElementById('productGrid'),
    emptyState: document.getElementById('emptyState'),
    searchInput: document.getElementById('searchInput'),
    categoryFilter: document.getElementById('categoryFilter'),
    sortFilter: document.getElementById('sortFilter'),
    wishlistCount: document.getElementById('wishlistCount'),
    cartCount: document.getElementById('cartCount'),
    wishlistButton: document.getElementById('wishlistButton'),
    cartButton: document.getElementById('cartButton'),
    cartDrawer: document.getElementById('cartDrawer'),
    closeCart: document.getElementById('closeCart'),
    cartItems: document.getElementById('cartItems'),
    cartTotal: document.getElementById('cartTotal'),
    checkoutButton: document.getElementById('checkoutButton'),
    catalogView: document.getElementById('catalogView'),
    checkoutView: document.getElementById('checkoutView'),
    backToCatalog: document.getElementById('backToCatalog'),
    checkoutForm: document.getElementById('checkoutForm'),
    summaryItems: document.getElementById('summaryItems'),
    summarySubtotal: document.getElementById('summarySubtotal'),
    placeOrderButton: document.getElementById('placeOrderButton'),
    checkoutMessage: document.getElementById('checkoutMessage'),
    customerName: document.getElementById('customerName'),
    customerPhone: document.getElementById('customerPhone'),
    customerEmail: document.getElementById('customerEmail'),
    customerAddress: document.getElementById('customerAddress'),
    customerPincode: document.getElementById('customerPincode'),
    customerNotes: document.getElementById('customerNotes'),
  };

  init().catch((error) => {
    el.productGrid.innerHTML = '';
    el.emptyState.hidden = false;
    el.emptyState.querySelector('strong').textContent = 'Store unavailable';
    el.emptyState.querySelector('span').textContent = error.message || 'Please try again later.';
  });

  async function init() {
    if (!slug) throw new Error('Missing store link.');
    hydrateLocalState();
    bindEvents();
    prefillCustomer();
    await loadStore();
    await loadItems();
    render();
  }

  function bindEvents() {
    el.searchInput.addEventListener('input', debounce((event) => {
      state.filters.search = event.target.value.trim();
      loadItems().then(render);
    }, 220));
    el.categoryFilter.addEventListener('change', (event) => {
      state.filters.category = event.target.value;
      render();
    });
    el.sortFilter.addEventListener('change', (event) => {
      state.filters.sort = event.target.value;
      render();
    });
    el.cartButton.addEventListener('click', openCart);
    el.closeCart.addEventListener('click', closeCart);
    el.cartDrawer.addEventListener('click', (event) => {
      if (event.target === el.cartDrawer) closeCart();
    });
    el.checkoutButton.addEventListener('click', showCheckout);
    el.backToCatalog.addEventListener('click', showCatalog);
    el.checkoutForm.addEventListener('submit', placeOrder);
  }

  async function loadStore() {
    const response = await fetch(`/public-booking/${encodeURIComponent(slug)}`);
    if (!response.ok) throw new Error('This store link is not active.');
    state.page = await response.json();
    const business = state.page.business || {};
    const name = business.business_name || 'Store';
    document.title = name;
    el.businessName.textContent = name;
    el.brandMark.textContent = name.trim().charAt(0).toUpperCase() || 'S';
    el.businessLocation.textContent = [business.city, business.phone || business.whatsapp_number].filter(Boolean).join(' • ');
    el.storeTitle.textContent = `Shop ${name}`;
    el.storeKicker.textContent = state.page.labels?.items || 'Products';
  }

  async function loadItems() {
    const qs = new URLSearchParams();
    if (state.filters.search) qs.set('search', state.filters.search);
    qs.set('item_type', 'physical_product');
    const response = await fetch(`/public-booking/${encodeURIComponent(slug)}/items?${qs.toString()}`);
    if (!response.ok) throw new Error('Products could not be loaded.');
    const payload = await response.json();
    state.items = Array.isArray(payload.data) ? payload.data : [];
    seedQuantities();
    syncCategories();
  }

  function render() {
    renderCounts();
    renderProducts();
    renderCart();
    renderSummary();
    persistLocalState();
  }

  function renderProducts() {
    const items = filteredItems();
    el.resultCount.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
    el.emptyState.hidden = items.length > 0;
    el.productGrid.innerHTML = items.map(productCard).join('');

    el.productGrid.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', onProductAction);
    });
  }

  function productCard(item) {
    const qty = state.quantities[item.item_id] || 1;
    const wished = state.wishlist.includes(item.item_id);
    const stock = stockLabel(item);
    return `
      <article class="product-card">
        <div class="product-media">
          ${imageHtml(item, item.name)}
          <button class="wishlist-toggle ${wished ? 'active' : ''}" type="button" data-action="wishlist" data-id="${escapeAttr(item.item_id)}" aria-label="Wishlist ${escapeAttr(item.name)}">${wished ? '♥' : '♡'}</button>
        </div>
        <div class="product-body">
          <h2 class="product-title">${escapeHtml(item.name)}</h2>
          <p class="product-desc">${escapeHtml(item.description || shortDetails(item))}</p>
          <div class="product-meta">
            <span class="price">${formatPrice(item.effective_price || item.base_price, item.currency)}</span>
            <span class="stock">${escapeHtml(stock)}</span>
          </div>
          <div class="product-actions">
            <div class="qty-control" aria-label="Quantity">
              <button type="button" data-action="dec" data-id="${escapeAttr(item.item_id)}">−</button>
              <span>${qty}</span>
              <button type="button" data-action="inc" data-id="${escapeAttr(item.item_id)}">+</button>
            </div>
            <button class="add-button" type="button" data-action="add" data-id="${escapeAttr(item.item_id)}" ${isOutOfStock(item) ? 'disabled' : ''}>Add to cart</button>
          </div>
        </div>
      </article>
    `;
  }

  function onProductAction(event) {
    const action = event.currentTarget.dataset.action;
    const id = event.currentTarget.dataset.id;
    const item = state.items.find((candidate) => candidate.item_id === id);
    if (!item) return;

    if (action === 'wishlist') {
      toggleWishlist(id);
    } else if (action === 'inc') {
      state.quantities[id] = Math.min((state.quantities[id] || 1) + 1, maxQty(item));
    } else if (action === 'dec') {
      state.quantities[id] = Math.max((state.quantities[id] || 1) - 1, 1);
    } else if (action === 'add') {
      addToCart(item, state.quantities[id] || 1);
      openCart();
    }
    render();
  }

  function renderCart() {
    if (!state.cart.length) {
      el.cartItems.innerHTML = '<div class="empty-state"><strong>Your cart is empty</strong><span>Add products to continue.</span></div>';
    } else {
      el.cartItems.innerHTML = state.cart.map(cartLine).join('');
      el.cartItems.querySelectorAll('[data-cart-action]').forEach((button) => {
        button.addEventListener('click', onCartAction);
      });
    }
    el.cartTotal.textContent = formatPrice(cartTotal(), currency());
    el.checkoutButton.disabled = state.cart.length === 0;
  }

  function cartLine(line) {
    const item = state.items.find((candidate) => candidate.item_id === line.item_id) || line.item;
    return `
      <div class="cart-line">
        ${imageHtml(item, item.name)}
        <div>
          <div class="line-title">${escapeHtml(item.name)}</div>
          <div class="line-sub">${formatPrice(line.price, item.currency)} × ${line.quantity}</div>
          <div class="line-actions">
            <div class="qty-control">
              <button type="button" data-cart-action="dec" data-id="${escapeAttr(line.item_id)}">−</button>
              <span>${line.quantity}</span>
              <button type="button" data-cart-action="inc" data-id="${escapeAttr(line.item_id)}">+</button>
            </div>
            <button class="remove-button" type="button" data-cart-action="remove" data-id="${escapeAttr(line.item_id)}">Remove</button>
          </div>
        </div>
      </div>
    `;
  }

  function onCartAction(event) {
    const action = event.currentTarget.dataset.cartAction;
    const id = event.currentTarget.dataset.id;
    const line = state.cart.find((candidate) => candidate.item_id === id);
    const item = state.items.find((candidate) => candidate.item_id === id) || line?.item;
    if (!line || !item) return;
    if (action === 'inc') line.quantity = Math.min(line.quantity + 1, maxQty(item));
    if (action === 'dec') line.quantity = Math.max(line.quantity - 1, 1);
    if (action === 'remove') state.cart = state.cart.filter((candidate) => candidate.item_id !== id);
    render();
  }

  function renderSummary() {
    el.summaryItems.innerHTML = state.cart.map((line) => {
      const item = state.items.find((candidate) => candidate.item_id === line.item_id) || line.item;
      return `
        <div class="summary-line">
          ${imageHtml(item, item.name)}
          <div>
            <div class="line-title">${escapeHtml(item.name)}</div>
            <div class="line-sub">${line.quantity} × ${formatPrice(line.price, item.currency)}</div>
          </div>
        </div>
      `;
    }).join('');
    el.summarySubtotal.textContent = formatPrice(cartTotal(), currency());
  }

  function renderCounts() {
    const cartCount = state.cart.reduce((sum, line) => sum + line.quantity, 0);
    el.cartCount.textContent = String(cartCount);
    el.wishlistCount.textContent = String(state.wishlist.length);
  }

  function addToCart(item, quantity) {
    const existing = state.cart.find((line) => line.item_id === item.item_id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, maxQty(item));
      return;
    }
    state.cart.push({
      item_id: item.item_id,
      quantity: Math.min(quantity, maxQty(item)),
      price: Number(item.effective_price || item.base_price || 0),
      item,
    });
  }

  function toggleWishlist(id) {
    state.wishlist = state.wishlist.includes(id)
      ? state.wishlist.filter((itemId) => itemId !== id)
      : [...state.wishlist, id];
  }

  function showCheckout() {
    if (!state.cart.length) return;
    closeCart();
    el.catalogView.hidden = true;
    el.checkoutView.hidden = false;
    renderSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showCatalog() {
    el.checkoutView.hidden = true;
    el.catalogView.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (!state.cart.length) return;
    setCheckoutMessage('Placing your order...', '');
    el.placeOrderButton.disabled = true;

    const customer = customerPayload();
    persistCustomer(customer);

    try {
      const results = [];
      for (const line of state.cart) {
        const response = await fetch(`/public-booking/${encodeURIComponent(slug)}/requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item_id: line.item_id,
            quantity: line.quantity,
            customer,
            lead_id: params.get('lead_id') || params.get('leadId') || undefined,
            payment_method: 'manual',
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || payload.error || 'Order failed');
        results.push(payload.order_number || payload.reference_id);
      }

      state.cart = [];
      render();
      setCheckoutMessage(`Order received. Reference: ${results.filter(Boolean).join(', ') || 'created'}.`, 'success');
    } catch (error) {
      setCheckoutMessage(error.message || 'Could not place the order. Please try again.', 'error');
    } finally {
      el.placeOrderButton.disabled = false;
    }
  }

  function customerPayload() {
    return {
      name: el.customerName.value.trim(),
      phone: el.customerPhone.value.trim(),
      email: el.customerEmail.value.trim(),
      address: el.customerAddress.value.trim(),
      pincode: el.customerPincode.value.trim(),
      notes: el.customerNotes.value.trim(),
    };
  }

  function prefillCustomer() {
    const saved = readStorage().customer || {};
    el.customerName.value = params.get('name') || saved.name || '';
    el.customerPhone.value = params.get('phone') || params.get('customer_phone') || saved.phone || '';
    el.customerEmail.value = params.get('email') || saved.email || '';
    el.customerAddress.value = params.get('address') || saved.address || '';
    el.customerPincode.value = params.get('pincode') || saved.pincode || '';
    el.customerNotes.value = params.get('notes') || saved.notes || '';
  }

  function persistCustomer(customer) {
    const snapshot = readStorage();
    snapshot.customer = customer;
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  }

  function hydrateLocalState() {
    const saved = readStorage();
    state.cart = Array.isArray(saved.cart) ? saved.cart : [];
    state.wishlist = Array.isArray(saved.wishlist) ? saved.wishlist : [];
    state.quantities = saved.quantities && typeof saved.quantities === 'object' ? saved.quantities : {};
  }

  function persistLocalState() {
    const saved = readStorage();
    localStorage.setItem(storageKey, JSON.stringify({
      ...saved,
      cart: state.cart,
      wishlist: state.wishlist,
      quantities: state.quantities,
    }));
  }

  function readStorage() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  }

  function openCart() {
    el.cartDrawer.classList.add('open');
    el.cartDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeCart() {
    el.cartDrawer.classList.remove('open');
    el.cartDrawer.setAttribute('aria-hidden', 'true');
  }

  function filteredItems() {
    let items = state.items.slice();
    if (state.filters.category) {
      items = items.filter((item) => item.category === state.filters.category);
    }
    if (state.filters.sort === 'price-asc') items.sort((a, b) => price(a) - price(b));
    if (state.filters.sort === 'price-desc') items.sort((a, b) => price(b) - price(a));
    if (state.filters.sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
  }

  function syncCategories() {
    const current = el.categoryFilter.value;
    const categories = [...new Set(state.items.map((item) => item.category).filter(Boolean))].sort();
    el.categoryFilter.innerHTML = '<option value="">All categories</option>' + categories.map((category) => (
      `<option value="${escapeAttr(category)}">${escapeHtml(category)}</option>`
    )).join('');
    el.categoryFilter.value = categories.includes(current) ? current : '';
    state.filters.category = el.categoryFilter.value;
  }

  function seedQuantities() {
    state.items.forEach((item) => {
      if (!state.quantities[item.item_id]) state.quantities[item.item_id] = 1;
    });
  }

  function stockLabel(item) {
    if (item.stock_quantity == null) return 'Available';
    if (item.stock_quantity <= 0) return 'Out of stock';
    if (item.stock_quantity <= 5) return `${item.stock_quantity} left`;
    return 'In stock';
  }

  function isOutOfStock(item) {
    return item.stock_quantity != null && item.stock_quantity <= 0;
  }

  function maxQty(item) {
    return item.stock_quantity == null ? 99 : Math.max(1, Number(item.stock_quantity));
  }

  function price(item) {
    return Number(item.effective_price || item.base_price || 0);
  }

  function cartTotal() {
    return state.cart.reduce((sum, line) => sum + Number(line.price || 0) * Number(line.quantity || 1), 0);
  }

  function currency() {
    return state.page?.business?.currency || state.items[0]?.currency || 'INR';
  }

  function formatPrice(value, curr) {
    const amount = Number(value || 0);
    if ((curr || currency()) === 'INR') return money.format(amount);
    return `${curr || currency()} ${amount.toLocaleString('en-IN')}`;
  }

  function imageHtml(item, alt) {
    const src = item?.primary_image_url || (Array.isArray(item?.image_urls) ? item.image_urls[0] : '');
    if (src) return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt || 'Product')}" loading="lazy" />`;
    return `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='240' viewBox='0 0 320 240'%3E%3Crect width='320' height='240' fill='%23e8eee8'/%3E%3Cpath d='M92 151l43-51 34 37 20-23 39 37z' fill='%23b8c6ba'/%3E%3Ccircle cx='212' cy='77' r='18' fill='%23cad5cc'/%3E%3C/svg%3E" alt="${escapeAttr(alt || 'Product')}" />`;
  }

  function shortDetails(item) {
    const details = item.details || item.attributes || {};
    return Object.entries(details).slice(0, 2).map(([key, value]) => `${key}: ${value}`).join(' • ');
  }

  function setCheckoutMessage(message, type) {
    el.checkoutMessage.textContent = message;
    el.checkoutMessage.className = `checkout-message ${type || ''}`;
  }

  function debounce(fn, delay) {
    let timer;
    return function () {
      clearTimeout(timer);
      const args = arguments;
      timer = setTimeout(() => fn.apply(null, args), delay);
    };
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }
})();

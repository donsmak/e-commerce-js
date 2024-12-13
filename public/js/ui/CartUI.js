class CartUI {
  constructor(selectors) {
    this.elements = {
      cartItems: document.getElementById(selectors.cartItems),
      cartCount: document.getElementById(selectors.cartCount),
      cartTotal: document.getElementById(selectors.cartTotal),
      cartSidebar: document.getElementById(selectors.cartSidebar),
      cartToggle: document.getElementById('cart-toggle'),
      closeCart: document.getElementById('close-cart'),
    };

    this.setupSidebar();
  }

  setupSidebar() {
    // Setup cart toggle button
    if (this.elements.cartToggle) {
      this.elements.cartToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleCart();
      });
    }

    if (this.elements.closeCart) {
      this.elements.closeCart.addEventListener('click', () => {
        this.closeCart();
      });
    }

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
      if (
        this.elements.cartSidebar &&
        !this.elements.cartSidebar.classList.contains('translate-x-full') &&
        !this.elements.cartSidebar.contains(e.target) &&
        !this.elements.cartToggle.contains(e.target)
      ) {
        this.closeCart();
      }
    });

    // Setup ESC key to close cart
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeCart();
      }
    });
  }

  toggleCart() {
    if (this.elements.cartSidebar) {
      this.elements.cartSidebar.classList.toggle('translate-x-full');
      this.elements.cartSidebar.classList.toggle('opacity-0');
    }
  }

  openCart() {
    if (this.elements.cartSidebar) {
      this.elements.cartSidebar.classList.remove('translate-x-full', 'opacity-0');
    }
  }

  closeCart() {
    if (this.elements.cartSidebar) {
      this.elements.cartSidebar.classList.add('translate-x-full', 'opacity-0');
    }
  }

  updateCartCount(count) {
    if (this.elements.cartCount) {
      this.elements.cartCount.textContent = count;
    }
  }

  updateCartTotal(total) {
    if (this.elements.cartTotal) {
      this.elements.cartTotal.textContent = `$${total.toFixed(2)}`;
    }
  }

  setLoading(isLoading) {
    if (this.elements.cartItems) {
      this.elements.cartItems.classList.toggle('opacity-50', isLoading);
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `
      fixed top-4 left-1/2 transform -translate-x-1/2 z-50
      px-6 py-3 rounded-lg shadow-lg
      ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}
      text-white text-center
      transition-opacity duration-300
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Fade in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
    });

    // Fade out and remove
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 2700);
  }

  renderCartItems(items) {
    if (!this.elements.cartItems) return;

    if (!items.length) {
      this.elements.cartItems.innerHTML = this.getEmptyCartTemplate();
      return;
    }

    this.elements.cartItems.innerHTML = items
      .map((item) => this.getCartItemTemplate(item))
      .join('');
  }

  getEmptyCartTemplate() {
    return `
      <div class="p-6 text-center text-gray-500">
        <p class="text-lg">Your cart is empty</p>
        <p class="mt-2">Add some products to your cart</p>
      </div>
    `;
  }

  getCartItemTemplate(item) {
    return `
      <div class="flex items-center p-4 border-b" data-item-id="${item.product_id}">
        <img src="${item.image}" alt="${item.title}" 
             class="w-16 h-16 object-cover rounded">
        <div class="flex-grow ml-4">
          <h3 class="font-medium text-gray-800">${item.title}</h3>
          <p class="text-gray-600">$${item.price.toFixed(2)}</p>
        </div>
        <div class="flex items-center space-x-2">
          <button class="quantity-btn p-1 rounded hover:bg-gray-100" 
                  data-action="decrease">−</button>
          <span class="mx-2 min-w-[20px] text-center">${item.quantity}</span>
          <button class="quantity-btn p-1 rounded hover:bg-gray-100" 
                  data-action="increase">+</button>
          <button class="ml-4 text-red-500 hover:text-red-700" 
                  data-action="remove">×</button>
        </div>
      </div>
    `;
  }
}

window.CartUI = CartUI;

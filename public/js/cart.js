class ShoppingCart {
  constructor() {
    this.cart = [];
    this.cartItems = document.getElementById('cart-items');
    this.cartCount = document.getElementById('cart-count');
    this.cartTotal = document.getElementById('cart-total');
    this.init();
  }

  async init() {
    await this.syncWithDatabase();
    this.setupEventListeners();
    this.updateCartDisplay();
  }

  /**
   * Syncs localStorage cart with database
   */
  async syncWithDatabase() {
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      this.cart = data.data;
      this.updateCartDisplay();
    } catch (error) {
      console.error('Error syncing with database:', error);
    }
  }

  /**
   * Adds a product to the cart
   * @param {Object} product - The product to add
   * @param {number} quantity - Quantity to add (default: 1)
   */
  async addToCart(product, quantity = 1) {
    try {
      // Update localStorage first for immediate feedback
      const existingItem = this.cart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.cart.push({
          ...product,
          quantity,
        });
      }

      // Update UI immediately
      this.saveCart();
      this.updateCartDisplay();

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
      }

      this.showNotification('Product added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showNotification('Error adding product to cart', 'error');
    }
  }

  /**
   * Remove a product from the cart
   * @param {number} productId - ID of product to remove
   */
  async removeFromCart(productId) {
    const item = this.cart.find((item) => item.id === productId);
    if (!item) {
      console.error('Item not found in cart');
      return;
    }
    try {
      const response = await fetch(`/api/cart/items/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Only update local cart if API call is successful
      this.cart = this.cart.filter((item) => item.product_id !== productId);
      this.saveCart();
      this.updateCartDisplay();
    } catch (error) {
      console.error('Error removing from cart:', error);
      this.showNotification('Error removing item from cart', 'error');
    }
  }

  /**
   * Update quantity of a cart item
   * @param {number} productId - Product ID
   * @param {number} newQuantity - New quantity
   */
  async updateQuantity(productId, newQuantity) {
    const item = this.findCartItem(productId);

    if (!item) {
      console.error('Item not found in cart');
      return;
    }

    try {
      const response = await fetch(`/api/cart/items/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedCart = await response.json();
      this.cart = updatedCart.data;
      this.saveCart();
      this.updateCartDisplay();
    } catch (error) {
      console.error('Error updating quantity:', error);
      this.showNotification('Error updating quantity', 'error');
    }
  }

  /**
   * Persists cart data to localStorage
   */
  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  /**
   * Updates all cart UI elements
   */
  updateCartDisplay() {
    // Update cart count
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCount.textContent = totalItems;

    // Update cart total
    const total = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (this.cartTotal) {
      this.cartTotal.textContent = `${total.toFixed(2)}`;
    }

    // Update cart items display
    if (this.cartItems) {
      this.cartItems.innerHTML = this.cart.length
        ? this.getCartItemsHTML()
        : this.getEmptyCartHTML();
    }
  }

  /**
   * Generates HTML for cart items
   */
  getCartItemsHTML() {
    return this.cart
      .map(
        (item) => `
        <div class="flex items-center justify-between p-4 border-b" data-item-id="${
          item.product_id
        }">
          <div class="flex items-center space-x-4">
            <img src="${item.image || '../images/placeholder.svg'}" alt="${this.escapeHtml(
          item.title
        )}"
              class="w-16 h-16 object-cover rounded"
              onerror="this.src='../images/placeholder.svg'">
            <div>
              <h3 class="font-semibold">${this.escapeHtml(item.title)}</h3>
              <p class="text-gray-600">$${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button class="quantity-btn" data-action="decrease">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn" data-action="increase">+</button>
            <button class="remove-btn ml-4 text-xl" data-action="remove">×</button>
          </div>
        </div>
      `
      )
      .join('');
  }

  getEmptyCartHTML() {
    return `
      <div class="text-center py-8">
        <p class="text-gray-500">Your cart is empty</p>
      </div>
    `;
  }

  /**
   * Shows a temporary notification
   */
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className =
      'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300';
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  /**
   * prevents XSS in cart display
   */
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Sets up cart event listeners
   */
  setupEventListeners() {
    // Cart toggle
    const cartToggle = document.getElementById('cart-toggle');
    const closeCart = document.getElementById('close-cart');

    // Add click outside listener
    document.addEventListener('click', (e) => {
      // Check if cart is open and click is outside cart
      if (
        !this.cartSidebar.classList.contains('translate-x-full') && // Cart is open
        !this.cartSidebar.contains(e.target) && // Click not inside cart
        !cartToggle.contains(e.target) // CLick not on toggle button
      ) {
        this.cartSidebar.classList.add('translate-x-full');
      }
    });

    if (cartToggle) {
      cartToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent document click from immediately closing
        this.cartSidebar.classList.toggle('translate-x-full');
      });
    }

    if (closeCart) {
      closeCart.addEventListener('click', () => {
        this.cartSidebar.classList.add('translate-x-full');
      });
    }
    if (this.cartItems) {
      this.cartItems.addEventListener('click', (e) => {
        e.stopPropagation();

        const button = e.target.closest('button');
        if (!button) return;

        const item = button.closest('[data-item-id]');
        if (!item) return;

        const itemId = Number(item.dataset.itemId);
        const action = button.dataset.action;

        const currentQty = this.getItemQuantity(itemId);
        switch (action) {
          case 'increase':
            this.updateQuantity(itemId, currentQty + 1);
            break;
          case 'decrease':
            if (currentQty > 1) {
              this.updateQuantity(itemId, currentQty - 1);
            } else {
              this.removeFromCart(itemId);
            }
            break;
          case 'remove':
            this.removeFromCart(itemId);
            break;
        }
      });
    }
  }

  /**
   * Gets quantity of an item in cart
   */
  getItemQuantity(productId) {
    const item = this.cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  }

  // Consistent ID handling
  findCartItem(productId) {
    return this.cart.find((item) => item.product_id === productId);
  }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cart = new ShoppingCart();
});

class ShoppingCart {
  constructor() {
    this.service = new CartService();
    this.ui = new CartUI({
      cartItems: 'cart-items',
      cartCount: 'cart-count',
      cartTotal: 'cart-total',
      cartSidebar: 'cart-sidebar',
    });

    this.cart = [];
    this.init();
  }

  async init() {
    try {
      this.ui.setLoading(true);
      this.cart = await this.service.fetchCart();
      this.updateDisplay();
      this.setupEventListeners();
    } catch (error) {
      this.ui.showNotification('Failed to load cart', 'error');
    } finally {
      this.ui.setLoading(false);
    }
  }

  setupEventListeners() {
    document.getElementById('cart-items').addEventListener('click', async (e) => {
      const button = e.target.closest('button[data-action]');
      if (!button) return;

      const { action } = button.dataset;
      const item = button.closest('[data-item-id]');
      const productId = Number(item.dataset.itemId);

      try {
        this.ui.setLoading(true);

        switch (action) {
          case 'increase':
            await this.handleQuantityChange(productId, 1);
            break;
          case 'decrease':
            await this.handleQuantityChange(productId, -1);
            break;
          case 'remove':
            await this.handleRemoveItem(productId);
            break;
        }
      } catch (error) {
        this.ui.showNotification(error.message, 'error');
      } finally {
        this.ui.setLoading(false);
      }
    });
  }

  async handleQuantityChange(productId, change) {
    const item = this.findCartItem(productId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity < 1) {
      await this.handleRemoveItem(productId);
      return;
    }

    const { data } = await this.service.updateQuantity(productId, newQuantity);
    this.cart = data;
    this.updateDisplay();
  }

  async handleRemoveItem(productId) {
    const { data } = await this.service.removeItem(productId);
    this.cart = data;
    this.updateDisplay();
  }

  async addToCart(product, quantity = 1) {
    try {
      console.log('ShoppingCart addToCart:', { product, quantity });

      if (!product || !product.id) {
        console.error('Invalid product:', product);
        this.ui.showNotification('Invalid product data', 'error');
        return;
      }

      this.ui.setLoading(true);

      const result = await this.service.addItem(product, quantity);
      console.log('Add to cart result:', result);

      if (result.success) {
        this.cart = result.data;
        this.updateDisplay();
        this.ui.showNotification('Item added to cart');
      } else {
        throw new Error(result.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error in addToCart:', error);
      this.ui.showNotification(error.message, 'error');
    } finally {
      this.ui.setLoading(false);
    }
  }

  updateDisplay() {
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    this.ui.updateCartCount(totalItems);
    this.ui.updateCartTotal(totalPrice);
    this.ui.renderCartItems(this.cart);
  }

  findCartItem(productId) {
    return this.cart.find((item) => item.product_id === productId);
  }
}

window.ShoppingCart = ShoppingCart;

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cart = new ShoppingCart();
});

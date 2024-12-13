class CartService {
  constructor() {
    this.storage = window.localStorage;
    this.CART_KEY = 'shopping_cart';
  }

  getLocalCart() {
    const cart = this.storage.getItem(this.CART_KEY);
    return cart ? JSON.parse(cart) : [];
  }

  saveLocalCart(cart) {
    this.storage.setItem(this.CART_KEY, JSON.stringify(cart));
  }

  async fetchCart() {
    const response = await fetch('/api/cart');
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    const { data } = await response.json();
    return data;
  }

  async addItem(product, quantity = 1) {
    console.log('CartService addItem:', { product, quantity }); // Debug log

    if (!product || !product.id) {
      throw new Error('Invalid product data');
    }

    const response = await fetch('/api/cart/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({
        productId: product.id,
        quantity: quantity,
      }),
    });

    console.log('Response status:', response.status); // Debug log

    const data = await response.json();
    console.log('Response data:', data); // Debug log

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add item to cart');
    }

    return data;
  }

  async removeItem(productId) {
    const response = await fetch(`/api/cart/items/${productId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to remove item from cart');
    }

    return response.json();
  }

  async updateQuantity(productId, quantity) {
    const response = await fetch(`/api/cart/items/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to update quantity');
    }
    return response.json();
  }
}

window.CartService = CartService;

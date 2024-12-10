class ProductDisplay {
  // Class constructor - initializes the component
  constructor() {
    this.products = []; // Stores product data
    this.productsContainer = document.getElementById('products'); // Gets container element
    this.init(); // Starts the initialization process
  }
  // Initializes the component
  async init() {
    await this.fetchProducts(); // Fetch products from API
    this.renderProducts(); // Display products
    this.setupEventListeners(); // Set up click handlers
  }

  // Fetches products from the API
  async fetchProducts() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const result = await response.json();
      this.products = result.data; // Store the fetched products
    } catch (error) {
      console.error('Error fetching products:', error);
      this.handleError(error);
    }
  }

  // Renders products to the page
  renderProducts() {
    // If no products, show empty state
    if (!this.products.length) {
      this.productsContainer.innerHTML = this.getEmptyStateHTML();
      return;
    }

    // Map products to HTML and join them
    this.productsContainer.innerHTML = this.products
      .map((product) => this.getProductCardHTML(product))
      .join('');
  }

  getProductCardHTML(product) {
    return `
      <article class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 p-4">
        <div class="relative pb-[56.25%]">
          <img 
            src="${product.image}"
            alt="${this.escapeHtml(product.title)}"
            class="absolute top-0 left-0 w-full h-full object-cover"
            loading="lazy"
          >
        </div>
        <div class="p-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
            ${this.escapeHtml(product.title)}
          </h2>
          <p class="text-gray-600 text-sm mb-4 line-clamp-3">
            ${this.escapeHtml(product.description)}
          </p>
          <div class="flex justify-between items-center">
            <span class="text-lg font-bold text-primary">
              $${product.price.toFixed(2)}
            </span>
            <button 
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              data-product-id="${product.id}"
              aria-label="Add ${this.escapeHtml(product.title)} to cart" 
            >
              Add to Cart
            </button>
          </div>
        </div>
      </article>
    `;
  }

  getEmptyStateHTML() {
    return `
      <div class="text-center py-12">
        <h2 class="text-2l font-semibold text-gray-800 mb-4>
          No products available
        </h2>
        <p class="text-gray-600>
          Please check back later for our latest products.
        </p>
      </div>
    `;
  }

  setupEventListeners() {
    // Event delegation - listens for clicks on the container
    this.productsContainer.addEventListener('click', (e) => {
      // Find closet button with data-product-id
      const addToCartButton = e.target.closest('[data-product-id');
      if (addToCartButton) {
        const productId = addToCartButton.dataset.productId;
        this.handleAddToCart(productId, e);
      }
    });
  }

  handleAddToCart(productId) {
    // Prevent the click from bubbling up to document
    if (event) {
      event.stopImmediatePropagation();
    }
    // FInd the product in our products array
    const product = this.products.find((p) => p.id === Number(productId));
    if (product && window.cart) {
      window.cart.addToCart(product);
    }
  }

  handleError(error) {
    // Displays error message to user
    this.productsContainer.innerHTML = `
      <div class="text-center py-12">
        <p class="text-red-500">
          ${this.escapeHtml(error.message)}
        </p>
      </div>
    `;
  }

  // Prevents XSS attacks by escaping HTML characters
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, 'lt;')
      .replace(/>/g, 'gt;')
      .replace(/"/g, 'quot;')
      .replace(/'/g, '&#039;');
  }
}

// Initiaalize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProductDisplay();
});

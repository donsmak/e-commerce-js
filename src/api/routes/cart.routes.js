const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cart.controller');
const { validateRequest } = require('../middleware/validate');
const { addToCartValidator } = require('../validators/cart.validators');

// Create instance of CartController
const cartController = new CartController();

// Get all cart items
router.get('/', cartController.getCartItems);

// Add/update cart item
router.post(
  '/items',
  addToCartValidator.addItem, // Validation middleware
  validateRequest, // Validation check middleware
  cartController.addCartItem // Controller method
);

// Remove cart item
router.delete('/items/:productId', cartController.removeCartItem);

// Update item quantity
router.put(
  '/items/:productId',
  addToCartValidator.updateQuantity,
  validateRequest,
  cartController.updateQuantity
);

module.exports = router;

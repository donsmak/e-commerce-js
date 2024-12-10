const { body } = require('express-validator');

const addToCartValidator = {
  addItem: [
    body('productId').isInt().withMessage('Product ID must be a positive integer'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  updateQuantity: [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')],
};

module.exports = { addToCartValidator };

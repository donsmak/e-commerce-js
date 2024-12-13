const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');

router.get('/debug', async (req, res) => {
  try {
    const products = await db.query('SELECT * FROM products');
    res.json({
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
});

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
module.exports = router;

const db = require('../../db/connection');
const logger = require('../../utils/logger');

class ProductController {
  async getProducts(req, res) {
    try {
      const products = await db.query('SELECT * FROM products');

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      logger.error('Error in getProducts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
      });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await db.queryOne('SELECT * FROM products WHERE id = ?', [id]);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error('Error in getProductById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();

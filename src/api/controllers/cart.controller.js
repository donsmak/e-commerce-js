const db = require('../../db/connection');
const logger = require('../../utils/logger');
const { v4: uuidv4 } = require('uuid');

class CartController {
  constructor() {
    this.getCartItems = this.getCartItems.bind(this);
    this.addCartItem = this.addCartItem.bind(this);
    this.removeCartItem = this.removeCartItem.bind(this);
    this.updateQuantity = this.updateQuantity.bind(this);
  }
  async getCartItems(req, res) {
    try {
      let sessionId = req.cookies.cartSessionId;
      if (!sessionId) {
        sessionId = uuidv4();
        res.cookie('cartSessionId', sessionId, {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });
      }

      const items = await db.query(
        `
          SELECT ci.*, p.title, p.price, p.image, (p.price * ci.quantity) as total_price
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.session_id = ?
        `,
        [sessionId]
      );

      res.json({ success: true, data: items });
    } catch (error) {
      logger.error('Error getting cart items:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async addCartItem(req, res) {
    try {
      let sessionId = req.cookies.cartSessionId;
      if (!sessionId) {
        sessionId = uuidv4();
        res.cookie('cartSessionId', sessionId, {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });
      }

      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
      }

      const product = await db.queryOne('SELECT id FROM products WHERE id = ?', [productId]);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      await db.execute(
        `
        INSERT INTO cart_items (session_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON CONFLICT(session_id, product_id) DO UPDATE SET quantity = quantity + ?
        `,
        [sessionId, productId, quantity, quantity]
      );

      const updatedCart = await db.query(
        `
          SELECT ci.*, p.title, p.price, p.image, (p.price * ci.quantity) as total_price
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.session_id = ?
        `,
        [sessionId]
      );

      res.json({ success: true, data: updatedCart });
    } catch (error) {
      logger.error('Error adding to cart:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async removeCartItem(req, res) {
    try {
      const sessionId = req.cookies.cartSessionId;
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'No cart session found',
        });
      }

      const { productId } = req.params;

      await db.execute('DELETE FROM cart_items WHERE session_id = ? and product_id = ?', [
        sessionId,
        productId,
      ]);

      const updatedCart = await db.query(
        `
        SELECT ci.*, p.title, p.price, p.image, (p.price * ci.quantity) as total_price
        FROM cart_items ci
        JOIN products p on ci.product_id = p.id
        WHERE ci.session_id = ? 
        `,
        [sessionId]
      );
      res.json({
        success: true,
        data: updatedCart,
      });
    } catch (error) {
      logger.error('Error removing from cart:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateQuantity(req, res) {
    try {
      const sessionId = req.cookies.cartSessionId;
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'No cart session found',
        });
      }
      const { productId } = req.params;
      const { quantity } = req.body;

      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be at least 1',
        });
      }

      await db.execute(
        'UPDATE cart_items SET quantity = ? WHERE session_id = ? and product_id = ?',
        [quantity, sessionId, productId]
      );

      const updatedCart = await db.query(
        `
        SELECT
          ci.*,
          p.title,
          p.price,
          p.image,
          (p.price * ci.quantity) as total_price
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.session_id = ?
        `,
        [sessionId]
      );

      res.json({ success: true, data: updatedCart });
    } catch (error) {
      logger.error('Error updating quantity:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = CartController;

const db = require('./connection');

const CartDB = {
  // Get all cart items
  async getCartItems(userId = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT cart_items.*, products.title, products.price, products.image
        FROM cart_items
        JOIN products ON cart_items.product_id = products.id
        WHERE user_id = ?
      `;

      db.all(query, [userId], (err, items) => {
        if (err) {
          console.error('Error fetching cart items:', err);
          reject(err);
        } else {
          resolve(items);
        }
      });
    });
  },

  async upsertCartItem(productId, quantity, userId = 0) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const query = ` 
          INSERT INTO cart_items (user_id, product_id, quantity)
          VALUES (?, ?, ?)
          ON CONFLICT(user_id, product_id) DO UPDATE SET
          quantity = quantity + ?,
          updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND product_id = ?
         `;

        db.run(query, [userId, productId, quantity, quantity, userId, productId], function (err) {
          if (err) {
            console.error('Error upserting cart item:', err);
            db.run('ROLLBACK');
            reject(err);
          } else {
            db.run('COMMIT');
            resolve(this.lastID);
          }
        });
      });
    });
  },

  // Remove cart item
  async removeCartItem(productId, userId = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        DELETE FROM cart_items
        WHERE product_id = ? AND (user_id = ? OR user_id is NULL)
      `;

      db.run(query, [productId, userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  async updateQuantity(productId, quantity, userId = 0) {
    return new Promise((resolve, reject) => {
      const checkQuery = `
        SELECT id FROM cart_items
        WHERE product_id = ? and user_id = ?
      `;

      db.get(checkQuery, [productId, userId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          reject(new Error('Item not found in cart'));
          return;
        }

        const updateQuery = `
          UPDATE cart_items
          set quantity = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE product_id = ? AND user_id = ?
        `;

        db.run(updateQuery, [quantity, productId, userId], function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
    });
  },
};

module.exports = CartDB;

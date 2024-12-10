CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
  UNIQUE(session_id, product_id)
);

CREATE TRIGGER IF NOT EXISTS update_cart_items_timestamp
AFTER UPDATE ON cart_items
BEGIN
  UPDATE cart_items SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
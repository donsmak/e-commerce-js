const db = require('./connection');
const fs = require('fs').promises;
const path = require('path');
const Migrations = require('./migrations/Migrations');
const logger = require('../utils/logger');
const { seedProducts } = require('./seeds/products.seed');

async function initializeDatabase() {
  const migrations = new Migrations(db.getInstance());

  try {
    // Create migrations table
    await migrations.createMigrationTable();
    logger.info('Migrations table checked/created');

    // Get all migration files
    const migrationFiles = (await fs.readdir(path.join(__dirname, 'migrations')))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    // Execute migrations in order
    for (const migrationFile of migrationFiles) {
      const hasRun = await migrations.hasMigrationRun(migrationFile);

      if (!hasRun) {
        logger.info(`Running migration: ${migrationFile}`);

        const sql = await fs.readFile(path.join(__dirname, 'migrations', migrationFile), 'utf8');

        await new Promise((resolve, reject) => {
          db.getInstance().exec(sql, async (err) => {
            if (err) {
              reject(err);
            } else {
              await migrations.recordMigration(migrationFile);
              resolve();
            }
          });
        });

        logger.info(`Completed migration: ${migrationFile}`);
      }
    }

    // Check if products table is empty
    const productCount = await new Promise((resolve, reject) => {
      db.getInstance().get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });

    // Seed products if table is empty
    if (productCount === 0) {
      logger.info('Seeding products...');
      await seedProducts(db.getInstance());
      logger.info('Products seeded successfully');
    }

    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Error in database initialization:', error);
    throw error;
  }
}

async function checkDatabase() {
  const db = require('./connection');
  try {
    // Check products table
    const products = await db.query('SELECT COUNT(*) as count FROM products');
    console.log('Products in database:', products[0].count);

    // Check cart_items table
    const cartItems = await db.query('SELECT COUNT(*) as count FROM cart_items');
    console.log('Cart items in database:', cartItems[0].count);

    // Check table structure
    const productStructure = await db.query('PRAGMA table_info(products)');
    console.log('Products table structure:', productStructure);

    const cartStructure = await db.query('PRAGMA table_info(cart_items)');
    console.log('Cart items table structure:', cartStructure);
  } catch (error) {
    console.error('Database check failed:', error);
    throw error;
  }
}

// Only run initialization if this file is being run directly
if (require.main === module) {
  initializeDatabase()
    .then(checkDatabase)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;

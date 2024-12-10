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
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Execute migrations in order
    for (const migrationFile of migrationFiles) {
      const hasRun = await migrations.hasMigrationRun(migrationFile);
      
      if (!hasRun) {
        logger.info(`Running migration: ${migrationFile}`);
        
        const sql = await fs.readFile(
          path.join(__dirname, 'migrations', migrationFile),
          'utf8'
        );
        
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

// Only run initialization if this file is being run directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;


const db = require('./connection');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const config = require('../config');

async function resetDatabase() {
  // Ensure database directory exists
  const dbDir = path.join(process.cwd(), 'database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
  }
  try {
    const database = db.getInstance();

    await new Promise((resolve, reject) => {
      database.serialize(() => {
        logger.info('Dropping existing tables...');
        database.run('DROP TABLE IF EXISTS migrations');
        database.run('DROP TABLE IF EXISTS cart_items');
        database.run('DROP TABLE IF EXISTS products');
        resolve();
      });
    });

    logger.info('Database reset successful');
  } catch (error) {
    logger.error('Error resetting database:', error);
    throw error;
  }
}

if (require.main === module) {
  resetDatabase()
    .then(() => {
      logger.info('Database reset successful');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Error resetting database:', error);
      process.exit(1);
    });
}
module.exports = resetDatabase;

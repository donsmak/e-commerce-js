const axios = require('axios');
const logger = require('../../utils/logger');

async function seedProducts(database) {
  try {
    logger.info('Fetching products from Fake Store API...');
    const response = await axios.get('https://fakestoreapi.com/products', {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const products = response.data;
    logger.info(`Fetched ${products.length} products from API`);

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('No products received from API');
    }

    return new Promise((resolve, reject) => {
      database.serialize(() => {
        database.run('BEGIN TRANSACTION');

        const insertPromises = products.map(product => {
          const { title, description, price, category, image } = product;
          
          return new Promise((resolveInsert, rejectInsert) => {
            database.run(
              `INSERT INTO products (title, description, price, category, image) 
               VALUES (?, ?, ?, ?, ?)`,
              [title, description, price, category, image],
              function(err) {
                if (err) {
                  logger.error(`Failed to insert product ${title}:`, err);
                  rejectInsert(err);
                } else {
                  logger.debug(`Inserted product: ${title}`);
                  resolveInsert();
                }
              }
            );
          });
        });

        Promise.all(insertPromises)
          .then(() => {
            database.run('COMMIT', (err) => {
              if (err) {
                logger.error('Error committing transaction:', err);
                database.run('ROLLBACK');
                reject(err);
              } else {
                logger.info(`Successfully seeded ${products.length} products`);
                resolve();
              }
            });
          })
          .catch(error => {
            logger.error('Error during seeding:', error);
            database.run('ROLLBACK');
            reject(error);
          });
      });
    });
  } catch (error) {
    logger.error('Error in seedProducts:', error);
    throw error;
  }
}

module.exports = { seedProducts };

const dotenvFlow = require('dotenv-flow');
const path = require('path');

// Load environment variables based on NODE_ENV
dotenvFlow.config({
  path: path.resolve(process.cwd()),
  node_env: process.env.NODE_ENV || 'development',
});

const config = {
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  server: {
    port: parseInt(process.env.PORT, 10) || 5000,
    host: process.env.HOST || 'localhost',
  },
  db: {
    path: path.join(process.cwd(), 'database/database.sqlite'),
  },
  debug: process.env.DEBUG === 'true',
};

// Freeze the config object to prevent modifications
module.exports = Object.freeze(config);

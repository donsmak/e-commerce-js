const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    if (this.db) return this.db;

    const dbPath = path.resolve(process.cwd(), 'database/database.sqlite');

    try {
      this.db = new sqlite3.Database(
        dbPath,
        sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        (err) => {
          if (err) {
            logger.error('Database connection error:', err);
            throw err;
          }
          logger.info(`Connected to SQlite database at: ${dbPath}`);
        }
      );

      this.db.run('PRAGMA foreign_keys = ON');
      return this.db;
    } catch (error) {
      logger.error('Error connecting to database:', error);
      throw error;
    }
  }

  getInstance() {
    if (!this.db) {
      this.connect();
    }
    return this.db;
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.getInstance().all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Database query error:', err);
          reject(err);
        }
        resolve(rows);
      });
    });
  }

  queryOne(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.getInstance().run(sql, params, (err, row) => {
        if (err) {
          logger.error('Database query error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  execute(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.getInstance().run(sql, params, function (err) {
        if (err) {
          logger.error('Database execute error:', err);
          reject(err);
        } else {
          resolve({
            lastID: this.lastID,
            changes: this.changes,
          });
        }
      });
    });
  }
}

const database = new Database();
database.connect();

module.exports = database;

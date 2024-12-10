class Migrations {
  constructor(db) {
    this.db = db;
  }

  async createMigrationTable() {
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async hasMigrationRun(migrationName) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT id FROM migrations WHERE name = ?', [migrationName], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      });
    });
  }

  async recordMigration(migrationName) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO migrations (name) VALUES (?)', [migrationName], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = Migrations;

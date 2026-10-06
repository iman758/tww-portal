const fs = require('fs');
const path = require('path');

const sourceDb = path.join(process.cwd(), 'backend', 'dev.db');
const targetDb = '/tmp/dev.db';

try {
  if (fs.existsSync(sourceDb)) {
    if (!fs.existsSync(targetDb)) {
      fs.copyFileSync(sourceDb, targetDb);
      console.log('Database copied to /tmp successfully');
    }
  } else {
    console.error('Source database not found at:', sourceDb);
  }
} catch (e) {
  console.error('Failed to copy database:', e);
}

process.env.DATABASE_URL = 'file:/tmp/dev.db';

const app = require('../backend/src/server');
module.exports = app;


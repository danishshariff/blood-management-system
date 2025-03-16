const { Pool } = require('pg');
const dbConfig = require('../config/db.config');

const pool = new Pool(dbConfig);

// Test database connection
pool.connect((err, client, done) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Successfully connected to database');
        done();
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect()
}; 
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE || 'blood_bank_management',
    port: process.env.PG_PORT || 5432
});

async function setupSessionTable() {
    try {
        // Read the SQL file
        const sqlFile = await fs.readFile(path.join(__dirname, '../config/session.sql'), 'utf8');
        
        // Execute the SQL
        await pool.query(sqlFile);
        
        console.log('Session table created successfully');
    } catch (error) {
        console.error('Error creating session table:', error);
    } finally {
        await pool.end();
    }
}

setupSessionTable(); 
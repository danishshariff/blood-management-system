require('dotenv').config();

module.exports = {
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE || 'blood_bank_management',
    port: process.env.PG_PORT || 5432,
    ssl: false
}; 
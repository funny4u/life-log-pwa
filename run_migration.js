const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const client = new Client({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sql = fs.readFileSync('migration_category_settings.sql', 'utf8');
        await client.query(sql);
        console.log('Migration applied successfully');
    } catch (err) {
        console.error('Migration failed', err);
    } finally {
        await client.end();
    }
}

run();

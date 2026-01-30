const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function run() {
    console.log('Checking env:', process.env.POSTGRES_URL ? 'Loaded' : 'Not Loaded');
    if (process.env.POSTGRES_URL) console.log('URL starts with:', process.env.POSTGRES_URL.substring(0, 10));

    const client = new Client({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sql = fs.readFileSync('migration_fix_schema.sql', 'utf8');
        await client.query(sql);
        console.log('Migration applied successfully');
    } catch (err) {
        console.error('Migration failed', err);
    } finally {
        await client.end();
    }
}

run();

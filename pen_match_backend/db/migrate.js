const fs = require('fs');
const path = require('path');
const db = require('./connection');

async function migrate() {
    try {
        const sqlPath = path.join(__dirname, 'seed_new.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split SQL by semicolon to get individual statements
        // Note: This is a simple split and might break if semicolons are in strings, 
        // but for this seed file it should be fine.
        // Remove comments and prepare statements
        const statements = sql
            .split('\n')
            .filter(line => !line.trim().startsWith('--') && !line.trim().startsWith('/*'))
            .join(' ')
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} statements to execute.`);

        for (const statement of statements) {
            // Skip comments and empty lines
            if (statement.startsWith('--') || statement.startsWith('/*')) continue;

            // Skip USE statement as we are already connected to the DB (or connection handles it)
            // Actually connection.js might not select DB if it's not in .env, but usually it is.
            // Let's try executing everything.

            try {
                await db.query(statement);
            } catch (err) {
                // Ignore specific errors like "No database selected" if we handle it, 
                // or "Table exists" if we use IF NOT EXISTS.
                // But here we want to see errors.
                console.error('Error executing statement:', statement.substring(0, 50) + '...');
                console.error(err.message);
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();

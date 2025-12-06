const db = require('./connection');

async function migrateEmail() {
    try {
        console.log('Starting Email migration...');

        // 1. Add email column if not exists
        try {
            // 1. Add email column
            await db.query(`ALTER TABLE users ADD COLUMN email VARCHAR(100) AFTER phone`);

            // 2. Add Unique Index
            try {
                await db.query(`CREATE UNIQUE INDEX idx_email ON users(email)`);
            } catch (e) { console.log('Index might already exist'); }

            // 3. Make phone nullable
            await db.query(`ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NULL`);

            console.log('✅ Added email column and modified phone to be nullable.');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Email column already exists.');
            } else {
                console.error('⚠️ Error altering table:', error.message);
            }
        }

        console.log('Migration completed.');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateEmail();

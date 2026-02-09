require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false
});

const resetAdminPassword = async () => {
    try {
        console.log('🔄 Connecting to database...');

        // Generate proper bcrypt hash for "admin123"
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('🔄 Updating admin password...');
        console.log('New hash:', hashedPassword);

        // Check if admin exists
        const check = await pool.query("SELECT id FROM users WHERE email = 'admin@svp.com'");

        if (check.rows.length > 0) {
            await pool.query("UPDATE users SET password_hash = $1 WHERE email = 'admin@svp.com'", [hashedPassword]);
        } else {
            await pool.query(`
                INSERT INTO users (email, password_hash, first_name, last_name, role)
                VALUES ('admin@svp.com', $1, 'Admin', 'User', 'admin')
            `, [hashedPassword]);
        }

        console.log('✅ Admin password reset successfully!');
        console.log('Email: admin@svp.com');
        console.log('Password: admin123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
};

resetAdminPassword();

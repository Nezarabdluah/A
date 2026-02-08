require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const sql = require('mssql/msnodesqlv8');
const bcrypt = require('bcryptjs');

const config = {
    server: '(localdb)\\MSSQLLocalDB',
    database: process.env.DB_NAME || 'svp_database',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true
    }
};

const resetAdminPassword = async () => {
    let pool;

    try {
        console.log('🔄 Connecting to database...');
        pool = await sql.connect(config);

        // Generate proper bcrypt hash for "admin123"
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('🔄 Updating admin password...');
        console.log('New hash:', hashedPassword);

        // Delete existing admin user and recreate
        await pool.request().query(`DELETE FROM users WHERE email = 'admin@svp.com'`);

        await pool.request()
            .input('email', sql.NVarChar, 'admin@svp.com')
            .input('password_hash', sql.NVarChar, hashedPassword)
            .input('first_name', sql.NVarChar, 'Admin')
            .input('last_name', sql.NVarChar, 'User')
            .input('role', sql.NVarChar, 'admin')
            .query(`
                INSERT INTO users (email, password_hash, first_name, last_name, role)
                VALUES (@email, @password_hash, @first_name, @last_name, @role)
            `);

        console.log('✅ Admin password reset successfully!');
        console.log('Email: admin@svp.com');
        console.log('Password: admin123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (pool) await pool.close();
    }
};

resetAdminPassword();

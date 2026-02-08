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

const resetUserPassword = async () => {
    let pool;

    try {
        console.log('🔄 Connecting to database...');
        pool = await sql.connect(config);

        // Reset password for alshamirlobad@gmail.com to "user123"
        const email = 'alshamirlobad@gmail.com';
        const password = 'user123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('🔄 Updating user password...');

        // Update password in users table
        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password_hash', sql.NVarChar, hashedPassword)
            .query(`UPDATE users SET password_hash = @password_hash WHERE email = @email`);

        console.log('✅ User password reset successfully!');
        console.log('Email:', email);
        console.log('Password:', password);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (pool) await pool.close();
    }
};

resetUserPassword();

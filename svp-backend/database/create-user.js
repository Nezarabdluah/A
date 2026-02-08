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

const createUserFromApplicant = async () => {
    let pool;

    try {
        console.log('🔄 Connecting to database...');
        pool = await sql.connect(config);

        const email = 'alshamirlobad@gmail.com';
        const password = 'user123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if user already exists
        const existing = await pool.request()
            .input('email', sql.NVarChar, email)
            .query(`SELECT id FROM users WHERE email = @email`);

        if (existing.recordset.length > 0) {
            // Update password
            await pool.request()
                .input('email', sql.NVarChar, email)
                .input('password_hash', sql.NVarChar, hashedPassword)
                .query(`UPDATE users SET password_hash = @password_hash WHERE email = @email`);
            console.log('✅ Updated existing user password!');
        } else {
            // Create new user
            await pool.request()
                .input('email', sql.NVarChar, email)
                .input('password_hash', sql.NVarChar, hashedPassword)
                .input('first_name', sql.NVarChar, 'Ahmed')
                .input('last_name', sql.NVarChar, 'Ali')
                .input('role', sql.NVarChar, 'user')
                .query(`
                    INSERT INTO users (email, password_hash, first_name, last_name, role)
                    VALUES (@email, @password_hash, @first_name, @last_name, @role)
                `);
            console.log('✅ Created new user!');
        }

        console.log('');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('');
        console.log('Now you can login at /auth/login');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (pool) await pool.close();
    }
};

createUserFromApplicant();

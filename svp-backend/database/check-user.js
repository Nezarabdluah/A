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

const checkUser = async () => {
    let pool;

    try {
        console.log('🔄 Connecting to database...');
        pool = await sql.connect(config);

        // Check user in users table
        const result = await pool.request()
            .query(`SELECT id, email, password_hash, role FROM users WHERE email = 'alshamirlobad@gmail.com'`);

        console.log('User in users table:', result.recordset);

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const testPassword = 'user123';
            const match = await bcrypt.compare(testPassword, user.password_hash);
            console.log('Password "user123" matches:', match);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (pool) await pool.close();
    }
};

checkUser();

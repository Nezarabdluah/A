require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const sql = require('mssql/msnodesqlv8');

const config = {
    server: '(localdb)\\MSSQLLocalDB',
    database: process.env.DB_NAME || 'svp_database',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true
    }
};

const updateSchema = async () => {
    let pool;

    try {
        console.log('🔄 Connecting to database...');
        pool = await sql.connect(config);

        console.log('🔄 Update schema for Auth...');

        // 1. Create otp_codes table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'otp_codes')
            CREATE TABLE otp_codes (
                id INT PRIMARY KEY IDENTITY(1,1),
                email NVARCHAR(255) NOT NULL,
                code NVARCHAR(10) NOT NULL,
                expiry DATETIME NOT NULL,
                created_at DATETIME DEFAULT GETDATE()
            )
        `);
        console.log('✅ Created otp_codes table');

        // 2. Add password_hash to applicants if not exists
        const checkCol = await pool.request().query(`
            SELECT * FROM sys.columns 
            WHERE Name = N'password_hash' 
            AND Object_ID = Object_ID(N'applicants')
        `);

        if (checkCol.recordset.length === 0) {
            await pool.request().query(`
                ALTER TABLE applicants 
                ADD password_hash NVARCHAR(255)
            `);
            console.log('✅ Added password_hash to applicants');
        } else {
            console.log('ℹ️ password_hash already exists');
        }

        // 3. Add is_verified to applicants if not exists
        const checkColVerified = await pool.request().query(`
            SELECT * FROM sys.columns 
            WHERE Name = N'is_verified' 
            AND Object_ID = Object_ID(N'applicants')
        `);

        if (checkColVerified.recordset.length === 0) {
            await pool.request().query(`
                ALTER TABLE applicants 
                ADD is_verified BIT DEFAULT 0
            `);
            console.log('✅ Added is_verified to applicants');
        } else {
            console.log('ℹ️ is_verified already exists');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (pool) await pool.close();
    }
};

updateSchema();

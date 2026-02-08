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

const checkOTP = async () => {
    let pool;
    try {
        pool = await sql.connect(config);

        console.log('--- Current Time Check ---');
        const timeCheck = await pool.request().query("SELECT GETDATE() as db_time, SYSUTCDATETIME() as db_utc_time");
        console.log('DB Time (GETDATE):', timeCheck.recordset[0].db_time);
        console.log('DB UTC Time:', timeCheck.recordset[0].db_utc_time);
        console.log('App Time (Date.now):', new Date());

        console.log('\n--- OTP Codes ---');
        const result = await pool.request().query("SELECT * FROM otp_codes ORDER BY created_at DESC");
        console.table(result.recordset);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (pool) await pool.close();
    }
};

checkOTP();

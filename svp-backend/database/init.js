require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const sql = require('mssql/msnodesqlv8');

const config = {
    server: '(localdb)\\MSSQLLocalDB',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true
    }
};

const dbName = process.env.DB_NAME || 'svp_database';

const initDatabase = async () => {
    let pool;

    try {
        // Connect to master database first
        console.log('🔄 Connecting to SQL Server LocalDB...');
        pool = await sql.connect({ ...config, database: 'master' });

        // Create database if not exists
        console.log('🔄 Creating database...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${dbName}')
            BEGIN
                CREATE DATABASE ${dbName}
            END
        `);

        // Switch to the new database
        await pool.close();
        pool = await sql.connect({ ...config, database: dbName });

        console.log('🔄 Creating tables...');

        // Users table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
            CREATE TABLE users (
                id INT PRIMARY KEY IDENTITY(1,1),
                email NVARCHAR(255) UNIQUE NOT NULL,
                password_hash NVARCHAR(255) NOT NULL,
                first_name NVARCHAR(100),
                last_name NVARCHAR(100),
                role NVARCHAR(20) DEFAULT 'user',
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE()
            )
        `);

        // Certificates table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'certificates')
            CREATE TABLE certificates (
                id INT PRIMARY KEY IDENTITY(1,1),
                certificate_serial NVARCHAR(50) UNIQUE NOT NULL,
                passport_number NVARCHAR(50) NOT NULL,
                holder_name NVARCHAR(255),
                issue_date DATE,
                expiry_date DATE,
                status NVARCHAR(20) DEFAULT 'Valid',
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE()
            )
        `);

        // Labor Results table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'labor_results')
            CREATE TABLE labor_results (
                id INT PRIMARY KEY IDENTITY(1,1),
                passport_number NVARCHAR(50) NOT NULL,
                occupation_key NVARCHAR(50),
                nationality_code NVARCHAR(10),
                exam_date DATE,
                score INT,
                result NVARCHAR(20) DEFAULT 'Passed',
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE()
            )
        `);

        // Support Tickets table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'support_tickets')
            CREATE TABLE support_tickets (
                id INT PRIMARY KEY IDENTITY(1,1),
                name NVARCHAR(255),
                email NVARCHAR(255),
                subject NVARCHAR(255),
                description NVARCHAR(MAX),
                status NVARCHAR(20) DEFAULT 'Open',
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE()
            )
        `);

        // Insert sample data
        console.log('🔄 Inserting sample data...');

        // Sample certificate
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM certificates WHERE certificate_serial = '792063687')
            INSERT INTO certificates (certificate_serial, passport_number, holder_name, issue_date, expiry_date, status)
            VALUES ('792063687', 'XZ4134442', 'John Doe', '2024-01-15', '2026-01-15', 'Valid')
        `);

        // Sample labor result
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM labor_results WHERE passport_number = 'XZ4134442')
            INSERT INTO labor_results (passport_number, occupation_key, nationality_code, exam_date, score, result)
            VALUES ('XZ4134442', '93110', 'PK', '2024-01-15', 85, 'Passed')
        `);

        // Sample admin user (password: admin123)
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM users WHERE email = 'admin@svp.com')
            INSERT INTO users (email, password_hash, first_name, last_name, role)
            VALUES ('admin@svp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin')
        `);

        console.log('✅ Database initialized successfully!');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
    } finally {
        if (pool) await pool.close();
    }
};

initDatabase();

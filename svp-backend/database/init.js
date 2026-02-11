require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false
});

const initDatabase = async () => {
    try {
        console.log('🔄 Connecting to PostgreSQL...');

        // Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                role VARCHAR(20) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Certificates table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS certificates (
                id SERIAL PRIMARY KEY,
                certificate_serial VARCHAR(50) UNIQUE NOT NULL,
                passport_number VARCHAR(50) NOT NULL,
                holder_name VARCHAR(255),
                occupation VARCHAR(255),
                issue_date DATE,
                expiry_date DATE,
                status VARCHAR(20) DEFAULT 'Valid',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Labor Results table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS labor_results (
                id SERIAL PRIMARY KEY,
                passport_number VARCHAR(50) NOT NULL,
                occupation_key VARCHAR(50),
                nationality_code VARCHAR(10),
                exam_date DATE,
                score INT,
                result VARCHAR(20) DEFAULT 'Passed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Support Tickets table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS support_tickets (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255),
                subject VARCHAR(255),
                description TEXT,
                status VARCHAR(20) DEFAULT 'Open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Applicants table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS applicants (
                id SERIAL PRIMARY KEY,
                passport_number VARCHAR(50) UNIQUE NOT NULL,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                no_first_name BOOLEAN DEFAULT FALSE,
                no_last_name BOOLEAN DEFAULT FALSE,
                nationality VARCHAR(100),
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                country_code VARCHAR(10),
                passport_image VARCHAR(255),
                
                -- Step 2 fields
                occupation_key VARCHAR(50),
                employer_name VARCHAR(255),
                work_experience_years INT,
                
                -- Step 3 Contact Info
                address TEXT,
                city VARCHAR(100),
                postal_code VARCHAR(20),
                emergency_contact_name VARCHAR(255),
                emergency_contact_phone VARCHAR(50),
                
                -- Step 4 Verification
                verification_code VARCHAR(100),
                verification_status VARCHAR(50) DEFAULT 'Pending',
                
                -- Status
                password_hash VARCHAR(255),
                status VARCHAR(50) DEFAULT 'Pending',
                is_verified INT DEFAULT 0,
                current_step INT DEFAULT 1,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // OTP Codes table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS otp_codes (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                code VARCHAR(10) NOT NULL,
                expiry TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('🔄 inserting sample data...');

        // Sample certificate
        await pool.query(`
            INSERT INTO certificates (certificate_serial, passport_number, holder_name, issue_date, expiry_date, status)
            VALUES ('792063687', 'XZ4134442', 'John Doe', '2024-01-15', '2026-01-15', 'Valid')
            ON CONFLICT (certificate_serial) DO NOTHING
        `);

        // Sample labor result
        // Note: labor_results doesn't have a unique constraint on passport_number in the schema above, 
        // unlike certificates. We'll simplify and just insert if empty or ignore duplicates based on logic if needed.
        // For init script idempotency, usage of IF NOT EXISTS or checking count is good.
        // Here we just use a simple check for safety.
        const laborCheck = await pool.query("SELECT id FROM labor_results WHERE passport_number = 'XZ4134442'");
        if (laborCheck.rows.length === 0) {
            await pool.query(`
                INSERT INTO labor_results (passport_number, occupation_key, nationality_code, exam_date, score, result)
                VALUES ('XZ4134442', '93110', 'PK', '2024-01-15', 85, 'Passed')
            `);
        }

        // Sample admin user (password: admin123)
        await pool.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, role)
            VALUES ('admin@svp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin')
            ON CONFLICT (email) DO NOTHING
        `);

        console.log('✅ Database initialized successfully!');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
    } finally {
        await pool.end();
    }
};

initDatabase();

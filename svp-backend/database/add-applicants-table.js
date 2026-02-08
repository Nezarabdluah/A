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

const addApplicantsTable = async () => {
    let pool;

    try {
        console.log('🔄 Connecting to database...');
        pool = await sql.connect(config);

        console.log('🔄 Creating applicants table...');

        // Applicants table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'applicants')
            CREATE TABLE applicants (
                id INT PRIMARY KEY IDENTITY(1,1),
                passport_number NVARCHAR(50) UNIQUE NOT NULL,
                first_name NVARCHAR(100),
                last_name NVARCHAR(100),
                no_first_name BIT DEFAULT 0,
                no_last_name BIT DEFAULT 0,
                nationality NVARCHAR(50),
                email NVARCHAR(255),
                phone NVARCHAR(50),
                country_code NVARCHAR(10),
                passport_image NVARCHAR(255),
                
                -- Step 2 fields
                occupation_key NVARCHAR(50),
                employer_name NVARCHAR(255),
                work_experience_years INT,
                
                -- Step 3 Contact Info
                address NVARCHAR(500),
                city NVARCHAR(100),
                postal_code NVARCHAR(20),
                emergency_contact_name NVARCHAR(255),
                emergency_contact_phone NVARCHAR(50),
                
                -- Step 4 Verification
                verification_code NVARCHAR(20),
                verification_status NVARCHAR(20) DEFAULT 'Pending',
                
                -- Status
                status NVARCHAR(30) DEFAULT 'Pending',
                current_step INT DEFAULT 1,
                
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE()
            )
        `);

        console.log('✅ Applicants table created successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (pool) await pool.close();
    }
};

addApplicantsTable();

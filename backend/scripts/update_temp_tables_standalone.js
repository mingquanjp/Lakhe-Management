const pool = require('../src/config/database');

const updateTables = async () => {
  try {
    console.log('Dropping and recreating tables for standalone data...');

    // Drop existing tables
    await pool.query('DROP TABLE IF EXISTS temporary_residents CASCADE');
    await pool.query('DROP TABLE IF EXISTS temporary_absences CASCADE');

    // Recreate Temporary Residents Table (Standalone)
    await pool.query(`
      CREATE TABLE temporary_residents (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        identity_card_number VARCHAR(20),
        dob DATE,
        gender VARCHAR(10),
        permanent_address TEXT,
        temporary_address TEXT,
        phone_number VARCHAR(20),
        email VARCHAR(100),
        job VARCHAR(100),
        workplace TEXT,
        host_name VARCHAR(100),
        relationship_with_host VARCHAR(100),
        reason TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table temporary_residents recreated.');

    // Recreate Temporary Absences Table (Standalone)
    await pool.query(`
      CREATE TABLE temporary_absences (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        identity_card_number VARCHAR(20),
        dob DATE,
        gender VARCHAR(10),
        permanent_address TEXT,
        temporary_address TEXT,
        reason TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table temporary_absences recreated.');

    process.exit(0);
  } catch (error) {
    console.error('Error updating tables:', error);
    process.exit(1);
  }
};

updateTables();
const pool = require('../src/config/database');

const createTables = async () => {
  try {
    console.log('Checking/Creating tables...');

    // Temporary Residents Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS temporary_residents (
        id SERIAL PRIMARY KEY,
        host_household_id INTEGER REFERENCES households(household_id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        identity_card_number VARCHAR(20),
        dob DATE,
        gender VARCHAR(10),
        home_address TEXT,
        reason TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table temporary_residents checked/created.');

    // Temporary Absences Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS temporary_absences (
        id SERIAL PRIMARY KEY,
        resident_id INTEGER REFERENCES residents(resident_id),
        destination_address TEXT,
        reason TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table temporary_absences checked/created.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
};

createTables();
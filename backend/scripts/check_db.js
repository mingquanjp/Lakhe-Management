const pool = require('../src/config/database');

const checkDatabase = async () => {
  try {
    console.log('Checking database connection...');
    const client = await pool.connect();
    console.log('Connected to database successfully!');

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('Tables in database:');
    res.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
};

checkDatabase();

const fs = require('fs');
const pool = require('../config/database');

async function runMockData() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Đang import dữ liệu...\n');
    
    const sqlFile = fs.readFileSync('./src/mock_data_final-2.sql', 'utf8');
    await client.query(sqlFile);
    
    console.log('✅ Import thành công!\n');
    
    const result = await client.query(`
      SELECT 'Households' as table_name, count(*) as total FROM households
      UNION ALL
      SELECT 'Residents', count(*) FROM residents
      UNION ALL
      SELECT 'Fees', count(*) FROM fees
      UNION ALL
      SELECT 'Payment History', count(*) FROM payment_history
    `);
    
    console.log('📊 KẾT QUẢ:');
    result.rows.forEach(row => console.log(`   ${row.table_name}: ${row.total}`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

runMockData();
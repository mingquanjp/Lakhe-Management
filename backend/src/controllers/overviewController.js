const pool = require("../config/database");

const getOverviewData = async (req, res) => {
  try {
    // 1. Thống kê số liệu (Cards) 
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM households WHERE deleted_at IS NULL AND status IN ('Active', 'Temporary')) AS total_households,
        (SELECT COUNT(*) FROM residents WHERE deleted_at IS NULL AND status IN ('Permanent', 'Temporary')) AS total_residents,
        (SELECT COUNT(*) FROM residents WHERE deleted_at IS NULL AND status = 'Temporary') AS temporary_residents,
        (SELECT COUNT(*) FROM temporary_absences WHERE start_date <= CURRENT_DATE AND (end_date IS NULL OR end_date >= CURRENT_DATE)) AS absent_residents
    `;
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];

    // 2. Biểu đồ biến động dân số
    const populationQuery = `
      SELECT 
        TO_CHAR(registration_date, 'Tháng MM') as name,
        COUNT(*) FILTER (WHERE status = 'Permanent') as total,
        COUNT(*) FILTER (WHERE status = 'Temporary') as temp
      FROM residents 
      WHERE deleted_at IS NULL 
        AND registration_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
      GROUP BY TO_CHAR(registration_date, 'Tháng MM'), DATE_TRUNC('month', registration_date)
      ORDER BY DATE_TRUNC('month', registration_date) ASC
    `;
    const popResult = await pool.query(populationQuery);

    // 3. Thống kê nhóm tuổi
    const ageQuery = `
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(dob)) < 6 THEN 'Mầm non'
          WHEN EXTRACT(YEAR FROM AGE(dob)) BETWEEN 6 AND 10 THEN 'Cấp 1'
          WHEN EXTRACT(YEAR FROM AGE(dob)) BETWEEN 11 AND 14 THEN 'Cấp 2'
          WHEN EXTRACT(YEAR FROM AGE(dob)) BETWEEN 15 AND 17 THEN 'Cấp 3'
          WHEN EXTRACT(YEAR FROM AGE(dob)) BETWEEN 18 AND 60 THEN 'Lao động'
          ELSE 'Nghỉ hưu'
        END as name,
        COUNT(*) as value
      FROM residents
      WHERE deleted_at IS NULL AND status IN ('Permanent', 'Temporary')
      GROUP BY 1
    `;
    const ageResult = await pool.query(ageQuery);
    
    const ageColors = {
      'Mầm non': '#9ba6fa', 'Cấp 1': '#5ce1e6', 'Cấp 2': '#000000',
      'Cấp 3': '#74b9ff', 'Lao động': '#c4a6fa', 'Nghỉ hưu': '#55efc4'
    };
    const formattedAgeData = ageResult.rows.map(item => ({
      ...item,
      value: parseInt(item.value),
      fill: ageColors[item.name] || '#8884d8'
    }));

    // 4. Thống kê giới tính
    const genderQuery = `
      SELECT 
        CASE WHEN gender = 'Male' THEN 'Nam' ELSE 'Nữ' END as name,
        COUNT(*) as value
      FROM residents
      WHERE deleted_at IS NULL AND status IN ('Permanent', 'Temporary')
      GROUP BY gender
    `;
    const genderResult = await pool.query(genderQuery);
    const formattedGenderData = genderResult.rows.map(item => ({
      ...item,
      value: parseInt(item.value)
    }));

    // --- 5. HOẠT ĐỘNG GẦN ĐÂY ---
    // Lấy 10 hoạt động mới nhất từ change_history
    const activityQuery = `
      SELECT 
        ch.change_type,
        ch.change_date,
        u.full_name as performer_name,             -- Tên cán bộ
        h.household_code,                          -- Mã hộ khẩu
        CONCAT(r.first_name, ' ', r.last_name) as resident_name, -- Tên nhân khẩu
        f.fee_name                                
      FROM change_history ch
      LEFT JOIN users u ON ch.changed_by_user_id = u.user_id
      LEFT JOIN households h ON ch.household_id = h.household_id
      LEFT JOIN residents r ON ch.resident_id = r.resident_id
      LEFT JOIN fees f ON ch.fee_id = f.fee_id     
      ORDER BY ch.change_date DESC
      LIMIT 10
    `;
    const activityResult = await pool.query(activityQuery);

    res.status(200).json({
      success: true,
      data: {
        stats: [
          { title: "Tổng số hộ khẩu", value: stats.total_households, change: "---", isPositive: true },
          { title: "Tổng số nhân khẩu", value: stats.total_residents, change: "---", isPositive: true },
          { title: "Số nhân khẩu tạm trú", value: stats.temporary_residents, change: "---", isPositive: true },
          { title: "Số nhân khẩu tạm vắng", value: stats.absent_residents, change: "---", isPositive: false },
        ],
        populationData: popResult.rows.map(r => ({...r, total: parseInt(r.total), temp: parseInt(r.temp)})),
        ageData: formattedAgeData,
        genderData: formattedGenderData,
        recentActivities: activityResult.rows 
      }
    });

  } catch (error) {
    console.error("Lỗi lấy dữ liệu Overview:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = { getOverviewData };
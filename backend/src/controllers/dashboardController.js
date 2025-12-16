const pool = require("../config/database");

const getPopulationStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default date range if not provided (e.g., last 20 years)
    const start = startDate || "2005-08-15";
    const end = endDate || "2025-08-15";

    // 1. Summary Cards (Snapshot at End Date or Activity within Range)

    // Total Population (Permanent Residents registered before End Date)
    // Note: This is an approximation of "Population at that time" based on registration date.
    // It excludes people who registered after the End Date.
    const totalPopulationQuery = await pool.query(
      "SELECT COUNT(*) FROM residents WHERE status = 'Permanent' AND registration_date <= $1",
      [end]
    );
    const totalPopulation = parseInt(totalPopulationQuery.rows[0].count);

    // Total Households (Active households created before End Date)
    const totalHouseholdsQuery = await pool.query(
      "SELECT COUNT(*) FROM households WHERE status = 'Active' AND date_created <= $1",
      [end]
    );
    const totalHouseholds = parseInt(totalHouseholdsQuery.rows[0].count);

    // Total Temporary Residents (Valid during the selected range)
    // Logic: Overlap between [temp_start, temp_end] and [start, end]
    // temp_start <= end AND temp_end >= start
    const totalTempResidentsQuery = await pool.query(
      "SELECT COUNT(*) FROM residents WHERE status = 'Temporary' AND temp_start_date <= $2 AND temp_end_date >= $1",
      [start, end]
    );
    const totalTempResidents = parseInt(totalTempResidentsQuery.rows[0].count);

    // Total Temporary Absences (Valid during the selected range)
    // Logic: Overlap between [start_date, end_date] and [start, end]
    const totalTempAbsencesQuery = await pool.query(
      "SELECT COUNT(*) FROM temporary_absences WHERE start_date <= $2 AND end_date >= $1",
      [start, end]
    );
    const totalTempAbsences = parseInt(totalTempAbsencesQuery.rows[0].count);

    // 2. Charts
    // Gender Statistics (Based on population at End Date)
    const genderStatsQuery = await pool.query(
      "SELECT gender, COUNT(*) FROM residents WHERE status = 'Permanent' AND registration_date <= $1 GROUP BY gender",
      [end]
    );
    const genderStats = genderStatsQuery.rows;

    // Age Statistics (Age calculated at End Date)
    const ageStatsQuery = await pool.query(
      `
      SELECT
        CASE
          WHEN EXTRACT(YEAR FROM AGE($1, dob)) BETWEEN 0 AND 5 THEN '0-5'
          WHEN EXTRACT(YEAR FROM AGE($1, dob)) BETWEEN 6 AND 10 THEN '6-10'
          WHEN EXTRACT(YEAR FROM AGE($1, dob)) BETWEEN 11 AND 14 THEN '11-14'
          WHEN EXTRACT(YEAR FROM AGE($1, dob)) BETWEEN 15 AND 17 THEN '15-17'
          WHEN EXTRACT(YEAR FROM AGE($1, dob)) BETWEEN 18 AND 60 THEN '18-60'
          ELSE '60+'
        END as age_group,
        COUNT(*) as count
      FROM residents
      WHERE status = 'Permanent' AND registration_date <= $1
      GROUP BY age_group
    `,
      [end]
    );
    const ageStats = ageStatsQuery.rows;

    // 3. Fluctuations (Within Date Range)
    // Newborns
    const newbornsQuery = await pool.query(
      "SELECT COUNT(*) FROM change_history WHERE change_type = 'NewBirth' AND change_date BETWEEN $1 AND $2",
      [start, end]
    );
    const newborns = parseInt(newbornsQuery.rows[0].count);

    // Deceased
    const deceasedQuery = await pool.query(
      "SELECT COUNT(*) FROM change_history WHERE change_type = 'Death' AND change_date BETWEEN $1 AND $2",
      [start, end]
    );
    const deceased = parseInt(deceasedQuery.rows[0].count);

    // Moved Out
    const movedOutQuery = await pool.query(
      "SELECT COUNT(*) FROM change_history WHERE change_type = 'MoveOut' AND change_date BETWEEN $1 AND $2",
      [start, end]
    );
    const movedOut = parseInt(movedOutQuery.rows[0].count);

    // Moved In (New registrations that are NOT newborns)
    // Logic: Count residents registered in range, excluding those with 'NewBirth' history
    const movedInQuery = await pool.query(
      `
      SELECT COUNT(*) 
      FROM residents r
      WHERE r.registration_date BETWEEN $1 AND $2
      AND r.status = 'Permanent'
      AND NOT EXISTS (
        SELECT 1 FROM change_history ch 
        WHERE ch.resident_id = r.resident_id 
        AND ch.change_type = 'NewBirth'
      )
    `,
      [start, end]
    );
    const movedIn = parseInt(movedInQuery.rows[0].count);

    res.json({
      success: true,
      data: {
        summary: {
          totalPopulation,
          totalHouseholds,
          totalTempResidents,
          totalTempAbsences,
        },
        charts: {
          gender: genderStats,
          age: ageStats,
        },
        fluctuations: {
          newborns,
          deceased,
          movedOut,
          movedIn,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching population stats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu thống kê",
      error: error.message,
    });
  }
};

module.exports = {
  getPopulationStats,
};

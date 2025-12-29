import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "../../../components/commons";
import {
  calendarIcon,
  userIcon,
  tombIcon,
  upArrowIcon,
} from "../../../assets/icons";
import "./PopulationDashboard.css";
import { getDashboardStats } from "../../../utils/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// CountUp Component for animated numbers
const CountUp = ({ end, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = countRef.current;
    const finalValue = end;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Ease out quart
      const easeProgress = 1 - Math.pow(1 - progress, 4);

      const currentCount =
        startValue + (finalValue - startValue) * easeProgress;
      setCount(currentCount);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        countRef.current = finalValue;
        setCount(finalValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{Math.floor(count).toLocaleString()}</>;
};

const PopulationDashboard = () => {
  // Calculate default dates
  const today = new Date();
  const defaultEnd = today.toISOString().split("T")[0];

  const twentyYearsAgo = new Date();
  twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
  const defaultStart = twentyYearsAgo.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const handleStartDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate && endDate && newDate > endDate) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
      return;
    }
    setStartDate(newDate);
  };

  const handleEndDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate && startDate && newDate < startDate) {
      alert("Ngày kết thúc không được nhỏ hơn ngày bắt đầu!");
      return;
    }
    setEndDate(newDate);
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats(startDate, endDate);
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDateClick = (ref) => {
    if (ref.current) {
      ref.current.showPicker();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Prepare data for charts
  const genderData =
    stats?.charts?.gender.map((item) => ({
      name: item.gender === "Male" ? "Nam" : "Nữ",
      value: parseInt(item.count),
    })) || [];

  const COLORS = ["#F2C94C", "#56CCF2"]; // Yellow for Male, Blue for Female (matching screenshot)

  const ageData =
    stats?.charts?.age.map((item) => ({
      name: item.age_group + " tuổi",
      value: parseInt(item.count),
    })) || [];

  // Sort age data to match the order in screenshot
  const ageOrder = ["0-5", "6-10", "11-14", "15-17", "18-60", "60+"];
  ageData.sort((a, b) => {
    const aKey = a.name.replace(" tuổi", "");
    const bKey = b.name.replace(" tuổi", "");
    return ageOrder.indexOf(aKey) - ageOrder.indexOf(bKey);
  });

  if (loading && !stats)
    return <div className="content">Đang tải dữ liệu...</div>;
  if (error) return <div className="content">Lỗi: {error}</div>;

  return (
    <div className="content">
      <h2 className="population-dashboard-title">Thống kê nhân khẩu</h2>

      {/* Date Filter Section */}
      <div className="date-filter-section">
        <div
          className="date-input-group"
          onClick={() => handleDateClick(startDateRef)}
        >
          <span className="date-label">Từ {formatDate(startDate)}</span>
          <img src={calendarIcon} alt="calendar" className="dashboard-icon" />
          <input
            type="date"
            ref={startDateRef}
            value={startDate}
            onChange={handleStartDateChange}
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>
        <div
          className="date-input-group"
          onClick={() => handleDateClick(endDateRef)}
        >
          <span className="date-label">Đến {formatDate(endDate)}</span>
          <img src={calendarIcon} alt="calendar" className="dashboard-icon" />
          <input
            type="date"
            ref={endDateRef}
            value={endDate}
            onChange={handleEndDateChange}
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-grid">
        <Card className="summary-card blue-light">
          <div className="card-title">Tổng số nhân khẩu</div>
          <div className="card-value-row">
            <span className="card-value">
              <CountUp end={stats?.summary?.totalPopulation || 0} />
            </span>
          </div>
        </Card>
        <Card className="summary-card blue-light">
          <div className="card-title">Tổng số hộ khẩu</div>
          <div className="card-value-row">
            <span className="card-value">
              <CountUp end={stats?.summary?.totalHouseholds || 0} />
            </span>
          </div>
        </Card>
        <Card className="summary-card blue-light">
          <div className="card-title">Tổng số tạm trú</div>
          <div className="card-value-row">
            <span className="card-value">
              <CountUp end={stats?.summary?.totalTempResidents || 0} />
            </span>
          </div>
        </Card>
        <Card className="summary-card blue-light">
          <div className="card-title">Tổng số tạm vắng</div>
          <div className="card-value-row">
            <span className="card-value">
              <CountUp end={stats?.summary?.totalTempAbsences || 0} />
            </span>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Gender Chart */}
        <Card className="chart-card">
          <h3 className="chart-title">Thống kê giới tính</h3>
          <div className="chart-content-wrapper">
            <div style={{ width: "50%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {genderData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Số người"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend-custom">
              {genderData.map((entry, index) => (
                <div key={index} className="legend-item-row">
                  <span
                    className="dot"
                    style={{ backgroundColor: COLORS[index] }}
                  ></span>
                  <span className="label">{entry.name}</span>
                  <span className="value">
                    {stats?.summary?.totalPopulation > 0
                      ? (
                          (entry.value / stats.summary.totalPopulation) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Age Chart */}
        <Card className="chart-card">
          <h3 className="chart-title">Thống kê nhân khẩu</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ageData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barSize={30}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E0E0E0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#828282", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#828282", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(value) => [value, "Số người"]}
                />
                <Bar dataKey="value" fill="#E0E0E0" radius={[4, 4, 0, 0]}>
                  {ageData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name.includes("18-60") ? "#E0E0E0" : "#E0E0E0"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Fluctuations Section */}
      <div>
        <h3 className="fluctuations-title">Biến động</h3>
        <div className="fluctuations-grid">
          <Card className="fluctuation-card">
            <div className="fluctuation-header">
              <span className="fluctuation-label">Nhân khẩu mới sinh</span>
              <img src={userIcon} alt="user" className="dashboard-icon" />
            </div>
            <div className="fluctuation-value">
              <CountUp end={stats?.fluctuations?.newborns || 0} />
            </div>
          </Card>
          <Card className="fluctuation-card">
            <div className="fluctuation-header">
              <span className="fluctuation-label">Chuyển tới</span>
              <img
                src={upArrowIcon}
                alt="in"
                className="dashboard-icon"
                style={{ transform: "rotate(180deg)" }}
              />
            </div>
            <div className="fluctuation-value">
              <CountUp end={stats?.fluctuations?.movedIn || 0} />
            </div>
          </Card>
          <Card className="fluctuation-card">
            <div className="fluctuation-header">
              <span className="fluctuation-label">Chuyển đi</span>
              <img src={upArrowIcon} alt="out" className="dashboard-icon" />
            </div>
            <div className="fluctuation-value">
              <CountUp end={stats?.fluctuations?.movedOut || 0} />
            </div>
          </Card>
          <Card className="fluctuation-card">
            <div className="fluctuation-header">
              <span className="fluctuation-label">Qua đời</span>
              <img src={tombIcon} alt="death" className="dashboard-icon" />
            </div>
            <div className="fluctuation-value">
              <CountUp end={stats?.fluctuations?.deceased || 0} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PopulationDashboard;

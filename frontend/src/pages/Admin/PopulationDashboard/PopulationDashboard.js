import React, { useState, useEffect, useRef } from "react";
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
  CartesianGrid
} from "recharts";

// Inline SVG Icons for the dashboard
const TrendUpIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23 6L13.5 15.5L8.5 10.5L1 18"
      stroke="#27AE60"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 6H23V12"
      stroke="#27AE60"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PopulationDashboard = () => {
  const [startDate, setStartDate] = useState("2005-08-15");
  const [endDate, setEndDate] = useState("2025-08-15");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const fetchStats = async () => {
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
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

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
  const genderData = stats?.charts?.gender.map(item => ({
    name: item.gender === 'Male' ? 'Nam' : 'Nữ',
    value: parseInt(item.count)
  })) || [];

  const COLORS = ['#F2C94C', '#56CCF2']; // Yellow for Male, Blue for Female (matching screenshot)

  const ageData = stats?.charts?.age.map(item => ({
    name: item.age_group + ' tuổi',
    value: parseInt(item.count)
  })) || [];

  // Sort age data to match the order in screenshot
  const ageOrder = ['0-5', '6-10', '11-14', '15-17', '18-60', '60+'];
  ageData.sort((a, b) => {
    const aKey = a.name.replace(' tuổi', '');
    const bKey = b.name.replace(' tuổi', '');
    return ageOrder.indexOf(aKey) - ageOrder.indexOf(bKey);
  });

  if (loading && !stats) return <div className="content">Đang tải dữ liệu...</div>;
  if (error) return <div className="content">Lỗi: {error}</div>;

  return (
    <div className="content">
      <h2 className="population-dashboard-title">Tổng quan</h2>
      
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
            onChange={(e) => setStartDate(e.target.value)}
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
            onChange={(e) => setEndDate(e.target.value)}
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
            <span className="card-value">{stats?.summary?.totalPopulation.toLocaleString()}</span>
            {/* Placeholder trend */}
            {/* <span className="card-trend positive">
              +11.01% <TrendUpIcon />
            </span> */}
          </div>
        </Card>
        <Card className="summary-card blue-light">
          <div className="card-title">Tổng số hộ khẩu</div>
          <div className="card-value-row">
            <span className="card-value">{stats?.summary?.totalHouseholds.toLocaleString()}</span>
          </div>
        </Card>
        <Card className="summary-card blue-light">
          <div className="card-title">Tổng số tạm trú</div>
          <div className="card-value-row">
            <span className="card-value">{stats?.summary?.totalTempResidents.toLocaleString()}</span>
          </div>
        </Card>
        <Card className="summary-card blue-light">
          <div className="card-title">Tổng số tạm vắng</div>
          <div className="card-value-row">
            <span className="card-value">{stats?.summary?.totalTempAbsences.toLocaleString()}</span>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Gender Chart */}
        <Card className="chart-card">
          <h3 className="chart-title">Thống kê giới tính</h3>
          <div className="gender-chart-container" style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend" style={{ marginLeft: '20px' }}>
              {genderData.map((entry, index) => (
                <div key={index} className="legend-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="dot" style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index], marginRight: '8px' }}></span>
                  <span className="label" style={{ marginRight: '8px' }}>{entry.name}</span>
                  <span className="value" style={{ fontWeight: 'bold' }}>
                    {((entry.value / stats?.summary?.totalPopulation) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Age Chart */}
        <Card className="chart-card">
          <h3 className="chart-title">Thống kê nhân khẩu</h3>
          <div className="age-chart-container" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ageData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="#E0E0E0" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Fluctuation Section */}
      <div className="fluctuation-section">
        <h3 className="section-title">Biến động</h3>
        <div className="fluctuation-grid">
          <Card className="fluctuation-card gray">
            <div className="fluctuation-header">
              <span>Nhân khẩu mới sinh</span>
              <img src={userIcon} alt="user" className="dashboard-icon" />
            </div>
            <div className="fluctuation-value">{stats?.fluctuations?.newborns.toLocaleString()}</div>
          </Card>
          <Card className="fluctuation-card gray">
            <div className="fluctuation-header">
              <span>Chuyển tới</span>
              <img
                src={upArrowIcon}
                alt="arrow down"
                className="dashboard-icon rotate-180"
              />
            </div>
            <div className="fluctuation-value">{stats?.fluctuations?.movedIn.toLocaleString()}</div>
          </Card>
          <Card className="fluctuation-card gray">
            <div className="fluctuation-header">
              <span>Chuyển đi</span>
              <img
                src={upArrowIcon}
                alt="arrow up"
                className="dashboard-icon"
              />
            </div>
            <div className="fluctuation-value">{stats?.fluctuations?.movedOut.toLocaleString()}</div>
          </Card>
          <Card className="fluctuation-card gray">
            <div className="fluctuation-header">
              <span>Qua đời</span>
              <img src={tombIcon} alt="deceased" className="dashboard-icon" />
            </div>
            <div className="fluctuation-value">{stats?.fluctuations?.deceased.toLocaleString()}</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PopulationDashboard;

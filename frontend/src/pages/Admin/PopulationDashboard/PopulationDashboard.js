import React, { useState, useRef } from "react";
import { Card } from "../../../components/commons";
import {
  calendarIcon,
  userIcon,
  tombIcon,
  upArrowIcon,
} from "../../../assets/icons";
import "./PopulationDashboard.css";

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
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

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

  return (
    <div className="content">
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
            <span className="card-value">7,265</span>
            <span className="card-trend positive">
              +11.01% <TrendUpIcon />
            </span>
          </div>
        </Card>
        <Card className="summary-card blue-light">
          <div className="card-title">Tổng số hộ khẩu</div>
          <div className="card-value-row">
            <span className="card-value">200</span>
          </div>
        </Card>
        <Card className="summary-card blue-light">
          <div className="card-title">Tổng số tạm trú</div>
          <div className="card-value-row">
            <span className="card-value">30</span>
          </div>
        </Card>
        <Card className="summary-card blue-light">
          <div className="card-title">Tổng số tạm vắng</div>
          <div className="card-value-row">
            <span className="card-value">20</span>
          </div>
        </Card>
      </div>
      {/* Charts Section */}
      <div className="charts-grid">
        {/* Gender Chart */}
        <Card className="chart-card">
          <h3 className="chart-title">Thống kê giới tính</h3>
          <div className="gender-chart-container">
            <div className="donut-chart">
              <div className="donut-hole"></div>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="dot male"></span>
                <span className="label">Nam</span>
                <span className="value">60.5%</span>
              </div>
              <div className="legend-item">
                <span className="dot female"></span>
                <span className="label">Nữ</span>
                <span className="value">39.5%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Age Chart */}
        <Card className="chart-card">
          <h3 className="chart-title">Thống kê nhân khẩu</h3>
          <div className="age-chart-container">
            <div className="bar-chart">
              {[
                { label: "0-5 tuổi", value: 70 },
                { label: "6-10 tuổi", value: 35 },
                { label: "11-14 tuổi", value: 95 },
                { label: "15-17 tuổi", value: 70 },
                { label: "18-60 tuổi", value: 70 },
                { label: "60+ tuổi", value: 70 },
              ].map((item, index) => (
                <div key={index} className="bar-column">
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ height: `${item.value}%` }}
                    ></div>
                  </div>
                  <span className="bar-label">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="y-axis">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
          </div>
        </Card>
      </div>{" "}
      {/* Fluctuation Section */}
      <div className="fluctuation-section">
        <h3 className="section-title">Biến động</h3>
        <div className="fluctuation-grid">
          <Card className="fluctuation-card gray">
            <div className="fluctuation-header">
              <span>Nhân khẩu mới sinh</span>
              <img src={userIcon} alt="user" className="dashboard-icon" />
            </div>
            <div className="fluctuation-value">50</div>
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
            <div className="fluctuation-value">100</div>
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
            <div className="fluctuation-value">30</div>
          </Card>
          <Card className="fluctuation-card gray">
            <div className="fluctuation-header">
              <span>Qua đời</span>
              <img src={tombIcon} alt="deceased" className="dashboard-icon" />
            </div>
            <div className="fluctuation-value">100</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PopulationDashboard;

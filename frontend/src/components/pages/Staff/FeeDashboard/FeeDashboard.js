import React, { useState } from "react";
import "./FeeDashboard.css";
import Sidebar from "../../../layout/Sidebar";
import Header from "../../../layout/Header";
import { Card } from "../../../commons";
import { Button } from "../../../commons";
import { searchIcon } from "../../../../assets/icons";

const FeeDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Phí vệ sinh 2025");

  // Sample data
  const stats = [
    {
      value: "1 950 000 VND",
      label: "Tổng tiền đã thu",
    },
    {
      value: "3 000 000 VND",
      label: "Tổng tiền thu dự kiến",
    },
    {
      value: "1100",
      label: "Số hộ đã nộp",
    },
    {
      value: "300",
      label: "Số hộ chưa nộp",
    },
  ];

  const tableColumns = [
    { key: "householdId", title: "Số hộ khẩu" },
    { key: "ownerName", title: "Họ và tên chủ hộ" },
    { key: "houseNumber", title: "Số nhà" },
    { key: "commune", title: "Xã" },
    { key: "district", title: "Huyện" },
    { key: "status", title: "Trạng thái" },
  ];

  const tableData = [];

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content">
          {/* Banner chọn đợt thu/đóng góp */}
          <div className="period-selector-banner">
            <div className="period-selector-left">
              <span className="period-selector-label">
                Chọn đợt thu/đóng góp
              </span>
            </div>
            <div className="period-selector-right">
              <select
                className="period-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="Phí vệ sinh 2025">Phí vệ sinh 2025</option>
                <option value="Phí vệ sinh 2024">Phí vệ sinh 2024</option>
                <option value="Phí vệ sinh 2023">Phí vệ sinh 2023</option>
              </select>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Detailed Statistical Table */}
          <Card
            title="Bảng thống kê chi tiết"
            subtitle={`Chi tiết thu phí: ${selectedPeriod}`}
            actions={
              <div className="table-actions">
                <div className="table-search">
                  <img src={searchIcon} alt="Search" className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="table-search-input"
                  />
                </div>
                <Button variant="outline" size="small">
                  Filters
                </Button>
                <Button variant="outline" size="small">
                  Export
                </Button>
              </div>
            }
          >
            <div className="table-wrapper">
              <table className="staff-table">
                <thead>
                  <tr>
                    {tableColumns.map((column, index) => (
                      <th key={index} className="table-header">
                        {column.title}
                        <span className="sort-arrow">▼</span>
                      </th>
                    ))}
                    <th className="table-header"></th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumns.length + 1} className="table-empty">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    tableData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="table-row">
                        <td className="table-cell">{row.householdId}</td>
                        <td className="table-cell">{row.ownerName}</td>
                        <td className="table-cell">{row.houseNumber}</td>
                        <td className="table-cell">{row.commune}</td>
                        <td className="table-cell">{row.district}</td>
                        <td className="table-cell">
                          <span
                            className={`status-badge ${
                              row.status === "paid" ? "status-paid" : "status-unpaid"
                            }`}
                          >
                            {row.status === "paid" ? "• Đã nộp" : "• Chưa nộp"}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button className="table-menu-btn">⋮</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeeDashboard;

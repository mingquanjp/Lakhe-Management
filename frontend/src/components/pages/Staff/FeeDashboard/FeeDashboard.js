import React, { useState } from "react";
import "./FeeDashboard.css";
import { Card, Button } from "../../../commons";
import EnhancedTable from "../../../commons/Table/EnhancedTable";
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
    { 
      key: "householdId", 
      title: "Số hộ khẩu",
      headerRender: () => (
        <>
          Số hộ khẩu
          <span className="sort-arrow">▼</span>
        </>
      )
    },
    { 
      key: "ownerName", 
      title: "Họ và tên chủ hộ",
      headerRender: () => (
        <>
          Họ và tên chủ hộ
          <span className="sort-arrow">▼</span>
        </>
      )
    },
    { 
      key: "houseNumber", 
      title: "Số nhà",
      headerRender: () => (
        <>
          Số nhà
          <span className="sort-arrow">▼</span>
        </>
      )
    },
    { 
      key: "commune", 
      title: "Xã",
      headerRender: () => (
        <>
          Xã
          <span className="sort-arrow">▼</span>
        </>
      )
    },
    { 
      key: "district", 
      title: "Huyện",
      headerRender: () => (
        <>
          Huyện
          <span className="sort-arrow">▼</span>
        </>
      )
    },
    { 
      key: "status", 
      title: "Trạng thái",
      headerRender: () => (
        <>
          Trạng thái
          <span className="sort-arrow">▼</span>
        </>
      ),
      render: (value, row) => (
        <span
          className={`status-badge ${
            row.status === "paid" ? "status-paid" : "status-unpaid"
          }`}
        >
          {row.status === "paid" ? "• Đã nộp" : "• Chưa nộp"}
        </span>
      )
    },
    {
      title: "",
      headerRender: () => null,
      render: () => (
        <button className="table-menu-btn">⋮</button>
      )
    }
  ];

  const tableData = [];

  return (
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
              <EnhancedTable columns={tableColumns} data={tableData} className="staff-table" />
            </div>
          </Card>
    </div>
  );
};

export default FeeDashboard;

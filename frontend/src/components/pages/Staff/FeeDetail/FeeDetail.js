import React, { useState } from "react";
import "./FeeDetail.css";
import Sidebar from "../../../layout/Sidebar";
import Header from "../../../layout/Header";
import { Card, Button } from "../../../commons";
import { searchIcon } from "../../../../assets/icons";
import HouseholdDetailModal from "./HouseholdDetailModal";

const FeeDetail = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);

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
      label: "Số hộ còn nợ",
    },
  ];

  const tableColumns = [
    { key: "householdId", title: "Số hộ khẩu" },
    { key: "ownerName", title: "Họ tên chủ hộ" },
    { key: "houseNumber", title: "Số nhà" },
    { key: "status", title: "Trạng thái" },
    { key: "details", title: "Thông tin cụ thể" },
  ];

  const tableData = [
    {
      householdId: "H001",
      ownerName: "Nguyễn Minh Quân",
      houseNumber: "36",
      status: "paid",
    },
    {
      householdId: "H002",
      ownerName: "Trần Văn An",
      houseNumber: "36",
      status: "paid",
    },
    {
      householdId: "H003",
      ownerName: "Đinh Văn Phạm Việt",
      houseNumber: "36",
      status: "owing",
    },
    {
      householdId: "H004",
      ownerName: "Lê Thị Bình",
      houseNumber: "36",
      status: "paid",
    },
    {
      householdId: "H005",
      ownerName: "Tạ Hải Tùng",
      houseNumber: "36",
      status: "owing",
    },
    {
      householdId: "H006",
      ownerName: "Phạm Văn Đức",
      houseNumber: "36",
      status: "paid",
    },
    {
      householdId: "H007",
      ownerName: "Hoàng Thị Mai",
      houseNumber: "36",
      status: "paid",
    },
    {
      householdId: "H008",
      ownerName: "Trần Thế Hùng",
      houseNumber: "36",
      status: "owing",
    },
    {
      householdId: "H009",
      ownerName: "Nguyễn Văn Hùng",
      houseNumber: "36",
      status: "paid",
    },
    {
      householdId: "H010",
      ownerName: "Đỗ Thị Lan",
      houseNumber: "36",
      status: "paid",
    },
    {
      householdId: "H011",
      ownerName: "Đinh Viết Sang",
      houseNumber: "36",
      status: "owing",
    },
    {
      householdId: "H012",
      ownerName: "Vũ Văn Tuấn",
      houseNumber: "36",
      status: "paid",
    },
  ];

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content">
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
            actions={
              <div className="table-actions">
                <div className="table-search">
                  <img src={searchIcon} alt="Search" className="search-icon" />
                  <input
                    type="text"
                    placeholder="Q Search..."
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
                        <td className="table-cell">
                          <span
                            className={`status-badge ${
                              row.status === "paid" ? "status-paid" : "status-owing"
                            }`}
                          >
                            {row.status === "paid" ? "• Đã nộp" : "• Còn nợ"}
                          </span>
                        </td>
                        <td className="table-cell">
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => {
                              setSelectedHousehold(row);
                              setIsModalOpen(true);
                            }}
                          >
                            Xem chi tiết
                          </Button>
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

      {/* Household Detail Modal */}
      <HouseholdDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHousehold(null);
        }}
        household={selectedHousehold}
      />
    </div>
  );
};

export default FeeDetail;


import React, { useState, useEffect, useMemo } from "react";
import "./FeeDetail.css";
import { Card, Button } from "../../../components/commons";
import EnhancedTable from "../../../components/commons/Table/EnhancedTable";
import { searchIcon } from "../../../assets/icons";
import HouseholdDetailModal from "./HouseholdDetailModal";
import { fetchOverallStatistics, fetchAllHouseholdsWithPaymentSummary } from "../../../utils/api";

const FeeDetail = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Filter, Sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data khi component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsRes, householdsRes] = await Promise.all([
          fetchOverallStatistics(),
          fetchAllHouseholdsWithPaymentSummary()
        ]);
        
        if (statsRes.success) {
          setStatistics(statsRes.data);
        }
        if (householdsRes.success) {
          setHouseholds(householdsRes.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Format số tiền
  const formatMoney = (amount) => {
    if (!amount) return "0 VND";
    return new Intl.NumberFormat('vi-VN').format(amount) + " VND";
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter and sort data (all data, not paginated - for export)
  const filteredAndSortedData = useMemo(() => {
    let data = households.map(h => ({
      household_id: h.household_id,
      household_code: h.household_code,
      first_name: h.first_name || "",
      last_name: h.last_name || "",
      owner_name: h.owner_name || "Chưa có chủ hộ",
      address: h.address,
      member_count: parseInt(h.member_count) || 0,
      total_paid: parseInt(h.total_paid) || 0,
      status: h.status
    }));

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(item =>
        item.household_code.toLowerCase().includes(term) ||
        item.owner_name.toLowerCase().includes(term) ||
        item.address.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      data = data.filter(item => item.status === filterStatus);
    }

    // Apply sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        let aVal, bVal;
        
        // Special handling for Vietnamese name sorting (by last_name first, then first_name)
        if (sortConfig.key === "owner_name") {
          aVal = (a.last_name || "") + " " + (a.first_name || "");
          bVal = (b.last_name || "") + " " + (b.first_name || "");
        } else {
          aVal = a[sortConfig.key];
          bVal = b[sortConfig.key];
        }
        
        // Handle null/undefined
        aVal = aVal ?? "";
        bVal = bVal ?? "";
        
        // Numeric comparison for numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        
        // String comparison using localeCompare for proper Vietnamese sorting
        const comparison = String(aVal).localeCompare(String(bVal), 'vi');
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return data;
  }, [households, searchTerm, filterStatus, sortConfig]);

  // Paginated data for display
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage]);

  // Total pages
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Export to CSV (exports ALL filtered data, not just current page)
  const handleExport = () => {
    const headers = ["Số hộ khẩu", "Họ tên chủ hộ", "Địa chỉ", "Số thành viên", "Tổng đã nộp", "Trạng thái"];
    const csvData = filteredAndSortedData.map(row => [
      row.household_code,
      row.owner_name,
      row.address,
      row.member_count,
      row.total_paid,
      row.status === "paid" ? "Đã nộp đủ" : "Còn nợ"
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `danh_sach_ho_khau_thu_phi.csv`;
    link.click();
  };

  // Stats từ API
  const stats = statistics ? [
    { value: formatMoney(statistics.total_paid), label: "Tổng tiền đã thu" },
    { value: formatMoney(statistics.expected_total), label: "Tổng tiền thu dự kiến" },
    { value: statistics.total_households.toString(), label: "Tổng số hộ khẩu" },
    { value: statistics.active_fees.toString(), label: "Số khoản thu đang hoạt động" },
  ] : [
    { value: "0 VND", label: "Tổng tiền đã thu" },
    { value: "0 VND", label: "Tổng tiền thu dự kiến" },
    { value: "0", label: "Tổng số hộ khẩu" },
    { value: "0", label: "Số khoản thu đang hoạt động" },
  ];

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "▼";
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  const tableColumns = [
    { 
      key: "household_code", 
      title: "Số hộ khẩu",
      headerRender: () => (
        <span onClick={() => handleSort("household_code")} style={{ cursor: "pointer" }}>
          Số hộ khẩu
          <span className="sort-arrow">{getSortIcon("household_code")}</span>
        </span>
      )
    },
    { 
      key: "owner_name", 
      title: "Họ tên chủ hộ",
      headerRender: () => (
        <span onClick={() => handleSort("owner_name")} style={{ cursor: "pointer" }}>
          Họ tên chủ hộ
          <span className="sort-arrow">{getSortIcon("owner_name")}</span>
        </span>
      )
    },
    { 
      key: "address", 
      title: "Địa chỉ",
      headerRender: () => (
        <span onClick={() => handleSort("address")} style={{ cursor: "pointer" }}>
          Địa chỉ
          <span className="sort-arrow">{getSortIcon("address")}</span>
        </span>
      )
    },
    { 
      key: "member_count", 
      title: "Số thành viên",
      headerRender: () => (
        <span onClick={() => handleSort("member_count")} style={{ cursor: "pointer" }}>
          Số TV
          <span className="sort-arrow">{getSortIcon("member_count")}</span>
        </span>
      )
    },
    { 
      key: "total_paid", 
      title: "Tổng đã nộp",
      headerRender: () => (
        <span onClick={() => handleSort("total_paid")} style={{ cursor: "pointer" }}>
          Tổng đã nộp
          <span className="sort-arrow">{getSortIcon("total_paid")}</span>
        </span>
      ),
      render: (value) => formatMoney(value)
    },
    { 
      key: "status", 
      title: "Trạng thái",
      headerRender: () => (
        <span onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
          Trạng thái
          <span className="sort-arrow">{getSortIcon("status")}</span>
        </span>
      ),
      render: (value, row) => (
        <span
          className={`status-badge ${
            row.status === "paid" ? "status-paid" : "status-owing"
          }`}
        >
          {row.status === "paid" ? "• Đã nộp đủ" : "• Còn nợ"}
        </span>
      )
    },
    { 
      key: "details", 
      title: "Chi tiết",
      headerRender: () => "Chi tiết",
      render: (value, row) => (
        <Button
          variant="outline"
          size="small"
          onClick={() => {
            setSelectedHousehold(row);
            setIsModalOpen(true);
          }}
        >
          Xem
        </Button>
      )
    }
  ];

  if (error) {
    return <div className="content"><p>Lỗi: {error}</p></div>;
  }

  return (
    <div className="content">
          {/* Stat Cards */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="fee-stat-card">
                <div className="fee-stat-value">{stat.value}</div>
                <div className="fee-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Detailed Statistical Table */}
          <Card
            title="Danh sách hộ khẩu"
            subtitle={`(${filteredAndSortedData.length} hộ)`}
            actions={
              <div className="table-actions">
                <div className="table-search">
                  <img src={searchIcon} alt="Search" className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="table-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filter-dropdown-container">
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    Lọc {filterStatus !== "all" && `(${filterStatus === "paid" ? "Đã nộp đủ" : "Còn nợ"})`}
                  </Button>
                  {showFilterDropdown && (
                    <div className="filter-dropdown">
                      <div 
                        className={`filter-option ${filterStatus === "all" ? "active" : ""}`}
                        onClick={() => { setFilterStatus("all"); setShowFilterDropdown(false); }}
                      >
                        Tất cả
                      </div>
                      <div 
                        className={`filter-option ${filterStatus === "paid" ? "active" : ""}`}
                        onClick={() => { setFilterStatus("paid"); setShowFilterDropdown(false); }}
                      >
                        Đã nộp đủ
                      </div>
                      <div 
                        className={`filter-option ${filterStatus === "owing" ? "active" : ""}`}
                        onClick={() => { setFilterStatus("owing"); setShowFilterDropdown(false); }}
                      >
                        Còn nợ
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="small" onClick={handleExport}>
                  Xuất CSV
                </Button>
              </div>
            }
          >
            <div className="table-wrapper">
              {loading ? (
                <p>Đang tải dữ liệu...</p>
              ) : (
                <>
                  <EnhancedTable columns={tableColumns} data={paginatedData} className="staff-table" />
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        className="pagination-btn"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        ← Trước
                      </button>
                      <div className="pagination-info">
                        <span>Trang </span>
                        <input
                          type="number"
                          className="pagination-input"
                          min="1"
                          max={totalPages}
                          value={currentPage}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1 && value <= totalPages) {
                              setCurrentPage(value);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = parseInt(e.target.value);
                              if (value >= 1 && value <= totalPages) {
                                setCurrentPage(value);
                              } else if (value < 1) {
                                setCurrentPage(1);
                              } else if (value > totalPages) {
                                setCurrentPage(totalPages);
                              }
                            }
                          }}
                        />
                        <span> / {totalPages}</span>
                      </div>
                      <button 
                        className="pagination-btn"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Sau →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

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
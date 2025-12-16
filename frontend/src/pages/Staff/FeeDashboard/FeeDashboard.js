import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./FeeDashboard.css";
import { Card, Button, Loading } from "../../../components/commons";
import EnhancedTable from "../../../components/commons/Table/EnhancedTable";
import { searchIcon } from "../../../assets/icons";
import { 
  fetchFees, 
  fetchOverallStatistics,
  fetchAllHouseholdsWithPaymentSummary 
} from "../../../utils/api";

const FeeDashboard = () => {
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allFees, setAllFees] = useState([]);
  const [selectedFeeId, setSelectedFeeId] = useState(null);
  const [overallStats, setOverallStats] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all fees on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [feesResponse, statsResponse, householdsResponse] = await Promise.all([
          fetchFees(),
          fetchOverallStatistics(),
          fetchAllHouseholdsWithPaymentSummary()
        ]);

        if (feesResponse.success && feesResponse.data) {
          setAllFees(feesResponse.data);
          // Set first fee as default
          if (feesResponse.data.length > 0) {
            setSelectedFeeId(feesResponse.data[0].fee_id);
          }
        }

        if (statsResponse.success) {
          setOverallStats(statsResponse.data);
        }

        if (householdsResponse.success) {
          setHouseholds(householdsResponse.data || []);
        }

        setError(null);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle fee selection change
  const handlePeriodChange = (e) => {
    const newFeeId = e.target.value;
    setSelectedFeeId(newFeeId);
    // Navigate to detail page when selecting a fee
    navigate(`/staff/fee/${newFeeId}`);
  };

  // Sorting logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = households.filter(household => {
      const searchLower = searchTerm.toLowerCase();
      return (
        household.household_code?.toLowerCase().includes(searchLower) ||
        household.owner_name?.toLowerCase().includes(searchLower) ||
        household.address?.toLowerCase().includes(searchLower)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [households, searchTerm, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Stats cards data
  const stats = useMemo(() => {
    if (!overallStats) return [];
    
    return [
      {
        value: `${(overallStats.total_paid || 0).toLocaleString('vi-VN')} VND`,
        label: "Tổng tiền đã thu",
      },
      {
        value: `${(overallStats.expected_total || 0).toLocaleString('vi-VN')} VND`,
        label: "Tổng tiền thu dự kiến",
      },
      {
        value: (overallStats.total_households || 0).toLocaleString('vi-VN'),
        label: "Tổng số hộ",
      },
      {
        value: (overallStats.active_fees || 0).toLocaleString('vi-VN'),
        label: "Khoản thu đang hoạt động",
      },
    ];
  }, [overallStats]);

  // Get selected fee name
  const selectedFeeName = useMemo(() => {
    const fee = allFees.find(f => f.fee_id === selectedFeeId);
    return fee ? fee.fee_name : "Chọn đợt thu";
  }, [allFees, selectedFeeId]);

  // Table columns configuration
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
      title: "Họ và tên chủ hộ",
      headerRender: () => (
        <span onClick={() => handleSort("owner_name")} style={{ cursor: "pointer" }}>
          Họ và tên chủ hộ
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
      title: "Số nhân khẩu",
      headerRender: () => (
        <span onClick={() => handleSort("member_count")} style={{ cursor: "pointer" }}>
          Số nhân khẩu
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
      render: (value) => `${(value || 0).toLocaleString('vi-VN')} VND`
    },
    { 
      key: "unpaid_mandatory_fees", 
      title: "Phí chưa nộp",
      headerRender: () => (
        <span onClick={() => handleSort("unpaid_mandatory_fees")} style={{ cursor: "pointer" }}>
          Phí chưa nộp
          <span className="sort-arrow">{getSortIcon("unpaid_mandatory_fees")}</span>
        </span>
      )
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
      render: (value) => (
        <span
          className={`status-badge ${
            value === "paid" ? "status-paid" : "status-unpaid"
          }`}
        >
          {value === "paid" ? "• Đã nộp" : "• Còn nợ"}
        </span>
      )
    },
    {
      key: "actions",
      title: "",
      headerRender: () => null,
      render: (value, row) => (
        <Button
          variant="ghost"
          size="small"
          onClick={() => navigate(`/staff/household/${row.household_id}`)}
        >
          ⋮
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="content">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <Card>
          <div className="error-message">{error}</div>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="content">
      {/* Banner chọn đợt thu/đóng góp */}
      {/* Stat Cards */}
      {stats.length > 0 && (
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Statistical Table */}
      <Card
        title="Bảng thống kê chi tiết"
        subtitle={`Hiển thị ${paginatedData.length} / ${filteredAndSortedData.length} hộ khẩu`}
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
            <select 
              className="items-per-page-select"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
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
          <EnhancedTable 
            columns={tableColumns} 
            data={paginatedData} 
            className="staff-table" 
          />
        </div>

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
      </Card>
    </div>
  );
};

export default FeeDashboard;
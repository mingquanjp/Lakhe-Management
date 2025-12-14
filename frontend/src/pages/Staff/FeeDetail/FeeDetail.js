import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./FeeDetail.css";
import { Card, Button, Loading } from "../../../components/commons";
import EnhancedTable from "../../../components/commons/Table/EnhancedTable";
import { searchIcon } from "../../../assets/icons";
import HouseholdDetailModal from "./HouseholdDetailModal";
import { 
  fetchFees, 
  fetchFeeStatistics, 
  fetchHouseholdPaymentStatus 
} from "../../../utils/api";

const FeeDetail = () => {
  const { feeId: urlFeeId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allFees, setAllFees] = useState([]);
  const [selectedFeeId, setSelectedFeeId] = useState(urlFeeId || null);
  const [feeStatistics, setFeeStatistics] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);

  // Fetch all fees on mount
  useEffect(() => {
    const loadFees = async () => {
      try {
        const response = await fetchFees();
        if (response.success && response.data) {
          setAllFees(response.data);
          // Set first fee as default if no URL param
          if (!selectedFeeId && response.data.length > 0) {
            setSelectedFeeId(response.data[0].fee_id);
          }
        }
      } catch (err) {
        console.error("Error loading fees:", err);
        setError("Không thể tải danh sách khoản thu");
      }
    };
    loadFees();
  }, []); // Run once on mount

  // Fetch fee details when selectedFeeId changes
  useEffect(() => {
    if (!selectedFeeId) return;

    const loadFeeDetails = async () => {
      setLoading(true);
      try {
        const [statsResponse, householdsResponse] = await Promise.all([
          fetchFeeStatistics(selectedFeeId),
          fetchHouseholdPaymentStatus(selectedFeeId)
        ]);

        if (statsResponse.success) {
          setFeeStatistics(statsResponse.data);
        }

        if (householdsResponse.success) {
          setHouseholds(householdsResponse.data || []);
        }

        setError(null);
      } catch (err) {
        console.error("Error loading fee details:", err);
        setError("Không thể tải thông tin khoản thu");
      } finally {
        setLoading(false);
      }
    };

    loadFeeDetails();
  }, [selectedFeeId]);

  // Handle fee selection change
  const handleFeeChange = (e) => {
    const newFeeId = e.target.value;
    setSelectedFeeId(newFeeId);
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

  // Stats cards data
  const stats = useMemo(() => {
    if (!feeStatistics?.statistics) return [];
    
    const { statistics } = feeStatistics;
    return [
      {
        value: `${(statistics.total_paid || 0).toLocaleString('vi-VN')} VND`,
        label: "Tổng tiền đã thu",
      },
      {
        value: `${(statistics.expected_total || 0).toLocaleString('vi-VN')} VND`,
        label: "Tổng tiền thu dự kiến",
      },
      {
        value: (statistics.paid_households || 0).toLocaleString('vi-VN'),
        label: "Số hộ đã nộp",
      },
      {
        value: (statistics.unpaid_households || 0).toLocaleString('vi-VN'),
        label: "Số hộ còn nợ",
      },
    ];
  }, [feeStatistics]);

  // Table columns definition
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
            value === "paid" ? "status-paid" : "status-owing"
          }`}
        >
          {value === "paid" ? "• Đã nộp" : "• Còn nợ"}
        </span>
      )
    },
    { 
      key: "payment_date", 
      title: "Ngày nộp",
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
    },
    { 
      key: "amount_paid", 
      title: "Số tiền",
      render: (value) => value ? `${value.toLocaleString('vi-VN')} VND` : '-'
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

  if (loading && !feeStatistics) {
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
          <Button onClick={() => navigate('/staff/fees')}>Quay lại</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="content">
      {/* Dropdown chọn đợt thu */}
      {allFees.length > 0 && (
        <div className="fee-selector-section">
          <label htmlFor="feeSelect">Chọn đợt thu: </label>
          <select 
            id="feeSelect"
            value={selectedFeeId || ''} 
            onChange={handleFeeChange}
            className="fee-select-dropdown"
          >
            {allFees.map(fee => (
              <option key={fee.fee_id} value={fee.fee_id}>
                {fee.fee_name} ({new Date(fee.start_date).toLocaleDateString('vi-VN')})
              </option>
            ))}
          </select>
        </div>
      )}

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
          {loading ? (
            <Loading />
          ) : (
            <EnhancedTable 
              columns={tableColumns} 
              data={filteredAndSortedData} 
              className="staff-table" 
            />
          )}
        </div>
      </Card>

      {/* Household Detail Modal */}
      {selectedHousehold && (
        <HouseholdDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedHousehold(null);
          }}
          household={selectedHousehold}
        />
      )}
    </div>
  );
};

export default FeeDetail;

import React, { useState, useEffect } from "react";
import "./FeeDashboard.css";
import { Card, Button, Loading } from "../../../components/commons";
import EnhancedTable from "../../../components/commons/Table/EnhancedTable";
import { searchIcon } from "../../../assets/icons";
import { 
  getAllFees, 
  getFeeSummary, 
  getAllHouseholdsForFee 
} from "../../../services/feeService";

const FeeDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedFeeId, setSelectedFeeId] = useState(null);
  const [allFees, setAllFees] = useState([]);
  const [feeSummary, setFeeSummary] = useState(null);
  const [householdsData, setHouseholdsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Lấy danh sách tất cả khoản thu khi component mount
  useEffect(() => {
    fetchAllFees();
  }, []);

  const fetchAllFees = async () => {
    try {
      setLoading(true);
      const response = await getAllFees();
      
      if (response.success && response.data.length > 0) {
        setAllFees(response.data);
        // Tự động chọn khoản thu đầu tiên
        const firstFee = response.data[0];
        setSelectedFeeId(firstFee.fee_id);
        setSelectedPeriod(firstFee.fee_name);
        
        // Load data cho khoản thu đầu tiên
        await fetchFeeData(firstFee.fee_id);
      } else {
        setError('Chưa có khoản thu nào');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lấy thống kê và danh sách hộ cho một khoản thu cụ thể
  const fetchFeeData = async (feeId) => {
    try {
      setLoading(true);
      
      // Lấy tổng hợp thống kê
      const summaryResponse = await getFeeSummary(feeId);
      if (summaryResponse.success) {
        setFeeSummary(summaryResponse.data);
      }

      // Lấy danh sách tất cả hộ (cả đã nộp và chưa nộp)
      const householdsResponse = await getAllHouseholdsForFee(feeId);
      if (householdsResponse.success) {
        setHouseholdsData(householdsResponse.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching fee data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi thay đổi dropdown chọn đợt thu
  const handlePeriodChange = async (e) => {
    const selectedFeeName = e.target.value;
    setSelectedPeriod(selectedFeeName);
    
    const selectedFee = allFees.find(fee => fee.fee_name === selectedFeeName);
    if (selectedFee) {
      setSelectedFeeId(selectedFee.fee_id);
      await fetchFeeData(selectedFee.fee_id);
    }
  };

  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Cấu trúc stat cards từ feeSummary
  const stats = feeSummary ? [
    {
      value: formatCurrency(feeSummary.total_collected),
      label: "Tổng tiền đã thu",
    },
    {
      value: feeSummary.expected_total 
        ? formatCurrency(feeSummary.expected_total) 
        : "Không giới hạn",
      label: "Tổng tiền thu dự kiến",
    },
    {
      value: feeSummary.paid_households,
      label: "Số hộ đã nộp",
    },
    {
      value: feeSummary.unpaid_households,
      label: "Số hộ chưa nộp",
    },
  ] : [];

  // Cấu hình cột cho bảng
  const tableColumns = [
    { 
      key: "household_code", 
      title: "Số hộ khẩu",
      headerRender: () => (
        <>
          Số hộ khẩu
          <span className="sort-arrow">▼</span>
        </>
      )
    },
    { 
      key: "head_name", 
      title: "Họ và tên chủ hộ",
      headerRender: () => (
        <>
          Họ và tên chủ hộ
          <span className="sort-arrow">▼</span>
        </>
      )
    },
    { 
      key: "member_count", 
      title: "Số nhân khẩu",
      headerRender: () => (
        <>
          Số nhân khẩu
          <span className="sort-arrow">▼</span>
        </>
      ),
      render: (value) => value || '0'
    },
    { 
      key: "address", 
      title: "Địa chỉ",
      headerRender: () => (
        <>
          Địa chỉ
          <span className="sort-arrow">▼</span>
        </>
      )
    },
    { 
      key: "payment_status", 
      title: "Trạng thái",
      headerRender: () => (
        <>
          Trạng thái
          <span className="sort-arrow">▼</span>
        </>
      ),
      render: (value) => (
        <span
          className={`status-badge ${
            value === "Đã nộp" ? "status-paid" : "status-unpaid"
          }`}
        >
          {value === "Đã nộp" ? "• Đã nộp" : "• Chưa nộp"}
        </span>
      )
    },
    { 
      key: "payment_date", 
      title: "Ngày nộp",
      headerRender: () => (
        <>
          Ngày nộp
          <span className="sort-arrow">▼</span>
        </>
      ),
      render: (value) => formatDate(value)
    },
    {
      title: "",
      headerRender: () => null,
      render: () => (
        <button className="table-menu-btn">⋮</button>
      )
    }
  ];

  // Lọc dữ liệu theo search term
  const filteredData = householdsData.filter(household =>
    household.head_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    household.household_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    household.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !feeSummary) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="content">
        <div className="error-message">
          <p>Lỗi: {error}</p>
          <Button onClick={fetchAllFees}>Thử lại</Button>
        </div>
      </div>
    );
  }

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
            onChange={handlePeriodChange}
          >
            {allFees.map((fee) => (
              <option key={fee.fee_id} value={fee.fee_name}>
                {fee.fee_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      {feeSummary && (
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
        subtitle={`Chi tiết thu phí: ${selectedPeriod} (${filteredData.length} hộ)`}
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
          ) : filteredData.length > 0 ? (
            <EnhancedTable 
              columns={tableColumns} 
              data={filteredData} 
              className="staff-table" 
            />
          ) : (
            <div className="no-data">
              <p>Không có dữ liệu</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FeeDashboard;

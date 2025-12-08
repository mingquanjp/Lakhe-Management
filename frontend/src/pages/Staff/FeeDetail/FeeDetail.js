import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./FeeDetail.css";
import { Card, Button, Loading } from "../../../components/commons";
import EnhancedTable from "../../../components/commons/Table/EnhancedTable";
import { searchIcon } from "../../../assets/icons";
import HouseholdDetailModal from "./HouseholdDetailModal";
import { 
  getAllFees,
  getFeeSummary, 
  getAllHouseholdsForFee 
} from "../../../services/feeService";

const FeeDetail = () => {
  const { feeId } = useParams();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
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
        
        // Nếu có feeId từ URL, dùng nó, nếu không thì chọn fee đầu tiên
        const initialFeeId = feeId || response.data[0].fee_id;
        setSelectedFeeId(initialFeeId);
        
        await fetchFeeData(initialFeeId);
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
  const fetchFeeData = async (feeIdParam) => {
    try {
      setLoading(true);
      
      // Lấy tổng hợp thống kê
      const summaryResponse = await getFeeSummary(feeIdParam);
      if (summaryResponse.success) {
        setFeeSummary(summaryResponse.data);
      }

      // Lấy danh sách tất cả hộ (cả đã nộp và chưa nộp)
      const householdsResponse = await getAllHouseholdsForFee(feeIdParam);
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
  const handleFeeChange = async (e) => {
    const newFeeId = e.target.value;
    setSelectedFeeId(newFeeId);
    await fetchFeeData(newFeeId);
  };

  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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
      label: "Số hộ còn nợ",
    },
  ] : [];

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
      title: "Họ tên chủ hộ",
      headerRender: () => (
        <>
          Họ tên chủ hộ
          <span className="sort-arrow">▼</span>
        </>
      )
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
            value === "Đã nộp" ? "status-paid" : "status-owing"
          }`}
        >
          {value === "Đã nộp" ? "• Đã nộp" : "• Còn nợ"}
        </span>
      )
    },
    { 
      key: "details", 
      title: "Thông tin cụ thể",
      headerRender: () => (
        <>
          Thông tin cụ thể
          <span className="sort-arrow">▼</span>
        </>
      ),
      render: (value, row) => (
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

  const currentFee = allFees.find(f => f.fee_id === parseInt(selectedFeeId));

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
                {fee.fee_name}
              </option>
            ))}
          </select>
        </div>
      )}

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
        subtitle={currentFee ? `Chi tiết thu phí: ${currentFee.fee_name} (${filteredData.length} hộ)` : 'Chi tiết thu phí'}
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


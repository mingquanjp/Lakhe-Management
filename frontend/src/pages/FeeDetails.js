import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Table from '../components/commons/Table/Table';
import Button from '../components/commons/Button/Button';
import Modal from '../components/commons/Modal/Modal';
import PaymentForm from '../components/forms/Paymentform';
import { feeData, existedFeeData, householdDataByFee } from '../data/mockData';
import './FeeDetails.css';

const FeeDetail = () => {
  const { feeId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [currentFee, setCurrentFee] = useState(null);
  const [householdData, setHouseholdData] = useState([]);
  const [allFees, setAllFees] = useState([]);

  // Lấy thông tin đợt thu dựa vào feeId
  useEffect(() => {
    const fees = [...feeData, ...existedFeeData];
    setAllFees(fees);
    
    const fee = fees.find(f => f.id === parseInt(feeId));
    setCurrentFee(fee);

    // Lấy dữ liệu household cho đợt thu này
    const households = householdDataByFee[feeId] || [];
    setHouseholdData(households);
  }, [feeId]);

  // Xử lý khi thay đổi dropdown
  const handleFeeChange = (event) => {
    const selectedFeeId = event.target.value;
    navigate(`/fee-detail/${selectedFeeId}`);
  };

  // Định nghĩa các cột cho bảng
  const columns = [
    { key: 'householdNumber', title: 'Số hộ khẩu' },
    { key: 'ownerName', title: 'Họ và tên chủ hộ' },
    { key: 'location', title: 'Địa chỉ' },
    { key: 'members', title: 'Số thành viên' },
    { key: 'amount', title: 'Cần nộp' },
    { key: 'status', title: 'Trạng thái' },
    { key: 'deadline', title: 'Ngày nộp' },
    { key: 'actions', title: 'Thông tin chi tiết' }
  ];

  // Lọc dữ liệu theo search
  const filteredData = householdData.filter(row =>
    row.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.householdNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Xử lý khi click vào "Xem chi tiết" hoặc "Ghi nhận"
  const handleViewDetail = (household) => {
    setSelectedHousehold(household);
    setIsPaymentModalOpen(true);
  };

  // Xử lý khi submit form thanh toán
  const handlePaymentSubmit = (paymentData) => {
    console.log('Payment data:', paymentData);
    setIsPaymentModalOpen(false);
    alert('Ghi nhận thanh toán thành công!');
  };

  // Custom render cho các cột đặc biệt
  const enhancedColumns = columns.map(col => {
    if (col.key === 'status') {
      return {
        ...col,
        render: (value) => (
          <span className={`status-badge ${value}`}>
            {value === 'paid' ? 'Đã nộp' : 'Chưa nộp'}
          </span>
        )
      };
    }
    if (col.key === 'actions') {
      return {
        ...col,
        render: (value, row) => (
          <Button 
            variant={row.status === 'paid' ? 'secondary' : 'primary'}
            size="small"
            onClick={() => handleViewDetail(row)}
            className="action-btn"
          >
            {row.status === 'paid' ? 'Xem chi tiết' : 'Ghi nhận'}
          </Button>
        )
      };
    }
    return col;
  });

  // Render dữ liệu với custom render
  const enhancedData = filteredData.map(row => {
    const newRow = { ...row };
    enhancedColumns.forEach(col => {
      if (col.render) {
        newRow[col.key] = col.render(row[col.key], row);
      }
    });
    return newRow;
  });

  // Hiển thị loading nếu chưa có dữ liệu
  if (!currentFee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fee-detail-page">
      <div className="fee-detail-header">
        <div className="header-left">
          <Button 
            variant="outline" 
            size="small"
            onClick={() => navigate("/")}
          >
            ← Quay lại dashboard
          </Button>
          <h1>Chi tiết đợt thu</h1>
          
          {/* Dropdown để chọn đợt thu */}
          <select 
            className="fee-selector"
            value={feeId}
            onChange={handleFeeChange}
          >
            {allFees.map(fee => (
              <option key={fee.id} value={fee.id}>
                {fee.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thống kê tổng quan - Lấy từ currentFee */}
      <div className="fee-stats-grid">
        <div className="stat-card">
          <h3>{currentFee.totalCollected}</h3>
          <p>Tổng tiền đã thu</p>
        </div>
        <div className="stat-card">
          <h3>{currentFee.expectedTotal}</h3>
          <p>Tổng tiền thu dự kiến</p>
        </div>
        <div className="stat-card">
          <h3>{currentFee.paidHouseholds}</h3>
          <p>Số hộ đã nộp</p>
        </div>
        <div className="stat-card">
          <h3>{currentFee.unpaidHouseholds}</h3>
          <p>Số hộ chưa nộp</p>
        </div>
      </div>

      {/* Bảng thống kê chi tiết */}
      <div className="fee-detail-table">
        <div className="table-header-section">
          <h2>Bảng thống kê chi tiết</h2>
          <p className="table-subtitle">Chi tiết thu phí: {currentFee.title}</p>
          
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <Button variant="outline" size="small">
              Filters
            </Button>
            <Button variant="outline" size="small">
              Export
            </Button>
          </div>
        </div>

        <Table columns={enhancedColumns} data={enhancedData} />

        {/* Pagination */}
        <div className="pagination">
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">...</button>
          <button className="page-btn">8</button>
          <button className="page-btn">9</button>
          <button className="page-btn">&gt;</button>
        </div>
      </div>

      {/* Modal ghi nhận thanh toán */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={selectedHousehold?.status === 'paid' ? 'Xem chi tiết' : 'Ghi nhận đợt thu'}
      >
        {selectedHousehold && (
          <PaymentForm
            householdData={{
              ownerName: selectedHousehold.ownerName,
              amount: selectedHousehold.amount,
              householdNumber: selectedHousehold.householdNumber,
              deadline: selectedHousehold.deadline,
              status: selectedHousehold.status
            }}
            onSubmit={handlePaymentSubmit}
            onCancel={() => setIsPaymentModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default FeeDetail;
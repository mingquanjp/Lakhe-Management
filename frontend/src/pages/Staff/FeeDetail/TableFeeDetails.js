// frontend/src/pages/Staff/FeeDetail/TableFeeDetails.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Pagination, Loading } from '../../../components/commons';
import PaymentForm from '../../../components/forms/Paymentform';
import { 
  getAllFees, 
  getFeeById, 
  getFeeSummary, 
  getAllHouseholdsForFee,
  createPayment 
} from '../../../services/feeService';
import './TableFeeDetails.css';

const TableFeeDetail = () => {
  const { feeId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [currentFee, setCurrentFee] = useState(null);
  const [feeSummary, setFeeSummary] = useState(null);
  const [householdData, setHouseholdData] = useState([]);
  const [allFees, setAllFees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 6;
  
  // ← THÊM: Fetch all fees và redirect nếu không có feeId
  useEffect(() => {
    const initializeFees = async () => {
      try {
        const feesResponse = await getAllFees();
        if (feesResponse.success && feesResponse.data.length > 0) {
          setAllFees(feesResponse.data);
          
          // Nếu không có feeId trong URL, redirect đến fee đầu tiên
          if (!feeId) {
            navigate(`/staff/fee-detail/${feesResponse.data[0].fee_id}`, { replace: true });
          }
        } else if (!feeId) {
          // Không có fee nào trong database
          setError('Chưa có khoản thu nào. Vui lòng tạo khoản thu mới.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching fees:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeFees();
  }, []); // Chỉ chạy 1 lần khi mount

  const fetchFeeData = useCallback(async () => {
    // Không fetch nếu chưa có feeId
    if (!feeId) return;

    try {
      setLoading(true);
      setError(null);

      // Lấy chi tiết khoản thu hiện tại
      const feeResponse = await getFeeById(feeId);
      if (feeResponse.success) {
        setCurrentFee(feeResponse.data);
      }

      // Lấy tổng hợp thống kê
      const summaryResponse = await getFeeSummary(feeId);
      if (summaryResponse.success) {
        setFeeSummary(summaryResponse.data);
      }

      // Lấy TẤT CẢ hộ (cả đã nộp và chưa nộp)
      const allHouseholdsResponse = await getAllHouseholdsForFee(feeId);
      if (allHouseholdsResponse.success) {
        setHouseholdData(allHouseholdsResponse.data);
      }

      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching fee data:', err);
    } finally {
      setLoading(false);
    }
  }, [feeId]);

  useEffect(() => {
    fetchFeeData();
  }, [fetchFeeData]);

  const handleFeeChange = (event) => {
    const selectedFeeId = event.target.value;
    navigate(`/staff/fee-detail/${selectedFeeId}`);
  };

  // Định nghĩa các cột mới theo thiết kế
  const columns = [
    { key: 'household_code', title: 'Số hộ khẩu' },
    { key: 'head_name', title: 'Họ và tên chủ hộ' },
    { key: 'address', title: 'Địa chỉ' },
    { key: 'member_count', title: 'Số nhân khẩu' },
    { key: 'amount_to_pay', title: 'Cần nộp' },
    { key: 'payment_status', title: 'Trạng thái' },
    { key: 'payment_date', title: 'Ngày nộp' },
    { key: 'actions', title: 'Thông tin chi tiết' }
  ];

  // Lọc dữ liệu theo search
  const filteredData = householdData.filter(row =>
    row.head_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.household_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính toán dữ liệu cho trang hiện tại
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Xử lý khi click vào "Ghi nhận" hoặc "Xem chi tiết"
  const handleViewDetail = (household) => {
    if (household.payment_status === 'Đã nộp') {
      alert(`Thông tin thanh toán:\nSố tiền: ${formatCurrency(household.amount_paid)}\nNgày nộp: ${formatDate(household.payment_date)}\nGhi chú: ${household.notes || 'Không có'}`);
    } else {
      setSelectedHousehold(household);
      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      // Xác định số tiền:
      // - Nếu là Mandatory: dùng currentFee.amount
      // - Nếu là Voluntary: dùng paymentData.amount (người dùng nhập)
      const amountToPay = currentFee.fee_type === 'Mandatory' 
        ? currentFee.amount 
        : paymentData.amount;

      const response = await createPayment({
        fee_id: parseInt(feeId),
        household_id: selectedHousehold.household_id,
        amount_paid: amountToPay,
        notes: paymentData.note
      });

      if (response.success) {
        setIsPaymentModalOpen(false);
        alert('Ghi nhận thanh toán thành công!');
        fetchFeeData();
      }
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
      console.error('Error creating payment:', err);
    }
  };

  // Format tiền VND
  const formatCurrency = (amount) => {
    if (!amount) return '-';
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

  // Custom render cho các cột
  const enhancedColumns = columns.map(col => {
    if (col.key === 'member_count') {
      return {
        ...col,
        render: (value) => value || '0'
      };
    }
    if (col.key === 'amount_to_pay') {
      return {
        ...col,
        render: (value, row) => {
          if (row.payment_status === 'Đã nộp' && row.amount_paid) {
            return formatCurrency(row.amount_paid);
          }
          return currentFee?.amount ? formatCurrency(currentFee.amount) : 'Tự nguyện';
        }
      };
    }
    if (col.key === 'payment_status') {
      return {
        ...col,
        render: (value) => (
          <span className={`status-badge ${value === 'Đã nộp' ? 'status-paid' : 'status-unpaid'}`}>
            {value}
          </span>
        )
      };
    }
    if (col.key === 'payment_date') {
      return {
        ...col,
        render: (value) => formatDate(value)
      };
    }
    if (col.key === 'actions') {
      return {
        ...col,
        render: (value, row) => (
          <Button 
            variant={row.payment_status === 'Đã nộp' ? 'outline' : 'primary'}
            size="small"
            onClick={() => handleViewDetail(row)}
            className="action-btn"
          >
            {row.payment_status === 'Đã nộp' ? 'Xem chi tiết' : 'Ghi nhận'}
          </Button>
        )
      };
    }
    return col;
  });

  // Render dữ liệu với custom render
  const enhancedData = currentData.map(row => {
    const newRow = { ...row };
    enhancedColumns.forEach(col => {
      if (col.render) {
        newRow[col.key] = col.render(row[col.key], row);
      }
    });
    return newRow;
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Lỗi khi tải dữ liệu: {error}</p>
        <Button onClick={() => navigate('/staff/fee-management')}>Quay lại Dashboard</Button>
      </div>
    );
  }

  if (!currentFee || !feeSummary) {
    return (
      <div className="error-message">
        <p>Không tìm thấy dữ liệu khoản thu</p>
        <Button onClick={() => navigate('/staff/fee-management')}>Quay lại Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="fee-detail-page">
      <div className="fee-detail-header">
        <div className="header-left">
          <Button 
            variant="outline" 
            size="small"
            onClick={() => navigate("/staff/fee-management")}
          >
            ← Quay lại dashboard
          </Button>
          <h1>Chi tiết đợt thu</h1>
          
          <select 
            className="fee-selector"
            value={feeId}
            onChange={handleFeeChange}
          >
            {allFees.map(fee => (
              <option key={fee.fee_id} value={fee.fee_id}>
                {fee.fee_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="fee-stats-grid">
        <div className="stat-card">
          <h3>{formatCurrency(feeSummary.total_collected)}</h3>
          <p>Tổng tiền đã thu</p>
        </div>
        <div className="stat-card">
          <h3>{feeSummary.expected_total ? formatCurrency(feeSummary.expected_total) : 'Không giới hạn'}</h3>
          <p>Tổng tiền thu dự kiến</p>
        </div>
        <div className="stat-card">
          <h3>{feeSummary.paid_households}</h3>
          <p>Số hộ đã nộp</p>
        </div>
        <div className="stat-card">
          <h3>{feeSummary.unpaid_households}</h3>
          <p>Số hộ chưa nộp</p>
        </div>
      </div>

      {/* Bảng chi tiết */}
      <div className="fee-detail-table">
        <div className="table-header-section">
          <h2>Bảng thống kê chi tiết</h2>
          <p className="table-subtitle">
            Chi tiết thu phí: {currentFee.fee_name}
            {filteredData.length > 0 && ` (${filteredData.length} hộ)`}
          </p>
          
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, số hộ khẩu, địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="action-buttons">
              <Button 
                variant="outline" 
                size="small"
                onClick={fetchFeeData}
              >
                Làm mới
              </Button>
              <Button 
                variant="primary" 
                size="small"
                onClick={() => {/* TODO: Export to Excel */}}
              >
                Xuất Excel
              </Button>
            </div>
          </div>
        </div>

        {currentData.length > 0 ? (
          <>
            <Table columns={enhancedColumns} data={enhancedData} />

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="no-data">
            <p>Không có dữ liệu!</p>
          </div>
        )}
      </div>

      {/* Modal ghi nhận thanh toán */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Ghi nhận đợt thu"
      >
        {selectedHousehold && (
          <PaymentForm
            householdData={{
              ownerName: selectedHousehold.head_name || 'Chưa có chủ hộ',
              amount: currentFee.amount ? formatCurrency(currentFee.amount) : 'Tự nguyện',
              householdNumber: selectedHousehold.household_code,
              household_id: selectedHousehold.household_id
            }}
            feeType={currentFee.fee_type} // ← THÊM feeType
            onSubmit={handlePaymentSubmit}
            onCancel={() => setIsPaymentModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default TableFeeDetail;
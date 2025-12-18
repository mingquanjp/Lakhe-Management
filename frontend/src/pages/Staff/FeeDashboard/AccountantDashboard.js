import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Loading } from '../../../components/commons';
import { Link } from 'react-router-dom';
import CreateFeeForm from '../../../components/forms/CreateFeeForm';
import { getAllFees, createFee, deleteFee } from '../../../services/feeService';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import './AccountantDashboard.css';

const AccountantDashboard = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, fee: null });

  // Lấy danh sách khoản thu khi component mount
  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await getAllFees();
      
      if (response.success) {
        setFees(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi submit form tạo khoản thu mới
  const handleCreateFee = async (formData) => {
    try {
      // Chuyển đổi dữ liệu form sang format của API
      const feeData = {
        fee_name: formData.name,
        fee_type: formData.type === 'mandatory' ? 'Mandatory' : 'Voluntary',
        amount: formData.type === 'mandatory' ? parseFloat(formData.amount) : null,
        start_date: new Date().toISOString().split('T')[0], // Ngày hiện tại
        end_date: formData.deadline
      };

      const response = await createFee(feeData);
      
      if (response.success) {
        setIsModalOpen(false);
        toast.success('Tạo đợt thu mới thành công!');
        
        // Refresh danh sách khoản thu
        fetchFees();
      }
    } catch (err) {
      toast.error(`Lỗi: ${err.message}`);
      console.error('Error creating fee:', err);
    }
  };

  // Xử lý xóa khoản thu
  const handleDeleteClick = (fee) => {
    setDeleteConfirmModal({ isOpen: true, fee });
  };

  const handleConfirmDelete = async () => {
    try {
      const feeToDelete = deleteConfirmModal.fee;
      const response = await deleteFee(feeToDelete.fee_id);
      
      if (response.success) {
        toast.success('Xóa đợt thu thành công!');
        setDeleteConfirmModal({ isOpen: false, fee: null });
        // Refresh danh sách
        fetchFees();
      }
    } catch (err) {
      toast.error(`Lỗi khi xóa: ${err.message}`);
      console.error('Error deleting fee:', err);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmModal({ isOpen: false, fee: null });
  };

  // Lọc khoản thu đang diễn ra và đã diễn ra
  const getOngoingFees = () => {
    const today = new Date();
    return fees.filter(fee => {
      const endDate = fee.end_date ? new Date(fee.end_date) : null;
      return !endDate || endDate >= today;
    });
  };

  const getCompletedFees = () => {
    const today = new Date();
    return fees.filter(fee => {
      const endDate = fee.end_date ? new Date(fee.end_date) : null;
      return endDate && endDate < today;
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Lỗi khi tải dữ liệu: {error}</p>
        <Button onClick={fetchFees}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          Đang diễn ra
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Đã diễn ra
        </button>
        <button 
          className="create-new-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          <span>Tạo đợt thu mới</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {activeTab === 'register' && (
          <div className="fee-grid">
            {getOngoingFees().length > 0 ? (
              getOngoingFees().map(fee => (
                <FeeCard 
                  key={fee.fee_id} 
                  fee={fee} 
                  onDelete={() => handleDeleteClick(fee)}
                />
              ))
            ) : (
              <p className="no-data">Không có đợt thu nào đang diễn ra</p>
            )}
          </div>
        )}
        
        {/* History Area */}
        {activeTab === 'history' && (
          <div className="fee-history-grid">
            {getCompletedFees().length > 0 ? (
              getCompletedFees().map(fee => (
                <FeeCard 
                  key={fee.fee_id} 
                  fee={fee} 
                  isCompleted={true}
                  onDelete={() => handleDeleteClick(fee)}
                />
              ))
            ) : (
              <p className="no-data">Không có đợt thu nào đã kết thúc</p>
            )}
          </div>
        )}
      </div>

      {/* Modal tạo đợt thu mới */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Tạo đợt thu mới"
      >
        <CreateFeeForm 
          onSubmit={handleCreateFee}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal 
        isOpen={deleteConfirmModal.isOpen} 
        onClose={handleCancelDelete}
        title="Xác nhận xóa đợt thu"
      >
        <div className="delete-confirm-content">
          <p className="delete-confirm-message">
            Bạn có chắc chắn muốn xóa đợt thu <strong>"{deleteConfirmModal.fee?.fee_name}"</strong> không?
          </p>
          <p className="delete-confirm-warning">
            Hành động này sẽ xóa vĩnh viễn đợt thu và tất cả dữ liệu thanh toán liên quan. Không thể hoàn tác!
          </p>
          <div className="delete-confirm-actions">
            <Button 
              variant="outline" 
              onClick={handleCancelDelete}
            >
              Hủy
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirmDelete}
              className="delete-confirm-btn"
            >
              Xóa đợt thu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Component FeeCard với nút xóa
const FeeCard = ({ fee, isCompleted, onDelete }) => {
  const totalHouseholds = parseInt(fee.total_households) || 0;
  const paidHouseholds = parseInt(fee.total_payments) || 0;
  const totalCollected = parseFloat(fee.total_collected) || 0;
  
  const progressPercentage = totalHouseholds > 0 
    ? Math.round((paidHouseholds / totalHouseholds) * 100) 
    : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không giới hạn';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Card className={`fee-card-modern ${isCompleted ? 'completed' : ''}`}>
      {/* Nút xóa góc phải */}
      <button 
        className="fee-delete-btn" 
        onClick={(e) => {
          e.preventDefault();
          onDelete();
        }}
        title="Xóa đợt thu"
      >
        🗑️
      </button>

      {/* Header */}
      <div className="fee-card-header">
        <h3 className="fee-card-title">{fee.fee_name}</h3>
        <span className={`fee-badge ${fee.fee_type.toLowerCase()}`}>
          {fee.fee_type === 'Mandatory' ? 'BẮT BUỘC' : 'TỰ NGUYỆN'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="fee-progress-section">
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="progress-info">
          <span className="progress-text">Đã thu: {paidHouseholds}</span>
          <span className="progress-text">Tổng: {totalHouseholds}</span>
        </div>
      </div>

      {/* Total Collected */}
      <div className="fee-total-section">
        <span className="total-label">Tổng thu :</span>
        <span className="total-amount">{formatCurrency(totalCollected)}</span>
      </div>

      {/* Deadline */}
      <div className="fee-deadline-section">
        <span className="deadline-label">DEADLINE :</span>
        <span className="deadline-date">{formatDate(fee.end_date)}</span>
      </div>

      {/* Action Button */}
      <div className="fee-card-footer">
        <Link to={`/staff/table-detail/${fee.fee_id}`}>
          <Button variant="outline" size="medium" className="view-detail-btn">
            Xem chi tiết
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default AccountantDashboard;
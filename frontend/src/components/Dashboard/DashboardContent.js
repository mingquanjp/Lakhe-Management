import React, { useState } from 'react';
import Card from '../common/Card/Card';
import { Link } from 'react-router-dom';
import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';
import CreateFeeForm from '../forms/CreateFeeForm';
import { feeData, existedFeeData } from '../../data/mockData'; // Import mock data
import './DashboardContent.css';

const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Xử lý khi submit form
  const handleCreateFee = (formData) => {
    console.log('Form data:', formData);
    setIsModalOpen(false);
    alert('Tạo đợt thu mới thành công!');
  };

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
          Tạo đợt thu mới
        </button>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {activeTab === 'register' && (
          <div className="fee-grid">
            {feeData.map(fee => (
              <FeeCard key={fee.id} fee={fee} />
            ))}
          </div>
        )}
        
        {/* History Area */}
        {activeTab === 'history' && (
          <div className="fee-history-grid">
            {existedFeeData.map(fee => (
              <FeeCard key={fee.id} fee={fee} isCompleted={true} />
            ))}
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
    </div>
  );
};

// Component FeeCard riêng biệt
const FeeCard = ({ fee, isCompleted }) => {
  const progressPercentage = (fee.collected / fee.total) * 100;

  return (
    <Card className={`fee-card ${isCompleted ? 'completed' : ''}`}>
      <div className="fee-header">
        <h3 className="fee-title">{fee.title}</h3>
        <span className={`fee-status ${fee.status}`}>
          {fee.statusText}
        </span>
      </div>

      <div className="fee-stats">
        <div className="stat-row">
          <span>Đã thu: {fee.collected}</span>
          <span>Tổng: {fee.total}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="fee-amount">
        <span className="amount-label">Tổng thu:</span>
        <span className="amount-value">{fee.totalAmount}</span>
      </div>

      <div className="fee-deadline">
        <span>DEADLINE: </span>
        <span className="deadline-date">{fee.deadline}</span>
      </div>

      <div className="fee-actions">
        <Link to={`/fee-detail/${fee.id}`}>
          <Button variant="outline" size="small">
            Xem chi tiết
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default DashboardContent;
import React, { useState } from 'react';
import { Button } from '../commons';
import './Form.css';

const PaymentForm = ({ householdData, onSubmit, onCancel }) => {
  // Hàm chuyển đổi định dạng ngày từ DD/MM/YYYY sang YYYY-MM-DD
  const convertDateFormat = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
    }
    return dateStr;
  };

  const [formData, setFormData] = useState({
    paymentDate: convertDateFormat(householdData.deadline) || '', // Chuyển đổi định dạng ngày
    note: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gửi dữ liệu bao gồm thông tin hộ gia đình và thông tin thanh toán
    onSubmit({
      ...householdData,
      ...formData
    });
  };

  // Kiểm tra xem người dùng đã nộp chưa
  const isPaid = householdData.status === 'paid';

  return (
    <form className="create-fee-form" onSubmit={handleSubmit}>
      <div className="form-description">
        Điền chi tiết thông tin thu của hộ khẩu
      </div>

      {/* Chủ hộ - Disabled */}
      <div className="form-group">
        <label htmlFor="ownerName">Chủ hộ</label>
        <input
          type="text"
          id="ownerName"
          name="ownerName"
          className="form-input disabled"
          value={householdData.ownerName}
          disabled
        />
      </div>

      {/* Số tiền phải đóng - Disabled */}
      <div className="form-group">
        <label htmlFor="amount">Số tiền phải đóng</label>
        <input
          type="text"
          id="amount"
          name="amount"
          className="form-input disabled"
          value={householdData.amount}
          disabled
        />
      </div>

      {/* Ngày nộp - Editable */}
      <div className="form-group">
        <label htmlFor="paymentDate">Ngày nộp</label>
        <input
          type="date"
          id="paymentDate"
          name="paymentDate"
          className="form-input"
          value={formData.paymentDate}
          onChange={handleChange}
          required
        />
      </div>

      {/* Ghi chú - Editable */}
      <div className="form-group">
        <label htmlFor="note">Ghi chú</label>
        <textarea
          id="note"
          name="note"
          className="form-input form-textarea"
          value={formData.note}
          onChange={handleChange}
          placeholder="Nhập ghi chú (nếu có)"
          rows="4"
        />
      </div>

      <div className="form-actions">
        <Button 
          type="submit" 
          variant="primary" 
          className="btn-add"
        >
          {isPaid ? 'Cập nhật' : 'Ghi nhận'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="btn-cancel"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
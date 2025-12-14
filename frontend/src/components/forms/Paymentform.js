import React, { useState } from 'react';
import { Button } from '../commons';
import './Form.css';

const PaymentForm = ({ 
  householdData, 
  feeType, 
  mode = 'create', // ← THÊM
  initialData = null, // ← THÊM
  onSubmit, 
  onCancel 
}) => {
  const isVoluntary = feeType === 'Voluntary';
  const isEditMode = mode === 'edit';
  
  const [formData, setFormData] = useState({
    paymentDate: initialData?.payment_date 
      ? new Date(initialData.payment_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    amount: initialData?.amount_paid?.toString() || '',
    note: initialData?.notes || ''
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
    
    // Validation cho tự nguyện
    if (isVoluntary && (!formData.amount || parseFloat(formData.amount) <= 0)) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    onSubmit({
      paymentDate: formData.paymentDate, // ← Đã có
      amount: isVoluntary ? parseFloat(formData.amount) : null,
      note: formData.note,
      household_id: householdData.household_id
    });
  };

  return (
    <form className="create-fee-form" onSubmit={handleSubmit}>
      <div className="form-description">
        {isEditMode 
          ? 'Chỉnh sửa thông tin thu của hộ khẩu' 
          : 'Điền chi tiết thông tin thu của hộ khẩu'}
      </div>

      {/* Số hộ khẩu - Disabled */}
      <div className="form-group">
        <label htmlFor="householdNumber">Số hộ khẩu</label>
        <input
          type="text"
          id="householdNumber"
          name="householdNumber"
          className="form-input disabled"
          value={householdData.householdNumber}
          disabled
        />
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

      {/* Số tiền - Có thể edit nếu là tự nguyện */}
      <div className="form-group">
        <label htmlFor="amount">
          {isVoluntary ? 'Số tiền phải đóng' : 'Số tiền phải đóng'}
        </label>
        {isVoluntary ? (
          <input
            type="number"
            id="amount"
            name="amount"
            className="form-input"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Nhập số tiền (VND)"
            min="0"
            step="1000"
            required
          />
        ) : (
          <input
            type="text"
            id="amount"
            name="amount"
            className="form-input disabled"
            value={householdData.amount}
            disabled
          />
        )}
        {isVoluntary && (
          <small className="form-hint">
            Đây là khoản thu tự nguyện, vui lòng nhập số tiền
          </small>
        )}
      </div>

      {/* Định mức - Chỉ hiển thị cho tự nguyện */}
      {isVoluntary && householdData.amount !== 'Tự nguyện' && (
        <div className="form-group">
          <label htmlFor="suggestedAmount">Định mức đề nghị</label>
          <input
            type="text"
            id="suggestedAmount"
            className="form-input disabled"
            value={householdData.amount}
            disabled
          />
          <small className="form-hint">
            Đây chỉ là định mức đề nghị, bạn có thể nhập số tiền khác
          </small>
        </div>
      )}

      {/* Ngày nộp */}
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

      {/* Ghi chú */}
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

      {/* Form Actions */}
      <div className="form-actions">
        <Button
          type="button"
          variant="outline"
          size="medium"
          onClick={onCancel}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="medium"
        >
          {isEditMode ? 'Cập nhật' : 'Xác nhận'}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
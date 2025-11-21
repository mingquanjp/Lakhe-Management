import React, { useState } from 'react';
import { Button } from '../commons';
import './Form.css';

const CreateFeeForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'mandatory',
    amount: '',
    scope: 'all',
    deadline: ''
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
    onSubmit(formData);
  };

  return (
    <form className="create-fee-form" onSubmit={handleSubmit}>
      <div className="form-description">
        Điền các thông tin về đợt thu
      </div>

      <div className="form-group">
        <label htmlFor="name">Tên đợt thu</label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-input"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nhập tên đợt thu"
          required
        />
      </div>

      <div className="form-group">
        <label>Loại đợt thu</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="type"
              value="mandatory"
              checked={formData.type === 'mandatory'}
              onChange={handleChange}
            />
            <span>Bắt buộc</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="type"
              value="voluntary"
              checked={formData.type === 'voluntary'}
              onChange={handleChange}
            />
            <span>Tự nguyện</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="amount">Định mức (VNĐ / 1 đơn vị)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          className="form-input"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Nhập định mức"
          required
        />
      </div>

      <div className="form-group">
        <label>Áp dụng cho</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="scope"
              value="all"
              checked={formData.scope === 'all'}
              onChange={handleChange}
            />
            <span>Mỗi nhân khẩu</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="scope"
              value="household"
              checked={formData.scope === 'household'}
              onChange={handleChange}
            />
            <span>Mỗi hộ</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="deadline">Deadline</label>
        <input
          type="date"
          id="deadline"
          name="deadline"
          className="form-input"
          value={formData.deadline}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-actions">
        <Button 
          type="submit" 
          variant="primary" 
          className="btn-add"
        >
          Thêm
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="btn-cancel"
        >
          Hủy
        </Button>
      </div>
    </form>
  );
};

export default CreateFeeForm;
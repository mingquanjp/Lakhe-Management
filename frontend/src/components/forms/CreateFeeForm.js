import React, { useState } from 'react';
import { Button } from '../commons';
import './Form.css';

const CreateFeeForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'mandatory',
    amount: '',
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
    
    // Validation
    if (formData.type === 'mandatory' && !formData.amount) {
      alert('Vui lòng nhập định mức cho khoản thu bắt buộc');
      return;
    }

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

      {formData.type === 'mandatory' && (
        <div className="form-group">
          <label htmlFor="amount">Định mức (VNĐ / 1 hộ)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            className="form-input"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Nhập định mức"
            min="0"
            required
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="deadline">Hạn chót</label>
        <input
          type="date"
          id="deadline"
          name="deadline"
          className="form-input"
          value={formData.deadline}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Hủy
        </Button>
        <Button 
          type="submit" 
          variant="primary"
        >
          Tạo đợt thu
        </Button>
      </div>
    </form>
  );
};

export default CreateFeeForm;
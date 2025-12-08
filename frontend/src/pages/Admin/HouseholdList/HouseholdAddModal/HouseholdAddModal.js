import React, { useState } from "react";
import Modal from "../../../../components/commons/Modal/Modal";
import "./HouseholdAddModal.css";

const HouseholdAddModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    ownerName: "",
    householdCount: "",
    memberCount: "",
    members: [],
    address: "",
  });

  const handleCountChange = (e) => {
    const value = e.target.value;
    const count = parseInt(value) || 0;

    const newMembers = [...formData.members];

    if (count > newMembers.length) {
        for (let i = newMembers.length; i < count; i++) {
          newMembers.push({ name: "", dob: "", occupation: "", address: "", relation: "" });
      }
    } else {
      newMembers.length = count;
    }

    // Ensure first member is the household owner with default relation
    if (newMembers.length > 0) {
      newMembers[0].relation = "Chủ hộ";
    }

    setFormData({
      ...formData,
      memberCount: value,
      members: newMembers,
    });
  };

  const resetForm = () => {
    setFormData({
      ownerName: "",
      householdCount: "",
      memberCount: "",
      members: [],
      address: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index][field] = value;
    setFormData({ ...formData, members: updatedMembers });
  };

  const handleSubmit = () => {
    if (onSave) {
        onSave(formData);
    }
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Thêm hộ khẩu mới" size="xl">
      <div className="household-add-modal">
        <div className="form-row">
          <div className="form-group">
            <label>Số hộ khẩu</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập số hộ khẩu"
              value={formData.householdCount}
              onChange={(e) => setFormData({ ...formData, householdCount: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Số nhân khẩu</label>
            <input
              type="number"
              min="1" 
              className="form-control"
              placeholder="Nhập số lượng"
              value={formData.memberCount}
              onChange={handleCountChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ width: '100%' }}>
            <label>Địa chỉ hộ khẩu</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập địa chỉ hộ khẩu"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        {formData.members.length > 0 && (
          <div className="members-section">
            <span className="section-title">Thông tin thành viên</span>
            {formData.members.map((member, index) => (
              <div key={index} className="member-row">
                <input
                  type="text"
                  className="form-control"
                  placeholder={index === 0 ? "Tên chủ hộ" : "Họ và tên"}
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                />

                <input
                  type="date"
                  className="form-control"
                  value={member.dob}
                  onChange={(e) => handleMemberChange(index, "dob", e.target.value)}
                />

                <input
                  type="text"
                  className="form-control"
                  placeholder="Nghề nghiệp"
                  value={member.occupation}
                  onChange={(e) => handleMemberChange(index, "occupation", e.target.value)}
                />

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Địa chỉ"
                    value={member.address || ""}
                    onChange={(e) => handleMemberChange(index, "address", e.target.value)}
                  />

                <input
                  type="text"
                  className="form-control"
                  placeholder="Quan hệ"
                  value={index === 0 ? "Chủ hộ" : member.relation}
                  onChange={(e) => {
                    if (index !== 0) handleMemberChange(index, "relation", e.target.value);
                  }}
                  readOnly={index === 0}
                />
              </div>
            ))}
          </div>
        )}

        <div className="form-actions">
          <button className="btn-cancel" onClick={handleClose}>
            Hủy bỏ
          </button>
          <button className="btn-save" onClick={handleSubmit}>
            Lưu hộ khẩu
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default HouseholdAddModal;
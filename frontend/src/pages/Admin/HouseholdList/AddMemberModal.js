import React, { useState, useEffect } from "react";
import Modal from "../../../components/commons/Modal/Modal";
import "./HouseholdAddModal/HouseholdAddModal.css"; // Reuse styles

const AddMemberModal = ({ isOpen, onClose, onSave, type, householdId }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    gender: "Male",
    relationship_to_head: "",
    place_of_birth: "",
    place_of_origin: "",
    ethnicity: "Kinh",
    occupation: "",
    workplace: "",
    identity_card_number: "",
    identity_card_date: "",
    identity_card_place: "",
    previous_address: "",
    registration_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        first_name: "",
        last_name: "",
        dob: "",
        gender: "Male",
        relationship_to_head: "",
        place_of_birth: "",
        place_of_origin: "",
        ethnicity: "Kinh",
        occupation: "",
        workplace: "",
        identity_card_number: "",
        identity_card_date: "",
        identity_card_place: "",
        previous_address: "",
        registration_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [isOpen, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.dob || !formData.relationship_to_head) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc (Họ, Tên, Ngày sinh, Quan hệ)");
      return;
    }
    onSave({ ...formData, household_id: householdId });
  };

  const title = type === 'NewBirth' ? "Thêm nhân khẩu mới sinh" : "Thêm nhân khẩu chuyển đến";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="household-add-modal">
        <div className="form-row">
          <div className="form-group">
            <label>Họ <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="form-control"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Nguyễn"
            />
          </div>
          <div className="form-group">
            <label>Tên <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="form-control"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Văn A"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ngày sinh <span className="text-red-500">*</span></label>
            <input
              type="date"
              className="form-control"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Giới tính</label>
            <select
              className="form-control"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Quan hệ với chủ hộ <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="form-control"
              name="relationship_to_head"
              value={formData.relationship_to_head}
              onChange={handleChange}
              placeholder="Con, Vợ, Chồng..."
            />
          </div>
          <div className="form-group">
            <label>Dân tộc</label>
            <input
              type="text"
              className="form-control"
              name="ethnicity"
              value={formData.ethnicity}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ width: '100%' }}>
            <label>Nơi sinh / Nguyên quán</label>
            <input
              type="text"
              className="form-control"
              name="place_of_birth"
              value={formData.place_of_birth}
              onChange={handleChange}
              placeholder="Nhập nơi sinh"
            />
          </div>
        </div>

        {type === 'MoveIn' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>CMND/CCCD</label>
                <input
                  type="text"
                  className="form-control"
                  name="identity_card_number"
                  value={formData.identity_card_number}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Nghề nghiệp</label>
                <input
                  type="text"
                  className="form-control"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ width: '100%' }}>
                <label>Địa chỉ trước khi chuyển đến</label>
                <input
                  type="text"
                  className="form-control"
                  name="previous_address"
                  value={formData.previous_address}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ngày đăng ký thường trú</label>
                <input
                  type="date"
                  className="form-control"
                  name="registration_date"
                  value={formData.registration_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </>
        )}

        <div className="form-actions">
          <button className="btn-cancel" onClick={onClose}>
            Hủy bỏ
          </button>
          <button className="btn-save" onClick={handleSubmit}>
            Lưu nhân khẩu
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddMemberModal;

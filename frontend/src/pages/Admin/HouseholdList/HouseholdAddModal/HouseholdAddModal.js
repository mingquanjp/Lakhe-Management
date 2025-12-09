import React, { useState } from "react";
import Modal from "../../../../components/commons/Modal/Modal";
import "./HouseholdAddModal.css";

const HouseholdAddModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    household_code: "",
    address: "",
    memberCount: "",
    members: [],
  });

  const handleCountChange = (e) => {
    const value = e.target.value;
    const count = parseInt(value) || 0;
    const newMembers = [...formData.members];

    if (count > newMembers.length) {
      for (let i = newMembers.length; i < count; i++) {
        newMembers.push({
          name: "",
          dob: "",
          gender: "Male",
          relation: "",
          cccd: "",
          ethnicity: "",
          place_of_birth: "",
          occupation: "",
        });
      }
    } else {
      newMembers.length = count;
    }

    if (newMembers.length > 0) newMembers[0].relation = "Chủ hộ";

    setFormData({ ...formData, memberCount: value, members: newMembers });
  };

  const RELATION_OPTIONS = [
  "Vợ",
  "Chồng",
  "Con",
  "Cháu",
  "Anh",
  "Chị",
  "Em",
  "Bố",
  "Mẹ",
  "Ông",
  "Bà",
];

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index][field] = value;
    setFormData({ ...formData, members: updatedMembers });
  };

  const handleSubmit = () => {
    if (!formData.household_code || !formData.address) {
      alert("Vui lòng nhập Mã hộ khẩu và Địa chỉ!");
      return;
    }
    if (onSave) onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      household_code: "",
      address: "",
      memberCount: "",
      members: [],
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Thêm hộ khẩu mới"
      size="xl"
    >
      <div className="household-add-modal">
        {/* Thông tin chung */}
        <div className="form-row">
          <div className="form-group">
            <label>
              Mã hộ khẩu <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: HK2025-01"
              value={formData.household_code}
              onChange={(e) =>
                setFormData({ ...formData, household_code: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>
              Địa chỉ thường trú <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Số nhà, đường, phố..."
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
          <div className="form-group" style={{ maxWidth: "165px" }}>
            <label>Số thành viên</label>
            <input
              type="number"
              min="0"
              className="form-control"
              placeholder="Số lượng thành viên"
              value={formData.memberCount}
              onChange={handleCountChange}
            />
          </div>
        </div>

        {/* Danh sách thành viên */}
        {formData.members.length > 0 && (
          <div className="members-section">
            <span className="section-title">Danh sách thành viên</span>
            <div className="members-list-container">
              {formData.members.map((member, index) => (
                <div
                  key={index}
                  className="member-row"
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "10px",
                    alignItems: "center",
                  }}
                >
                  <span className="row-index" style={{ width: "20px" }}>
                    {index + 1}.
                  </span>

                  {/* 1. Họ tên */}
                  <input
                    className="form-control"
                    placeholder="Họ và tên"
                    value={member.name}
                    onChange={(e) =>
                      handleMemberChange(index, "name", e.target.value)
                    }
                    style={{ flex: 2, minWidth: "140px" }}
                  />

                  {/* 2. Quan hệ */}
                  {index === 0 ? (
                    <input
                      className="form-control"
                      value="Chủ hộ"
                      readOnly
                      style={{
                        flex: 1,
                        minWidth: "90px",
                        color: "#333",
                        fontWeight: "500",
                      }}
                    />
                  ) : (
                    <select
                      className="form-control"
                      value={member.relation}
                      onChange={(e) =>
                        handleMemberChange(index, "relation", e.target.value)
                      }
                      style={{ flex: 1, minWidth: "90px" }}
                    >
                      <option value="">Quan hệ...</option>
                      {RELATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* 3. Ngày sinh */}
                  <input
                    type="date"
                    className="form-control"
                    value={member.dob}
                    onChange={(e) =>
                      handleMemberChange(index, "dob", e.target.value)
                    }
                    style={{ flex: 1.2, minWidth: "120px" }}
                  />

                  {/* 4. Giới tính */}
                  <select
                    className="form-control"
                    value={member.gender}
                    onChange={(e) =>
                      handleMemberChange(index, "gender", e.target.value)
                    }
                    style={{ flex: 0.8, minWidth: "70px" }}
                  >
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                  </select>

                  {/* 5. CMND/CCCD */}
                  <input
                    className="form-control"
                    placeholder="CCCD"
                    value={member.cccd}
                    onChange={(e) =>
                      handleMemberChange(index, "cccd", e.target.value)
                    }
                    style={{ flex: 1.2, minWidth: "110px" }}
                  />

                  {/* 6. Dân tộc */}
                  <input
                    className="form-control"
                    placeholder="Dân tộc"
                    value={member.ethnicity}
                    onChange={(e) =>
                      handleMemberChange(index, "ethnicity", e.target.value)
                    }
                    style={{ flex: 0.8, minWidth: "70px" }}
                  />

                  {/* 7. Nghề nghiệp*/}
                  <input
                    className="form-control"
                    placeholder="Nghề nghiệp"
                    value={member.occupation}
                    onChange={(e) =>
                      handleMemberChange(index, "occupation", e.target.value)
                    }
                    style={{ flex: 1.2, minWidth: "110px" }}
                  />
                </div>
              ))}
            </div>
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

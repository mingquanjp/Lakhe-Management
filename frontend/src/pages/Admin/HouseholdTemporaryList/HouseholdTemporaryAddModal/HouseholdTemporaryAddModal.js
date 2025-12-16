import React from "react";
import { useState } from "react";
import Modal from "../../../../components/commons/Modal/Modal";
import "./HouseholdTemporaryAddModal.css";
import { toast } from "react-toastify";

const HouseholdTemporaryAddModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    household_code: "",
    address: "",
    start_date: "",
    end_date: "",
    reason: "",
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
    if (!formData.household_code || !formData.address || !formData.start_date) {
    toast.warning("Vui lòng nhập Mã hộ, Địa chỉ và Ngày bắt đầu!");
    return;
    }

    if (formData.members.length === 0 || !formData.members[0].name) {
      toast.warning("Vui lòng nhập đầy đủ thông tin Chủ hộ!");
      return;
    }

    const ownerMember = formData.members[0];
    const otherMembers = formData.members.slice(1);

    const payload = {
      household_code: formData.household_code,
      address: formData.address,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason,
      owner: {
        name: ownerMember.name,
        dob: ownerMember.dob,
        gender: ownerMember.gender,
        cccd: ownerMember.cccd,
      },
      members: otherMembers.map((m) => ({
        name: m.name,
        dob: m.dob,
        gender: m.gender,
        cccd: m.cccd,
        relation: m.relation,
        occupation: m.occupation,
      })),
    };

    if (onSave) onSave(payload);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      household_code: "",
      address: "",
      start_date: "",
      end_date: "",
      reason: "",
      memberCount: "",
      members: [],
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Đăng ký tạm trú mới"
      size="xl"
    >
      <div className="household-add-modal">
        <div className="form-row">
          <div className="form-group">
            <label>
              Mã hộ tạm trú <span style={{ color: "red" }}>*</span>
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
              Địa chỉ tạm trú <span style={{ color: "red" }}>*</span>
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
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Ngày bắt đầu <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Ngày kết thúc</label>
            <input
              type="date"
              className="form-control"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
            />
          </div>
          <div className="form-group" style={{ maxWidth: "150px" }}>
            <label>Số thành viên</label>
            <input
              type="number"
              min="0"
              className="form-control"
              placeholder="SL"
              value={formData.memberCount}
              onChange={handleCountChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Lý do tạm trú</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: Công tác, Học tập, Lao động..."
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
            />
          </div>
        </div>

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
                  <input
                    className="form-control"
                    placeholder="Họ và tên"
                    value={member.name}
                    onChange={(e) =>
                      handleMemberChange(index, "name", e.target.value)
                    }
                    style={{ flex: 2, minWidth: "140px" }}
                  />
                  {index === 0 ? (
                    <input
                      className="form-control"
                      value="Chủ hộ"
                      readOnly
                      style={{
                        flex: 1,
                        minWidth: "90px",
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
                  <input
                    type="date"
                    className="form-control"
                    value={member.dob}
                    onChange={(e) =>
                      handleMemberChange(index, "dob", e.target.value)
                    }
                    style={{ flex: 1.2, minWidth: "120px" }}
                  />
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

                  <input
                    className="form-control"
                    placeholder="CCCD"
                    value={member.cccd}
                    onChange={(e) =>
                      handleMemberChange(index, "cccd", e.target.value)
                    }
                    style={{ flex: 1.2, minWidth: "110px" }}
                  />

                  <input
                    className="form-control"
                    placeholder="Nghề nghiệp"
                    value={member.occupation}
                    onChange={(e) =>
                      handleMemberChange(index, "occupation", e.target.value)
                    }
                    style={{ flex: 1, minWidth: "100px" }}
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
            Lưu hồ sơ
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default HouseholdTemporaryAddModal;

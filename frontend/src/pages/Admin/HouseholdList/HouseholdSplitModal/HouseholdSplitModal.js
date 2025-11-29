import React, { useState } from "react";
import Modal from "../../../../components/commons/Modal/Modal";
import "./HouseholdSplitModal.css";

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
  "Không có quan hệ",
];

const HouseholdSplitModal = ({ isOpen, onClose, householdData, onSave }) => {
  const [splitCount, setSplitCount] = useState("");
  const [newHouseholds, setNewHouseholds] = useState([]);
  const [errors, setErrors] = useState({});

  const handleCountChange = (e) => {
    const value = e.target.value;
    setSplitCount(value);
    setErrors({});

    if (value && parseInt(value) > 0) {
      const count = parseInt(value);
      const households = [];

      for (let i = 0; i < count; i++) {
        households.push({
          id: i,
          owner: "",
          members: [],
          memberRelations: {},
        });
      }

      setNewHouseholds(households);
    } else {
      setNewHouseholds([]);
    }
  };

  const handleOwnerChange = (householdId, memberId) => {
    const updated = [...newHouseholds];
    updated[householdId].owner = memberId;
    setNewHouseholds(updated);
    validateHouseholds(updated);
  };

  const handleMemberToggle = (householdId, memberId) => {
    const updated = [...newHouseholds];
    const memberIndex = updated[householdId].members.indexOf(memberId);

    if (memberIndex > -1) {
      updated[householdId].members.splice(memberIndex, 1);
      delete updated[householdId].memberRelations[memberId];
    } else {
      updated[householdId].members.push(memberId);
    }

    setNewHouseholds(updated);
    validateHouseholds(updated);
  };

  const handleRelationChange = (householdId, memberId, relation) => {
    const updated = [...newHouseholds];
    updated[householdId].memberRelations[memberId] = relation;
    setNewHouseholds(updated);
    validateHouseholds(updated);
  };

  const validateHouseholds = (households) => {
    const newErrors = {};
    const usedMembers = new Set();

    households.forEach((household, idx) => {
      const householdKey = `household_${idx}`;

      // Rule 1: Mỗi hộ phải có 1 chủ hộ
      if (!household.owner) {
        newErrors[householdKey] = "Phải chọn chủ hộ";
      } else if (household.members.includes(household.owner)) {
        newErrors[householdKey] = "Chủ hộ không thể là thành viên khác";
      }

      // Rule 2 & 3: Mỗi thành viên chỉ được chọn 1 lần, chủ hộ không thể ở hộ khác
      const allMembersInHousehold = [household.owner, ...household.members];
      allMembersInHousehold.forEach((memberId) => {
        if (usedMembers.has(memberId)) {
          newErrors[householdKey] =
            "Thành viên này đã được chọn ở hộ khác";
        }
        usedMembers.add(memberId);
      });

      // Rule 4: Phải chọn quan hệ cho mỗi thành viên
      household.members.forEach((memberId) => {
        if (!household.memberRelations[memberId]) {
          newErrors[`${householdKey}_member_${memberId}`] =
            "Phải chọn quan hệ";
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (validateHouseholds(newHouseholds)) {
      if (onSave) {
        onSave(newHouseholds);
      }
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setSplitCount("");
    setNewHouseholds([]);
    setErrors({});
  };

  const getMembersList = () => {
    if (Array.isArray(householdData?.members)) {
      return householdData.members;
    }
    return householdData?.memberDetails || [];
  };

  const getAvailableMembers = (householdId) => {
    const usedMembers = new Set();
    newHouseholds.forEach((h, idx) => {
      if (idx !== householdId) {
        usedMembers.add(h.owner);
        h.members.forEach((m) => usedMembers.add(m));
      }
    });
    return getMembersList().filter((m) => !usedMembers.has(m.id));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tách hộ khẩu" size="xl">
      <div className="household-split-modal">
        <div className="step-1">
          <h3>Nhập số hộ mới muốn tách</h3>
          <div className="form-group">
            <label>Số hộ cần tách thành</label>
            <input
              type="number"
              min="2"
              className="form-control"
              placeholder="Ví dụ: 2, 3, 4..."
              value={splitCount}
              onChange={handleCountChange}
            />
            {errors.count && (
              <span className="error-message">{errors.count}</span>
            )}
          </div>
        </div>

        {newHouseholds.length > 0 && (
          <div className="step-2">
            <h3>Chia thành viên cho hộ mới</h3>
            <div className="households-container">
              {newHouseholds.map((household, idx) => (
                <div key={idx} className="household-card">
                  <div className="card-header">
                    <h4>Hộ mới #{idx + 1}</h4>
                    {errors[`household_${idx}`] && (
                      <span className="card-error">
                        ⚠ {errors[`household_${idx}`]}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Chủ hộ *</label>
                    <select
                      className="form-control"
                      value={household.owner}
                      onChange={(e) =>
                        handleOwnerChange(idx, parseInt(e.target.value) || "")
                      }
                    >
                      <option value="">Chọn chủ hộ</option>
                      {getAvailableMembers(idx).map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Thành viên</label>
                    <div className="members-list">
                      {getAvailableMembers(idx).map((member) => (
                        <div key={member.id} className="member-item">
                          <input
                            type="checkbox"
                            id={`member_${idx}_${member.id}`}
                            checked={household.members.includes(member.id)}
                            onChange={() => handleMemberToggle(idx, member.id)}
                            disabled={member.id === household.owner}
                          />
                          <label htmlFor={`member_${idx}_${member.id}`}>
                            {member.name}
                          </label>
                          {household.members.includes(member.id) && (
                            <select
                              className="form-control relation-select"
                              value={
                                household.memberRelations[member.id] || ""
                              }
                              onChange={(e) =>
                                handleRelationChange(idx, member.id, e.target.value)
                              }
                            >
                              <option value="">Quan hệ</option>
                              {RELATION_OPTIONS.map((rel) => (
                                <option key={rel} value={rel}>
                                  {rel}
                                </option>
                              ))}
                            </select>
                          )}
                          {errors[`household_${idx}_member_${member.id}`] && (
                            <span className="member-error">
                              {errors[`household_${idx}_member_${member.id}`]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button className="btn-cancel" onClick={handleClose}>
            Hủy bỏ
          </button>
          {newHouseholds.length > 0 && (
            <button
              className="btn-save"
              onClick={handleSubmit}
              disabled={Object.keys(errors).length > 0}
            >
              Tách hộ khẩu
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default HouseholdSplitModal;

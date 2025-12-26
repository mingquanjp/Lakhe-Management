import React, { useState, useEffect } from "react";
import Modal from "../../../../components/commons/Modal/Modal";
import "./HouseholdSplitModal.css";
import { fetchResidents } from "../../../../utils/api";

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

  const [membersList, setMembersList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && householdData?.id) {
      const loadMembers = async () => {
        try {
          setLoading(true);
          const response = await fetchResidents(householdData.id);
          if (response.success && response.data) {
            const formattedMembers = response.data.map((r) => ({
              id: r.resident_id,
              name: `${r.first_name} ${r.last_name}`,
              dob: r.dob,
            }));
            setMembersList(formattedMembers);
          }
        } catch (error) {
          console.error("Lỗi tải thành viên:", error);
          alert("Không thể tải danh sách thành viên của hộ này");
        } finally {
          setLoading(false);
        }
      };
      loadMembers();
    } else {
      setMembersList([]);
      setNewHouseholds([]);
      setSplitCount("");
      setErrors({});
    }
  }, [isOpen, householdData]);

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
          code: "",
          address: "",
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

  const handleInfoChange = (index, field, value) => {
    const updated = [...newHouseholds];
    updated[index][field] = value;
    setNewHouseholds(updated);

    if (errors[`household_${index}_${field}`]) {
      const newErrs = { ...errors };
      delete newErrs[`household_${index}_${field}`];
      setErrors(newErrs);
    }
  };

  const handleOwnerChange = (householdId, memberId) => {
    const updated = [...newHouseholds];

    if (updated[householdId].members.includes(memberId)) {
      updated[householdId].members = updated[householdId].members.filter(
        (m) => m !== memberId
      );
      delete updated[householdId].memberRelations[memberId];
    }

    updated[householdId].owner = memberId;
    setNewHouseholds(updated);
  };

  // Tích chọn thành viên
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
  };

  const handleRelationChange = (householdId, memberId, relation) => {
    const updated = [...newHouseholds];
    updated[householdId].memberRelations[memberId] = relation;
    setNewHouseholds(updated);
  };

  const getAvailableMembersForHousehold = (currentHouseholdIdx) => {
    const usedMembers = new Set();

    newHouseholds.forEach((h, idx) => {
      if (idx !== currentHouseholdIdx) {
        if (h.owner) usedMembers.add(h.owner);
        h.members.forEach((m) => usedMembers.add(m));
      }
    });

    return membersList.filter((m) => !usedMembers.has(m.id));
  };

  const validateHouseholds = (households) => {
    const newErrors = {};
    const usedMembers = new Set();

    households.forEach((household, idx) => {
      const householdKey = `household_${idx}`;
      if (!household.code.trim())
        newErrors[`${householdKey}_code`] = "Thiếu mã hộ";
      if (!household.address.trim())
        newErrors[`${householdKey}_address`] = "Thiếu địa chỉ";

      if (!household.owner) {
        newErrors[householdKey] = "Chưa chọn chủ hộ";
      }

      [household.owner, ...household.members].forEach((memberId) => {
        if (memberId && usedMembers.has(memberId)) {
        }
        if (memberId) usedMembers.add(memberId);
      });

      household.members.forEach((memberId) => {
        if (!household.memberRelations[memberId]) {
          newErrors[`${householdKey}_member_${memberId}`] = "Chọn quan hệ";
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateHouseholds(newHouseholds)) {
      const totalOriginalMembers = membersList.length;
      const assignedMembers = new Set();

      newHouseholds.forEach((h) => {
        if (h.owner) assignedMembers.add(h.owner);
        h.members.forEach((mId) => assignedMembers.add(mId));
      });

      if (assignedMembers.size < totalOriginalMembers) {
        alert(
          `Bạn chưa phân hết thành viên! Vẫn còn ${
            totalOriginalMembers - assignedMembers.size
          } người chưa được xếp vào hộ mới. Phải chuyển hết mới xóa được hộ cũ.`
        );
        return;
      }

      if (onSave) {
        const payload = {
          original_household_id: householdData.id,
          new_households: newHouseholds.map((h) => ({
            household_code: h.code,
            address: h.address,
            owner_id: h.owner,
            members: h.members.map((mId) => ({
              resident_id: mId,
              relation: h.memberRelations[mId],
            })),
          })),
        };
        onSave(payload);
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setSplitCount("");
    setNewHouseholds([]);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Tách hộ khẩu: ${householdData?.code || ""}`}
      size="xl"
    >
      <div className="household-split-modal">
        <div className="step-1">
          <div className="form-group">
            <label>Số hộ mới muốn tách thành:</label>
            <input
              type="number"
              min="2"
              max="5"
              className="form-control"
              placeholder="VD: 2"
              value={splitCount}
              onChange={handleCountChange}
              style={{ maxWidth: "100px" }}
            />
          </div>
        </div>

        {newHouseholds.length > 0 && (
          <div className="step-2">
            <div className="households-container">
              {newHouseholds.map((household, idx) => {
                const availablePeople = getAvailableMembersForHousehold(idx);

                return (
                  <div key={idx} className="household-card">
                    <div className="card-header">
                      <h4>Hộ mới #{idx + 1}</h4>
                      {errors[`household_${idx}`] && (
                        <span className="card-error">
                          {errors[`household_${idx}`]}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <input
                        className="form-control mb-2"
                        placeholder="Mã hộ mới (*)"
                        value={household.code}
                        onChange={(e) =>
                          handleInfoChange(idx, "code", e.target.value)
                        }
                      />
                      {errors[`household_${idx}_code`] && (
                        <small className="text-danger">
                          {errors[`household_${idx}_code`]}
                        </small>
                      )}

                      <input
                        className="form-control"
                        placeholder="Địa chỉ mới (*)"
                        value={household.address}
                        onChange={(e) =>
                          handleInfoChange(idx, "address", e.target.value)
                        }
                      />
                      {errors[`household_${idx}_address`] && (
                        <small className="text-danger">
                          {errors[`household_${idx}_address`]}
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Chọn Chủ hộ *</label>
                      <select
                        className="form-control"
                        value={household.owner}
                        onChange={(e) =>
                          handleOwnerChange(idx, parseInt(e.target.value) || "")
                        }
                      >
                        <option value="">-- Chọn --</option>
                        {availablePeople.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                      {errors[`household_${idx}`] === "Chưa chọn chủ hộ" && (
                        <small className="text-danger">
                          Vui lòng chọn chủ hộ
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Thành viên đi cùng:</label>
                      <div className="members-list">
                        {availablePeople
                          .filter((m) => m.id !== household.owner)
                          .map((member) => (
                            <div key={member.id} className="member-item">
                              <div className="checkbox-wrapper">
                                <input
                                  type="checkbox"
                                  id={`m_${idx}_${member.id}`}
                                  checked={household.members.includes(
                                    member.id
                                  )}
                                  onChange={() =>
                                    handleMemberToggle(idx, member.id)
                                  }
                                />
                                <label htmlFor={`m_${idx}_${member.id}`}>
                                  {member.name}
                                </label>
                              </div>

                              {household.members.includes(member.id) && (
                                <select
                                  className="form-control relation-select"
                                  value={
                                    household.memberRelations[member.id] || ""
                                  }
                                  onChange={(e) =>
                                    handleRelationChange(
                                      idx,
                                      member.id,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Quan hệ...</option>
                                  {RELATION_OPTIONS.map((rel) => (
                                    <option key={rel} value={rel}>
                                      {rel}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {errors[
                                `household_${idx}_member_${member.id}`
                              ] && (
                                <small className="text-danger d-block">
                                  Chọn quan hệ
                                </small>
                              )}
                            </div>
                          ))}

                        {availablePeople.filter((m) => m.id !== household.owner)
                          .length === 0 && (
                          <div
                            style={{
                              color: "#999",
                              fontSize: "13px",
                              fontStyle: "italic",
                              padding: "10px 0",
                            }}
                          >
                            Không còn thành viên khả dụng
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button className="btn-split-cancel" onClick={handleClose}>
            Hủy
          </button>
          {newHouseholds.length > 0 && (
            <button className="btn-save" onClick={handleSubmit}>
              Xác nhận Tách
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default HouseholdSplitModal;

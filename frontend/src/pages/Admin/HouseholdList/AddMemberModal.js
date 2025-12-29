import React from "react";
import { useState, useEffect, useRef } from "react";
import Modal from "../../../components/commons/Modal/Modal";
import "./AddMemberModal.css";

const DateInput = ({ value, onChange, className, name, ...props }) => {
  const dateInputRef = useRef(null);

  const formatDate = (dateString) => {
      if (!dateString) return '';
      const parts = dateString.split('-');
      if (parts.length !== 3) return dateString;
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const handleClick = () => {
      if (dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker();
      }
  };

  return (
      <div style={{ position: 'relative', width: '100%' }}>
          <input
              type="text"
              className={className}
              value={formatDate(value)}
              onClick={handleClick}
              readOnly
              placeholder="dd/mm/yyyy"
              style={{ cursor: 'pointer', backgroundColor: '#fff' }}
              {...props}
          />
          <input
              type="date"
              ref={dateInputRef}
              name={name}
              value={value}
              onChange={onChange}
              style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: 0,
                  height: 0,
                  opacity: 0,
                  pointerEvents: 'none'
              }}
              tabIndex={-1}
          />
      </div>
  );
};

const AddMemberModal = ({ isOpen, onClose, onSave, type, householdId, initialData }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    nickname: "",
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
    notes: "",
    temp_home_address: "",
    temp_start_date: "",
    temp_end_date: "",
    temp_reason: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          first_name: initialData.first_name || "",
          last_name: initialData.last_name || "",
          nickname: initialData.nickname || "",
          dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : "",
          gender: initialData.gender || "Male",
          relationship_to_head: initialData.relationship_to_head || "",
          place_of_birth: initialData.place_of_birth || "",
          place_of_origin: initialData.place_of_origin || "",
          ethnicity: initialData.ethnicity || "Kinh",
          occupation: initialData.occupation || "",
          workplace: initialData.workplace || "",
          identity_card_number: initialData.identity_card_number || "",
          identity_card_date: initialData.identity_card_date ? new Date(initialData.identity_card_date).toISOString().split('T')[0] : "",
          identity_card_place: initialData.identity_card_place || "",
          previous_address: initialData.previous_address || "",
          registration_date: initialData.registration_date ? new Date(initialData.registration_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          notes: initialData.notes || "",
          temp_home_address: initialData.temp_home_address || "",
          temp_start_date: initialData.temp_start_date ? new Date(initialData.temp_start_date).toISOString().split('T')[0] : "",
          temp_end_date: initialData.temp_end_date ? new Date(initialData.temp_end_date).toISOString().split('T')[0] : "",
          temp_reason: initialData.temp_reason || "",
        });
      } else {
        setFormData({
          first_name: "",
          last_name: "",
          nickname: "",
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
          notes: "",
          temp_home_address: "",
          temp_start_date: "",
          temp_end_date: "",
          temp_reason: "",
        });
      }
    }
  }, [isOpen, type, initialData]);

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

    let dataToSave = { ...formData, household_id: householdId };

    // Nếu là Mới sinh, set các trường không cần thiết thành null
    if (type === 'NewBirth') {
      dataToSave.occupation = null;
      dataToSave.workplace = null;
      dataToSave.identity_card_number = null;
      dataToSave.identity_card_date = null;
      dataToSave.identity_card_place = null;
    }

    // Nếu là Chuyển đến (Tạm trú), set status và validate
    if (type === 'MoveIn') {
        dataToSave.status = 'Temporary';
        if (!formData.temp_start_date || !formData.temp_end_date) {
             alert("Vui lòng nhập ngày bắt đầu và kết thúc tạm trú");
             return;
        }
    }
    
    // Add type for history logging
    dataToSave.change_type = type;

    onSave(dataToSave);
  };

  const getTitle = () => {
    if (initialData) return "Chỉnh sửa thông tin nhân khẩu";
    return type === 'NewBirth' ? "Thêm nhân khẩu mới sinh" : "Thêm nhân khẩu chuyển đến";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="lg">
      <div className="add-member-modal">
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
            <label>Biệt danh</label>
            <input
              type="text"
              className="form-control"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="Tên gọi khác (nếu có)"
            />
          </div>
          <div className="form-group">
            <label>Ngày sinh <span className="text-red-500">*</span></label>
            <DateInput
              className="form-control"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
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
          <div className="form-group">
            <label>Quan hệ với chủ hộ <span className="text-red-500">*</span></label>
            {type === 'NewBirth' ? (
              <select
                className="form-control"
                name="relationship_to_head"
                value={formData.relationship_to_head}
                onChange={handleChange}
              >
                <option value="">Chọn quan hệ</option>
                <option value="Con">Con</option>
                <option value="Cháu">Cháu</option>
              </select>
            ) : (
              <input
                type="text"
                className="form-control"
                name="relationship_to_head"
                value={formData.relationship_to_head}
                onChange={handleChange}
                placeholder="Con, Vợ, Chồng..."
              />
            )}
          </div>
          <div className="form-group">
            <label>Ngày đăng ký thường trú</label>
            <DateInput
              className="form-control"
              name="registration_date"
              value={formData.registration_date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nơi sinh</label>
            <input
              type="text"
              className="form-control"
              name="place_of_birth"
              value={formData.place_of_birth}
              onChange={handleChange}
              placeholder="Nhập nơi sinh"
            />
          </div>
          <div className="form-group">
            <label>Nguyên quán</label>
            <input
              type="text"
              className="form-control"
              name="place_of_origin"
              value={formData.place_of_origin}
              onChange={handleChange}
              placeholder="Nhập nguyên quán"
            />
          </div>
        </div>

        {/* Fields hidden for NewBirth */}
        {/* Show these fields if type is NOT NewBirth OR if we are editing a Temporary resident (which uses MoveIn type) */}
        {(type !== 'NewBirth' || (initialData && initialData.status === 'Temporary')) && (
          <>
            <div className="form-row">
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
              <div className="form-group">
                <label>Nơi làm việc</label>
                <input
                  type="text"
                  className="form-control"
                  name="workplace"
                  value={formData.workplace}
                  onChange={handleChange}
                />
              </div>
            </div>

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
                <label>Ngày cấp</label>
                <DateInput
                  className="form-control"
                  name="identity_card_date"
                  value={formData.identity_card_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Nơi cấp CMND/CCCD</label>
                <input
                  type="text"
                  className="form-control"
                  name="identity_card_place"
                  value={formData.identity_card_place}
                  onChange={handleChange}
                />
              </div>
            </div>
          </>
        )}

        {type === 'MoveIn' && (
          <>
            <div className="form-row">
              <div className="form-group full-width">
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
              <div className="form-group full-width">
                <label>Địa chỉ tạm trú hiện tại</label>
                <input
                  type="text"
                  className="form-control"
                  name="temp_home_address"
                  value={formData.temp_home_address}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ngày bắt đầu tạm trú <span className="text-red-500">*</span></label>
                <DateInput
                  className="form-control"
                  name="temp_start_date"
                  value={formData.temp_start_date}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Ngày kết thúc tạm trú <span className="text-red-500">*</span></label>
                <DateInput
                  className="form-control"
                  name="temp_end_date"
                  value={formData.temp_end_date}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Lý do tạm trú</label>
                <input
                  type="text"
                  className="form-control"
                  name="temp_reason"
                  value={formData.temp_reason}
                  onChange={handleChange}
                />
              </div>
            </div>
          </>
        )}

        <div className="form-row">
          <div className="form-group full-width">
            <label>Ghi chú</label>
            <textarea
              className="form-control"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
            />
          </div>
        </div>

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
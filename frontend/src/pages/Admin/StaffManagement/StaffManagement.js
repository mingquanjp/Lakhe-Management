import React, { useState } from "react";
import "./StaffManagement.css";
import Card from "../../../components/commons/Card/Card";
import Button from "../../../components/commons/Button/Button";
import Table from "../../../components/commons/Table/Table";
import Modal from "../../../components/commons/Modal/Modal";
import Input from "../../../components/commons/Input/Input";
import {
  exportIcon,
  plusIcon,
  searchIcon,
  filterIcon,
} from "../../../assets/icons";

const StaffManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Dummy data based on the image
  const rawData = [
    {
      id: 1,
      name: "Nguyễn Minh Quân",
      username: "quan36",
      dob: "3/6/2005",
      phone: "0363636366",
      role: "Tổ trưởng",
      roleType: "leader",
    },
    {
      id: 2,
      name: "Đặng Hoàng Quân",
      username: "quan36",
      dob: "3/6/2005",
      phone: "0363636366",
      role: "Tổ trưởng",
      roleType: "leader",
    },
    {
      id: 3,
      name: "Đinh Văn Phạm Việt",
      username: "viet36",
      dob: "3/6/2005",
      phone: "0363636366",
      role: "Tổ phó",
      roleType: "deputy",
    },
    {
      id: 4,
      name: "Nguyễn Minh Quân",
      username: "quan36",
      dob: "3/6/2005",
      phone: "0363636366",
      role: "Tổ trưởng",
      roleType: "leader",
    },
    {
      id: 5,
      name: "Tạ Hải Tùng",
      username: "tung36",
      dob: "3/6/2005",
      phone: "0363636366",
      role: "Kế toán",
      roleType: "accountant",
    },
    {
      id: 6,
      name: "Trần Nhật Hóa",
      username: "hoa36",
      dob: "3/6/2005",
      phone: "0363636366",
      role: "Kế toán",
      roleType: "accountant",
    },
    {
      id: 7,
      name: "Trịnh Văn Chiến",
      username: "chien36",
      dob: "3/6/2005",
      phone: "0363636366",
      role: "Tổ trưởng",
      roleType: "leader",
    },
    {
      id: 8,
      name: "Trần Thế Hùng",
      username: "hung36",
      dob: "3/6/2005",
      phone: "0363636366",
      role: "Kế toán",
      roleType: "accountant",
    },
    {
      id: 9,
      name: "Ban Hạ Băng",
      username: "bang36",
      dob: "3/6/2005",
      phone: "0363636366",
      role: "Tổ trưởng",
      roleType: "leader",
    },
    {
      id: 10,
      name: "Phạm Huy Hoàng",
      username: "hoang36",
      dob: "3/6/2005",
      phone: "0363636366",
      role: "Tổ trưởng",
      roleType: "leader",
    },
    {
      id: 11,
      name: "Đinh Viết Sang",
      username: "sang36",
      dob: "3/6/2005",
      phone: "0363636366",
      role: "Kế toán",
      roleType: "accountant",
    },
  ];

  // Transform data for Table component
  const tableData = rawData.map((item, index) => ({
    no: index + 1,
    name: item.name,
    username: item.username,
    dob: item.dob,
    phone: item.phone,
    role: (
      <span className={`role-badge role-${item.roleType}`}>{item.role}</span>
    ),
    action: (
      <div className="action-buttons">
        <button
          className="btn-action btn-edit"
          onClick={() => {
            setSelectedStaff(item);
            setIsEditModalOpen(true);
          }}
        >
          edit
        </button>
        <button
          className="btn-action btn-delete"
          onClick={() => {
            setSelectedStaff(item);
            setIsDeleteModalOpen(true);
          }}
        >
          delete
        </button>
        <button className="btn-action btn-more">⋮</button>
      </div>
    ),
  }));

  const columns = [
    { key: "no", title: "No." },
    { key: "name", title: "Họ và tên" },
    { key: "username", title: "Username" },
    { key: "dob", title: "Ngày sinh" },
    { key: "phone", title: "Số điện thoại" },
    { key: "role", title: "Role" },
    { key: "action", title: "Action" },
  ];

  return (
    <>
      <div className="content">
        <div className="staff-management-container">
          {/* Top Actions */}
          <div className="top-actions">
            <Button className="btn-top btn-export">
              <img src={exportIcon} alt="Export" className="btn-icon" />
              Export
            </Button>
            <Button
              className="btn-top btn-add"
              onClick={() => setIsModalOpen(true)}
            >
              <img src={plusIcon} alt="Add" className="btn-icon" />
              Add Staff
            </Button>
          </div>

          {/* Main Card */}
          <Card
            title="Quản lý Staff"
            subtitle="Detailed Staff Information Table"
            className="staff-card"
            actions={
              <div className="card-tools">
                <div className="search-wrapper">
                  <img src={searchIcon} alt="Search" className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="search-input"
                  />
                </div>
                <Button variant="outline" className="btn-filter">
                  <img src={filterIcon} alt="Filter" className="btn-icon" />
                  Filters
                </Button>
              </div>
            }
          >
            <Table columns={columns} data={tableData} className="staff-table" />
          </Card>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm cán bộ"
        size="large"
      >
        <p className="modal-subtitle">Điền các thông tin của cán bộ để thêm</p>
        <form className="add-staff-form">
          <div className="form-row full-width">
            <Input label="Họ và tên" placeholder="Nhập họ và tên" />
          </div>
          <div className="form-row">
            <Input label="Username" placeholder="Nhập username" />
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
            />
          </div>
          <div className="form-row">
            <Input label="Ngày sinh" type="date" placeholder="Chọn ngày sinh" />
            <Input label="Số điện thoại" placeholder="Nhập số điện thoại" />
          </div>
          <div className="form-row">
            <Input label="Vai trò" placeholder="Chọn vai trò" />
            <Input label="Gmail" type="email" placeholder="Nhập gmail" />
          </div>
          <div className="form-row full-width">
            <Input label="Địa chỉ" placeholder="Nhập địa chỉ" />
          </div>

          <div className="modal-actions">
            <Button className="btn-add-staff">Add</Button>
            <Button
              className="btn-cancel-staff"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa cán bộ"
        size="large"
      >
        <p className="modal-subtitle">
          Chỉnh sửa thông tin của cán bộ {selectedStaff?.name}
        </p>
        <form className="add-staff-form">
          <div className="form-row full-width">
            <Input
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              defaultValue={selectedStaff?.name}
            />
          </div>
          <div className="form-row">
            <Input
              label="Username"
              placeholder="Nhập username"
              defaultValue={selectedStaff?.username}
            />
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu mới (nếu có)"
            />
          </div>
          <div className="form-row">
            <Input
              label="Ngày sinh"
              type="date"
              placeholder="Chọn ngày sinh"
              // Convert "3/6/2005" to "2005-06-03" for date input if needed,
              // but for now just showing how to pass value.
              // Since the format in data is d/m/yyyy, we might need a helper,
              // but for mockup purposes, I'll leave it or just use text for now if date parsing is complex without momentjs
              // Let's assume the user will pick a new date or we just show empty for now to avoid format errors
            />
            <Input
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              defaultValue={selectedStaff?.phone}
            />
          </div>
          <div className="form-row">
            <Input
              label="Vai trò"
              placeholder="Chọn vai trò"
              defaultValue={selectedStaff?.role}
            />
            <Input label="Gmail" type="email" placeholder="Nhập gmail" />
          </div>
          <div className="form-row full-width">
            <Input label="Địa chỉ" placeholder="Nhập địa chỉ" />
          </div>

          <div className="modal-actions">
            <Button className="btn-add-staff">Save</Button>
            <Button
              className="btn-cancel-staff"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Xóa cán bộ"
        size="small"
      >
        <div className="delete-modal-content">
          <p className="delete-confirmation-text">
            Bạn có chắc chắn muốn xóa nhân viên{" "}
            <strong>{selectedStaff?.name}</strong> không?
          </p>
          <p className="delete-warning-text">
            Hành động này không thể hoàn tác.
          </p>
          <div className="modal-actions delete-actions">
            <Button className="btn-delete-confirm">Delete</Button>
            <Button
              className="btn-cancel-staff"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StaffManagement;

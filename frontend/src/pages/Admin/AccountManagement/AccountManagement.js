import React, { useState, useEffect } from "react";
import "./AccountManagement.css";
import { Search, UserPlus, Edit2, Trash2, Key } from "lucide-react";
import Modal from "../../../components/commons/Modal/Modal";
import Input from "../../../components/commons/Input/Input";
import Button from "../../../components/commons/Button/Button";
import { toast } from "react-toastify";

const AccountManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "staff"
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.full_name) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Tạo tài khoản thành công!");
        setIsAddModalOpen(false);
        setFormData({ username: "", password: "", full_name: "", role: "staff" });
        fetchUsers();
      } else {
        toast.error(data.message || "Tạo tài khoản thất bại");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Lỗi khi tạo tài khoản");
    }
  };

  // Handle update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/auth/users/${selectedUser.user_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: formData.full_name,
            role: formData.role,
            password: formData.password || undefined,
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Cập nhật tài khoản thành công!");
        setIsEditModalOpen(false);
        setFormData({ username: "", password: "", full_name: "", role: "staff" });
        fetchUsers();
      } else {
        toast.error(data.message || "Cập nhật tài khoản thất bại");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Lỗi khi cập nhật tài khoản");
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/auth/users/${selectedUser.user_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Xóa tài khoản thành công!");
        setIsDeleteModalOpen(false);
        fetchUsers();
      } else {
        toast.error(data.message || "Xóa tài khoản thất bại");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Lỗi khi xóa tài khoản");
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: "",
      full_name: user.full_name,
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Filter users
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="account-management-page">
      <div className="page-header">
        <h2 className="page-title">Quản lý cán bộ</h2>
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm tài khoản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="btn-tool btn-add"
            onClick={() => {
              setFormData({ username: "", password: "", full_name: "", role: "staff" });
              setIsAddModalOpen(true);
            }}
          >
            <UserPlus size={16} /> Thêm tài khoản
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="card-top">
          <span className="card-title">
            Tổng số: {filteredUsers.length} tài khoản
          </span>
        </div>

        {loading ? (
          <div className="loading-state">Đang tải...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên đăng nhập</th>
                <th>Họ và tên</th>
                <th>Vai trò</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.user_id}>
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.full_name}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === "admin" ? "Quản trị viên" : "Nhân viên"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => openEditModal(user)}
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => openDeleteModal(user)}
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="empty-state">Không tìm thấy tài khoản nào</div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm tài khoản mới"
      >
        <form onSubmit={handleCreateUser} className="user-form">
          <Input
            label="Tên đăng nhập"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <Input
            label="Họ và tên"
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <div className="form-group">
            <label>Vai trò</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="form-select"
            >
              <option value="staff">Nhân viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Tạo tài khoản
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa tài khoản"
      >
        <form onSubmit={handleUpdateUser} className="user-form">
          <Input
            label="Tên đăng nhập"
            type="text"
            value={formData.username}
            disabled
          />
          <Input
            label="Mật khẩu mới (để trống nếu không đổi)"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Input
            label="Họ và tên"
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <div className="form-group">
            <label>Vai trò</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="form-select"
            >
              <option value="staff">Nhân viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Cập nhật
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Xác nhận xóa"
      >
        <div className="delete-confirmation">
          <p>
            Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedUser?.username}</strong>?
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountManagement;
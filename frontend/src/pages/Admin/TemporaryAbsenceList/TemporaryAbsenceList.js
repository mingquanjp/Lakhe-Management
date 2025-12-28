import React from "react";
import { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import "./TemporaryAbsenceList.css";
import TemporaryAbsenceTable from "./TemporaryAbsenceTable";
import Pagination from "../../../components/commons/Pagination";
import Modal from "../../../components/commons/Modal";
import { exportToExcel } from "../../../utils/excelExport";
import { toast } from "react-toastify";
import { getAuthToken } from "../../../utils/api";

const TemporaryAbsenceList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:5000/api/residents/list/temporary-absence', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      // console.error('Error fetching temporary absences:', error);
    }
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5000/api/residents/temporary-absence/${itemToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (response.ok && result.success) {
        toast.success("Xóa thành công!");
        fetchData();
        setIsDeleteConfirmOpen(false);
        setItemToDelete(null);
      } else {
        toast.error(result.message || "Lỗi khi xóa");
      }
    } catch (error) {
      // console.error("Error deleting:", error);
      toast.error("Lỗi kết nối server");
    }
  };


  // Filter logic
  const filteredData = data.filter(item => {
    const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const birthDate = item.dob ? new Date(item.dob).toLocaleDateString('vi-VN') : "";
    const startDate = item.start_date ? new Date(item.start_date).toLocaleDateString('vi-VN') : "";
    const endDate = item.end_date ? new Date(item.end_date).toLocaleDateString('vi-VN') : "";
    
    const matchesSearch = 
      fullName.includes(searchLower) ||
      (item.household_code && item.household_code.toLowerCase().includes(searchLower)) ||
      (item.temporary_address && item.temporary_address.toLowerCase().includes(searchLower)) ||
      (item.identity_card_number && item.identity_card_number.includes(searchLower)) ||
      (birthDate && birthDate.includes(searchLower)) ||
      (startDate && startDate.includes(searchLower)) ||
      (endDate && endDate.includes(searchLower)) ||
      (item.reason && item.reason.toLowerCase().includes(searchLower));
    return matchesSearch;
  });

  const handleExport = () => {
    const exportData = filteredData.map(item => ({
      "Mã hộ khẩu": item.household_code,
      "Họ tên": `${item.last_name} ${item.first_name}`,
      "Ngày sinh": new Date(item.dob).toLocaleDateString('vi-VN'),
      "CMND/CCCD": item.identity_card_number,
      "Nơi tạm vắng": item.temporary_address,
      "Từ ngày": new Date(item.start_date).toLocaleDateString('vi-VN'),
      "Đến ngày": new Date(item.end_date).toLocaleDateString('vi-VN'),
      "Lý do": item.reason
    }));
    exportToExcel(exportData, "Danh_sach_tam_vang", "Danh sách tạm vắng");
  };

  const handleDetailClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="household-page">
      <div className="page-header">
        <h2 className="page-title">Danh sách tạm vắng</h2>
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-temporary-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-tool" onClick={handleExport}>
              <Download size={16} /> Xuất Excel
            </button>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="card-top">
          <span className="card-title">Tổng số người tạm vắng: {filteredData.length}</span>
        </div>

        <TemporaryAbsenceTable 
          data={currentItems} 
          onDetail={handleDetailClick}
          onDelete={handleDelete}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Chi tiết tạm vắng"
        size="medium"
      >
        {selectedItem && (
          <div className="detail-modal-content">
            <div className="detail-row">
              <strong>Mã hộ khẩu:</strong> {selectedItem.household_code}
            </div>
            <div className="detail-row">
              <strong>Họ và tên:</strong> {selectedItem.first_name} {selectedItem.last_name}
            </div>
            <div className="detail-row">
              <strong>Ngày sinh:</strong> {new Date(selectedItem.dob).toLocaleDateString('vi-VN')}
            </div>
            <div className="detail-row">
              <strong>Giới tính:</strong> {selectedItem.gender === 'Male' ? 'Nam' : selectedItem.gender === 'Female' ? 'Nữ' : selectedItem.gender}
            </div>
            <div className="detail-row">
              <strong>CMND/CCCD:</strong> {selectedItem.identity_card_number}
            </div>
            <div className="detail-row">
              <strong>Nơi tạm vắng:</strong> {selectedItem.temporary_address}
            </div>
            <div className="detail-row">
              <strong>Từ ngày:</strong> {new Date(selectedItem.start_date).toLocaleDateString('vi-VN')}
            </div>
            <div className="detail-row">
              <strong>Đến ngày:</strong> {new Date(selectedItem.end_date).toLocaleDateString('vi-VN')}
            </div>
            <div className="detail-row">
              <strong>Lý do:</strong> {selectedItem.reason}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        title="Xác nhận xóa"
        size="sm"
      >
        <div style={{ padding: "20px" }}>
          <p style={{ marginBottom: "20px", color: "#333" }}>
            Bạn có chắc chắn muốn xóa bản ghi tạm vắng này? Thao tác này không thể hoàn tác.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              className="modal-btn-cancel"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setItemToDelete(null);
              }}
            >
              Hủy
            </button>
            <button
              className="modal-btn-delete"
              onClick={handleConfirmDelete}
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TemporaryAbsenceList;
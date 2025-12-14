import React, { useState, useEffect } from "react";
import { Search, Filter, Download } from "lucide-react";
import "./HouseholdTemporaryList.css";
import HouseholdTemporaryTable from "./HouseholdTemporaryTable";
import Pagination from "../../../components/commons/Pagination";
import Modal from "../../../components/commons/Modal";

const HouseholdTemporaryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/residents/list/temporary-residence');
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching temporary residents:', error);
    }
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
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="household-page">
      <div className="page-header">
        <h2 className="page-title">Danh sách hộ khẩu tạm trú</h2>
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>
          <button className="btn-tool">
            <Filter size={16} /> Filters
          </button>
          <button className="btn-tool">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="card-top">
          <span className="card-title">Danh sách tạm trú</span>
        </div>

        <HouseholdTemporaryTable 
          data={currentItems} 
          onDetail={handleDetailClick}
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
        title="Chi tiết tạm trú"
        size="medium"
      >
        {selectedItem && (
          <div className="detail-modal-content">
            <div className="detail-row">
              <strong>Họ và tên:</strong> {selectedItem.last_name} {selectedItem.first_name}
            </div>
            <div className="detail-row">
              <strong>Ngày sinh:</strong> {new Date(selectedItem.birth_date).toLocaleDateString('vi-VN')}
            </div>
            <div className="detail-row">
              <strong>Giới tính:</strong> {selectedItem.gender}
            </div>
            <div className="detail-row">
              <strong>CMND/CCCD:</strong> {selectedItem.identity_card_number}
            </div>
            <div className="detail-row">
              <strong>Số điện thoại:</strong> {selectedItem.phone_number}
            </div>
            <div className="detail-row">
              <strong>Email:</strong> {selectedItem.email}
            </div>
            <div className="detail-row">
              <strong>Địa chỉ tạm trú:</strong> {selectedItem.temporary_address}
            </div>
            <div className="detail-row">
              <strong>Chủ hộ:</strong> {selectedItem.host_name}
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
    </div>
  );
};

export default HouseholdTemporaryList;

import React, { useState, useEffect } from "react"; // 1. Import thêm useEffect
import { Search, Filter, Download, Split } from "lucide-react";
import "./HouseholdList.css";
import HouseholdTable from "./HouseholdTable";
import Pagination from "../../../components/commons/Pagination";
// 2. Bỏ dòng import mockData đi: import { householdData } from "../../../data/mockData";
import HouseholdAddModal from "./HouseholdAddModal";
import HouseholdSplitModal from "./HouseholdSplitModal";
// 3. Import hàm gọi API
import { fetchHouseholds } from "../../../utils/api"; 

const HouseholdList = () => {
  // 4. Thêm state để lưu dữ liệu thật
  const [households, setHouseholds] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const itemsPerPage = 8;

  // 5. Gọi API khi trang vừa load
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetchHouseholds();
        
        // Chuyển đổi dữ liệu API cho khớp với giao diện cũ
        if (response.success && response.data) {
          const formattedData = response.data.map(item => ({
            id: item.household_id,
            code: item.household_code,   // API trả về household_code
            owner: item.owner_name || "Chưa có chủ hộ", // API trả về owner_name
            address: item.address,
            members: 0, // Tạm thời để 0 vì API chưa đếm số thành viên
          }));
          setHouseholds(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch households:", error);
        // Có thể thêm thông báo lỗi ở đây (Alert/Toast)
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 6. Sửa logic phân trang để dùng state 'households' thay vì mockData
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = households.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(households.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSaveHousehold = (newData) => {
    console.log("Dữ liệu nhận được từ form:", newData);
    // Sau này sẽ gọi API tạo mới ở đây rồi load lại danh sách
  };

  const handleSplitHousehold = (newData) => {
    console.log("Dữ liệu tách hộ khẩu:", newData);
  };

  const handleSplitClick = (household) => {
    setSelectedHousehold(household);
    setIsSplitModalOpen(true);
  };

  return (
    <div className="household-page">
      <div className="page-header">
        <h2 className="page-title">Danh sách hộ khẩu thường trú</h2>
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
          <button className="btn-tool btn-add" onClick={() => setIsAddModalOpen(true)}>
            <Split size={16} /> Thêm hộ khẩu
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="card-top">
          <span className="card-title">
            {loading ? "Đang tải dữ liệu..." : `Tổng số: ${households.length} hộ khẩu`}
          </span>
        </div>

        {/* Truyền dữ liệu thật vào bảng */}
        <HouseholdTable data={currentItems} onSplit={handleSplitClick} />

        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={paginate}
          />
        )}
      </div>

      <HouseholdAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleSaveHousehold}
        size="xl"
      />

      {selectedHousehold && (
        <HouseholdSplitModal
          isOpen={isSplitModalOpen}
          onClose={() => setIsSplitModalOpen(false)}
          householdData={selectedHousehold}
          onSave={handleSplitHousehold}
        />
      )}
    </div>
  );
};

export default HouseholdList;
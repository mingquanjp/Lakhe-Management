import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Split } from "lucide-react";
import "./HouseholdList.css";
import HouseholdTable from "./HouseholdTable";
import Pagination from "../../../components/commons/Pagination";
import HouseholdAddModal from "./HouseholdAddModal";
import HouseholdSplitModal from "./HouseholdSplitModal";
import {
  fetchHouseholds,
  createHousehold,
  deleteHousehold,
  splitHousehold,
} from "../../../utils/api";
import { exportToCSV } from "../../../utils/exportUtils";

const HouseholdList = () => {
  const navigate = useNavigate();
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 8;

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchHouseholds();

      if (response.success && response.data) {
        const formattedData = response.data.map((item) => ({
          id: item.household_id,
          code: item.household_code,
          owner: item.owner_name || "Chưa có chủ hộ",
          address: item.address,
          members: parseInt(item.member_count) || 0,
        }));
        setHouseholds(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch households:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter logic
  const filteredHouseholds = households.filter(item => {
    const matchesSearch = 
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleExport = () => {
    const exportData = filteredHouseholds.map(item => ({
      "Mã hộ khẩu": item.code,
      "Chủ hộ": item.owner,
      "Địa chỉ": item.address,
      "Số thành viên": item.members
    }));
    exportToCSV(exportData, "Danh_sach_ho_khau");
  };

  const handleSaveHousehold = async (formData) => {
    try {
      await createHousehold(formData);
      alert("Thêm hộ khẩu thành công!");
      setIsAddModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Lỗi:", error);
      alert(error.message || "Có lỗi xảy ra khi tạo hộ khẩu");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa hộ khẩu này? Hành động này sẽ xóa cả các nhân khẩu bên trong!"
      )
    ) {
      try {
        await deleteHousehold(id);
        alert("Xóa thành công!");
        loadData();
      } catch (error) {
        console.error("Lỗi xóa:", error);
        alert(error.message || "Không thể xóa hộ khẩu này");
      }
    }
  };

  const handleSplitHousehold = async (splitData) => {
    try {
      await splitHousehold(splitData);
      alert("Tách hộ thành công!");
      setIsSplitModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Lỗi tách hộ:", error);
      alert(error.message);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHouseholds
    .slice(indexOfFirstItem, indexOfLastItem)
    .map((item, index) => ({
      ...item,
      stt: indexOfFirstItem + index + 1,
    }));
  const totalPages = Math.ceil(filteredHouseholds.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSplitClick = (household) => {
    setSelectedHousehold(household);
    setIsSplitModalOpen(true);
  };

  const handleDetailClick = (household) => {
    navigate(`/admin/household/${household.id}`);
  };

  return (
    <div className="household-page">
      <div className="page-header">
        <h2 className="page-title">Danh sách hộ khẩu thường trú</h2>
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-tool" onClick={handleExport}>
            <Download size={16} /> Export
          </button>
          <button
            className="btn-tool btn-add"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Split size={16} /> Thêm hộ khẩu
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="card-top">
          <span className="card-title">
            {loading
              ? "Đang tải dữ liệu..."
              : `Tổng số: ${filteredHouseholds.length} hộ khẩu`}
          </span>
        </div>

        <HouseholdTable
          data={currentItems}
          onSplit={handleSplitClick}
          onDelete={handleDelete}
          onDetail={handleDetailClick}
        />

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

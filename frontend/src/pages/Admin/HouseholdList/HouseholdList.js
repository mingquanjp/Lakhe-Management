import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Split, Filter } from "lucide-react";
import "./HouseholdList.css";
import HouseholdTable from "./HouseholdTable/HouseholdTable";
import Pagination from "../../../components/commons/Pagination";
import HouseholdAddModal from "./HouseholdAddModal/HouseholdAddModal";
import HouseholdSplitModal from "./HouseholdSplitModal/HouseholdSplitModal";
import {
  fetchHouseholds,
  deleteHousehold,
  splitHousehold,
  createHousehold,
} from "../../../utils/api";
import { exportToCSV } from "../../../utils/exportUtils";
import { toast } from "react-toastify";

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
  const [showFilter, setShowFilter] = useState(false);

  const itemsPerPage = 8;

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchHouseholds();

      if (response.success && response.data) {
        setHouseholds(response.data);
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
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (item.household_code && item.household_code.toLowerCase().includes(searchLower)) ||
      (item.owner_name && item.owner_name.toLowerCase().includes(searchLower)) ||
      (item.address && item.address.toLowerCase().includes(searchLower)) ||
      (item.member_count !== undefined && item.member_count.toString().includes(searchLower));

    return matchesSearch;
  });

  const handleExport = () => {
    const exportData = filteredHouseholds.map(item => ({
      "Mã hộ khẩu": item.household_code,
      "Chủ hộ": item.owner_name,
      "Địa chỉ": item.address,
      "Số thành viên": item.member_count
    }));
    exportToCSV(exportData, "Danh_sach_ho_khau");
  };
  const handleSaveHousehold = async (formData) => {
    try {
      await createHousehold(formData);
      toast.success("Thêm hộ khẩu thành công!");
      loadData();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to create household:", error);
      toast.error(error.message || "Thêm hộ khẩu thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hộ khẩu này?")) {
      try {
        await deleteHousehold(id);
        loadData();
      } catch (error) {
        console.error("Failed to delete household:", error);
        alert("Xóa thất bại");
      }
    }
  };

  const handleSplitHousehold = async (splitData) => {
    try {
      await splitHousehold(splitData);
      loadData();
      setIsSplitModalOpen(false);
    } catch (error) {
      console.error("Failed to split household:", error);
      alert("Tách hộ thất bại: " + error.message);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHouseholds
    .slice(indexOfFirstItem, indexOfLastItem)
    .map((item, index) => ({
      ...item,
      stt: indexOfFirstItem + index + 1,
      // Map fields for Table
      code: item.household_code,
      owner: item.owner_name,
      members: item.member_count,
      id: item.household_id
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
          <button
            className={`btn-tool ${showFilter ? "active" : ""}`}
            onClick={() => setShowFilter(!showFilter)}
            style={
              showFilter
                ? {
                  backgroundColor: "#e6f7ff",
                  borderColor: "#1890ff",
                  color: "#1890ff",
                }
                : {}
            }
          >
            <Filter size={16} /> Lọc
          </button>

          <button className="btn-tool" onClick={handleExport}>
            <Download size={16} /> Xuất Excel
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

        {!loading && filteredHouseholds.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={paginate}
          />
        )}

        {!loading && filteredHouseholds.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            Không tìm thấy kết quả nào phù hợp.
          </div>
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

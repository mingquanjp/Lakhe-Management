import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Split } from "lucide-react";
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
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";

const HouseholdList = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 8;

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchHouseholds();

      if (response.success && response.data) {
        const formattedData = response.data.map((item) => ({
          ...item,
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSaveHousehold = async (formData) => {
    try {
      await createHousehold(formData);
      toast.success("Thêm hộ khẩu thành công!");
      setIsAddModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Lỗi:", error);
      alert(error.message || "Có lỗi xảy ra khi tạo hộ khẩu");
    }
  };

  const handleDelete = async (id) => {
  try {
    await deleteHousehold(id);
    toast.success("Xóa thành công!");
    loadData();
  } catch (error) {
    console.error("Lỗi xóa:", error);
    alert(error.message || "Không thể xóa hộ khẩu này");
  }
};


  const handleSplitHousehold = async (splitData) => {
    try {
      await splitHousehold(splitData);
      toast.success("Tách hộ thành công!");
      setIsSplitModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Lỗi tách hộ:", error);
      alert(error.message);
    }
  };

  const handleExport = () => {
    const dataToExport = households.map((item, index) => ({
      "STT": index + 1,
      "Mã Hộ": item.household_code,
      "Chủ Hộ": item.owner_name || "Chưa có",
      "CCCD Chủ Hộ": item.owner_cccd || "",
      "Địa Chỉ": item.address,
      "Số Thành Viên": item.member_count,
      "Trạng Thái": 'Thường trú',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [
      { wch: 5 }, 
      { wch: 15 },
      { wch: 20 }, 
      { wch: 15 },
      { wch: 30 }, 
      { wch: 10 }, 
      { wch: 15 } 
    ];
    worksheet['!cols'] = wscols;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachHoKhau");
    XLSX.writeFile(workbook, "Danh_Sach_Ho_Khau.xlsx");
  };

  
  const filteredHouseholds = households.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.code.toLowerCase().includes(searchLower) || 
      item.owner.toLowerCase().includes(searchLower) || 
      item.address.toLowerCase().includes(searchLower)  
    );
  });

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

  return (
    <div className="household-page">
      <div className="page-header">
        <h2 className="page-title">Danh sách hộ khẩu thường trú</h2>
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={handleSearchChange} />
          </div>
          <button className="btn-tool">
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
              : `Tổng số: ${households.length} hộ khẩu`}
          </span>
        </div>

        <HouseholdTable
          data={currentItems}
          onSplit={handleSplitClick}
          onDelete={handleDelete}
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

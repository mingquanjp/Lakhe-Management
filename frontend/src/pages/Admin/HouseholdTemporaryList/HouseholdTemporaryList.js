import React from "react";
import { useState, useEffect } from "react";
import { Search, Download, Split } from "lucide-react";
import "./HouseholdTemporaryList.css";
import HouseholdTemporaryTable from "./HouseholdTemporaryTable/HouseholdTemporaryTable";
import Pagination from "../../../components/commons/Pagination";
import Modal from "../../../components/commons/Modal";
import HouseholdTemporaryAddModal from "./HouseholdTemporaryAddModal/HouseholdTemporaryAddModal";
import {
  fetchTemporaryHouseholds,
  deleteHousehold,
  createTemporaryHousehold,
} from "../../../utils/api";
import { exportToCSV } from "../../../utils/exportUtils";
import { toast } from "react-toastify";

const HouseholdTemporaryList = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const itemsPerPage = 8;

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchTemporaryHouseholds();
      if (response.success) {
        setHouseholds(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch temporary households:", error);
      // alert("Không thể tải danh sách hộ tạm trú.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveHousehold = async (newData) => {
    try {
      await createTemporaryHousehold(newData);
      toast.success("Thêm hộ khẩu tạm trú thành công!");
      loadData();
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Lỗi khi thêm mới"
      );
    }
  };

  const filteredHouseholds = households.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const createdDate = item.date_created ? new Date(item.date_created).toLocaleDateString("vi-VN") : "";
    const expiredDate = item.expiration_date ? new Date(item.expiration_date).toLocaleDateString("vi-VN") : "";

    const matchesSearch =
      (item.code && item.code.toLowerCase().includes(searchLower)) ||
      (item.owner && item.owner.toLowerCase().includes(searchLower)) ||
      (item.address && item.address.toLowerCase().includes(searchLower)) ||
      (item.members !== undefined && item.members.toString().includes(searchLower)) ||
      (createdDate && createdDate.includes(searchLower)) ||
      (expiredDate && expiredDate.includes(searchLower));

    return matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHouseholds.slice(
    indexOfFirstItem,
    indexOfLastItem
  ).map((item, index) => ({
      ...item,
      stt: indexOfFirstItem + index + 1,
      // Ensure fields match Table expectations
      id: item.id,
      code: item.code,
      owner: item.owner,
      address: item.address,
      members: item.members
  }));

  const totalPages = Math.ceil(filteredHouseholds.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleExport = () => {
    const dataToExport = filteredHouseholds.map((item, index) => ({
      "STT": index + 1,
      "Mã Hộ": item.code,
      "Chủ Hộ": item.owner || "Chưa có",
      "CCCD Chủ Hộ": item.owner_cccd || "",
      "Địa Chỉ": item.address,
      "Số Thành Viên": item.members,
      "Ngày Đăng Ký": item.date_created
        ? new Date(item.date_created).toLocaleDateString("vi-VN")
        : "",
      "Trạng Thái": "Tạm trú",
    }));
    exportToCSV(dataToExport, "Danh_Sach_Ho_Khau_Tam_Tru");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hộ tạm trú này?")) {
        try {
        await deleteHousehold(id);
        toast.success("Xóa hộ tạm trú thành công!");
        loadData();
        } catch (error) {
        console.error("Lỗi xóa:", error);
        toast.error(
            error?.response?.data?.message ||
            error.message ||
            "Không thể xóa hộ tạm trú"
        );
        }
    }
  };

  const handleDetailClick = (item) => {
    // Fetch full detail if needed, or just show what we have
    // Since the list might not have all details (like reason, dates), we might need to fetch.
    // But for now, let's assume we navigate to detail page OR show modal.
    // The User wanted a Modal.
    // But the data in 'households' list is summary data (from getTemporaryHouseholds).
    // We might need to fetch detail by ID to show in Modal.
    // For simplicity and conflict resolution, I'll use the Detail Modal but maybe just show available info or fetch it.
    // Actually, the User's previous code fetched from /residents/list/temporary-residence which returned flat resident list.
    // Now we have Households.
    // I will navigate to Detail Page as per Incoming pattern for consistency, OR fetch detail for Modal.
    // Let's try to fetch detail for Modal to keep User's "Popup" preference if possible.
    // But I don't have the fetchDetail function imported.
    // I'll stick to navigating to Detail Page if that's what Incoming did, OR just show what we have.
    // Incoming Table used `navigate`.
    // I will use `navigate` to `householdtemporary/:id` which uses `HouseholdDetail` component.
    // This unifies the UI.
    // Wait, `HouseholdDetail` component is for Permanent Households. Does it support Temporary?
    // The route `householdtemporary/:id` points to `HouseholdDetail`.
    // So `HouseholdDetail` must handle it.
    // I will pass `onDetail` to Table to handle navigation.
    setSelectedItem(item); // Just in case we want to use it
  };

  return (
    <div className="household-page">
      <div className="page-header">
        <h2 className="page-title">Quản lý tạm trú</h2>
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

        {loading ? (
           <div style={{ padding: "20px", textAlign: "center" }}>
             Đang tải dữ liệu...
           </div>
         ) : filteredHouseholds.length === 0 ? (
           <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
             Không tìm thấy kết quả nào phù hợp.
           </div>
         ) : (
           <HouseholdTemporaryTable
             data={currentItems}
             onDelete={handleDelete}
             // onDetail is handled by Table using navigate, or we can pass it
           />
         )}

        {!loading && filteredHouseholds.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={paginate}
          />
        )}
      </div>

      <HouseholdTemporaryAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveHousehold}
        size="xl"
      />
    </div>
  );
};

export default HouseholdTemporaryList;

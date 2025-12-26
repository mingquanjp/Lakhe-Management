import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Split} from "lucide-react";
import "./HouseholdTemporaryList.css";
import HouseholdTemporaryTable from "./HouseholdTemporaryTable/HouseholdTemporaryTable";
import Pagination from "../../../components/commons/Pagination";
import HouseholdTemporaryAddModal from "./HouseholdTemporaryAddModal/HouseholdTemporaryAddModal";
import Modal from "../../../components/commons/Modal/Modal";
import {
  fetchTemporaryHouseholds,
  deleteHousehold,
  createTemporaryHousehold,
} from "../../../utils/api";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const HouseholdTemporaryList = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    minMembers: "",
    maxMembers: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [householdToDelete, setHouseholdToDelete] = useState(null);
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
      alert("Không thể tải danh sách hộ tạm trú.");
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (value !== "" && parseInt(value) < 1) {
      return;
    }
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const filteredHouseholds = households.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (item.code && item.code.toLowerCase().includes(searchLower)) ||
      (item.owner && item.owner.toLowerCase().includes(searchLower)) ||
      (item.address && item.address.toLowerCase().includes(searchLower));

    let matchesMembers = true;
    const memberCount = parseInt(item.members) || 0;

    if (filters.minMembers !== "") {
      matchesMembers =
        matchesMembers && memberCount >= parseInt(filters.minMembers);
    }
    if (filters.maxMembers !== "") {
      matchesMembers =
        matchesMembers && memberCount <= parseInt(filters.maxMembers);
    }

    return matchesSearch && matchesMembers;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHouseholds.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredHouseholds.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleExport = () => {
    const dataToExport = filteredHouseholds.map((item, index) => ({
      STT: index + 1,
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

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [
      { wch: 5 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    worksheet["!cols"] = wscols;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachTamTru");
    XLSX.writeFile(workbook, "Danh_Sach_Ho_Khau_Tam_Tru.xlsx");
  };

  const handleDelete = async (id) => {
    setHouseholdToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!householdToDelete) return;
    try {
      await deleteHousehold(householdToDelete);
      toast.success("Xóa hộ tạm trú thành công!");
      setIsDeleteConfirmOpen(false);
      setHouseholdToDelete(null);
      loadData();
    } catch (error) {
      console.error("Lỗi xóa:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Không thể xóa hộ tạm trú"
      );
      setIsDeleteConfirmOpen(false);
      setHouseholdToDelete(null);
    }
  };

  const isFiltering =
    searchTerm !== "" || filters.minMembers !== "" || filters.maxMembers !== "";

  return (
    <div className="household-page">
      <div className="page-header">
        <h2 className="page-title">Danh sách hộ khẩu tạm trú</h2>
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={handleSearchChange}
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

      {showFilter && (
        <div
          className="filter-panel"
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #eee",
            display: "flex",
            gap: "20px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontWeight: 500, fontSize: "14px" }}>
              Số nhân khẩu:
            </span>
            <input
              type="number"
              name="minMembers"
              placeholder="Min"
              min="1"
              value={filters.minMembers}
              onChange={handleFilterChange}
              className="form-control"
              style={{
                width: "80px",
                height: "36px",
                padding: "0 10px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
              }}
            />
            <span>-</span>
            <input
              type="number"
              name="maxMembers"
              placeholder="Max"
              min="1"
              value={filters.maxMembers}
              onChange={handleFilterChange}
              className="form-control"
              style={{
                width: "80px",
                height: "36px",
                padding: "0 10px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>
      )}

      <div className="table-card">
        <div className="card-top">
          <span className="card-title">
            {loading
              ? "Đang tải dữ liệu..."
              : isFiltering
              ? `Hiển thị ${filteredHouseholds.length} kết quả (Tổng: ${households.length})`
              : `Tổng số: ${households.length} hộ khẩu`}
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

      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setHouseholdToDelete(null);
        }}
        title="Xác nhận xóa"
        size="sm"
      >
        <div style={{ padding: "20px" }}>
          <p style={{ marginBottom: "20px", color: "#333" }}>
            Bạn có chắc chắn muốn xóa hộ khẩu này? Thao tác này không thể hoàn tác.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              className="modal-btn-cancel"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setHouseholdToDelete(null);
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

export default HouseholdTemporaryList;
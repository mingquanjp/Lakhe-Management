import React, { useState } from "react";
import { Search, Filter, Download, Split } from "lucide-react";
import "./HouseholdTemporaryList.css";
import HouseholdTemporaryTable from "./HouseholdTemporaryTable";
import Pagination from "../../../components/commons/Pagination";
import { householdTemporaryData } from "../../../data/mockData";
import HouseholdTemporaryAddModal from "./HouseholdTemporaryAddModal";

const HouseholdTemporaryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const itemsPerPage = 8;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = householdTemporaryData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(householdTemporaryData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSaveHousehold = (newData) => {
    console.log("Dữ liệu nhận được từ form:", newData);
  };

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
          <button className="btn-tool btn-add" onClick={() => setIsAddModalOpen(true)}>
            <Split size={16} /> Thêm hộ khẩu
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="card-top">
          <span className="card-title">List content</span>
        </div>

        <HouseholdTemporaryTable data={currentItems} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
        />
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

import React, { useState } from "react";
// 1. Thêm import icon Split
import { Search, Filter, Download, Split } from "lucide-react";
import "./HouseholdList.css";
import HouseholdTable from "./HouseholdTable";
import Pagination from "../../../components/commons/Pagination";
import { householdData } from "../../../data/mockData";
import HouseholdAddModal from "./HouseholdAddModal";
import HouseholdSplitModal from "./HouseholdSplitModal";

const HouseholdList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const itemsPerPage = 8;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = householdData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(householdData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSaveHousehold = (newData) => {
    console.log("Dữ liệu nhận được từ form:", newData);
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
          <button className="btn-tool btn-filter">
            <Filter size={16} /> Filters
          </button>
          <button className="btn-tool btn-export">
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

        <HouseholdTable data={currentItems} onSplit={handleSplitClick} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
        />
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

import React, { useState } from "react";
import { Search, Filter, Download } from "lucide-react";
import "./HouseholdList.css";
import HouseholdTable from "./HouseholdTable";
import Pagination from "../../../components/commons/Pagination";
import { householdData } from "../../../data/mockData";
const HouseholdList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = householdData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(householdData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="household-page">
      <div className="page-header">
        <h2 className="page-title">Danh sách hộ khẩu</h2>
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
        </div>
      </div>

      <div className="table-card">
        <div className="card-top">
          <span className="card-title">List content</span>
        </div>

        <HouseholdTable data={currentItems} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
        />
      </div>
    </div>
  );
};

export default HouseholdList;

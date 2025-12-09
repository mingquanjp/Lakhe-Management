import React, { useState, useEffect } from "react";
import { Search, Filter, Download } from "lucide-react";
import "./TemporaryAbsenceList.css";
import TemporaryAbsenceTable from "./TemporaryAbsenceTable";
import Pagination from "../../../components/commons/Pagination";

const TemporaryAbsenceList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/residents/list/temporary-absence');
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching temporary absences:', error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="household-page">
      <div className="page-header">
        <h2 className="page-title">Danh sách tạm vắng</h2>
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
          <span className="card-title">Danh sách tạm vắng</span>
        </div>

        <TemporaryAbsenceTable data={currentItems} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
        />
      </div>
    </div>
  );
};

export default TemporaryAbsenceList;
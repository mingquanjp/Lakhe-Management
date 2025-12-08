import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// 1. Thêm import icon Split
import { Search, Filter, Download, Split } from "lucide-react";
import "./HouseholdList.css";
import HouseholdTable from "./HouseholdTable";
import Pagination from "../../../components/commons/Pagination";
import HouseholdAddModal from "./HouseholdAddModal";
import HouseholdSplitModal from "./HouseholdSplitModal";

const HouseholdList = () => {
  const navigate = useNavigate();
  const [households, setHouseholds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const fetchHouseholds = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/households');
      if (response.ok) {
        const data = await response.json();
        setHouseholds(data);
      } else {
        console.error('Failed to fetch households');
      }
    } catch (error) {
      console.error('Error fetching households:', error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = households.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(households.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSaveHousehold = async (newData) => {
    try {
      const response = await fetch('http://localhost:5000/api/households', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        alert('Thêm hộ khẩu thành công!');
        fetchHouseholds(); // Refresh list
        setIsAddModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(`Lỗi: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating household:', error);
      alert('Có lỗi xảy ra khi thêm hộ khẩu');
    }
  };

  const handleSplitHousehold = async (newData) => {
    try {
      const response = await fetch('http://localhost:5000/api/households/split', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        alert('Tách hộ khẩu thành công!');
        fetchHouseholds(); // Refresh list
        setIsSplitModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(`Lỗi: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error splitting household:', error);
      alert('Có lỗi xảy ra khi tách hộ khẩu');
    }
  };

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

        <HouseholdTable 
          data={currentItems} 
          onSplit={handleSplitClick} 
          onDetail={handleDetailClick}
        />

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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Table from '../../../components/commons/Table/Table';
import Button from '../../../components/commons/Button/Button';
import { getAuthToken } from '../../../utils/api';
import './HistoryList.css';

const HistoryList = () => {
    const navigate = useNavigate();
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'last_change_date', direction: 'desc' });
    const itemsPerPage = 10;

    useEffect(() => {
        fetchHouseholdsWithHistory();
    }, []);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchHouseholdsWithHistory = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch('http://localhost:5000/api/history/households', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setHouseholds(data.data);
            }
        } catch (error) {
            console.error('Error fetching history list:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredHouseholds = households.filter(h => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (h.household_code && h.household_code.toLowerCase().includes(searchLower)) ||
            (h.owner_name && h.owner_name.toLowerCase().includes(searchLower)) ||
            (h.address && h.address.toLowerCase().includes(searchLower))
        );
    });

    // Sorting Logic
    const sortedHouseholds = [...filteredHouseholds].sort((a, b) => {
        if (sortConfig.key === 'last_change_date') {
            const dateA = new Date(a.last_change_date);
            const dateB = new Date(b.last_change_date);
            if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }
        return 0;
    });

    const columns = [
        { key: 'household_code', title: 'Mã hộ khẩu' },
        { key: 'owner_name', title: 'Chủ hộ' },
        { key: 'address', title: 'Địa chỉ' },
        { 
            key: 'last_change_date', 
            title: (
                <div 
                    className="flex items-center cursor-pointer gap-1 select-none"
                    onClick={() => handleSort('last_change_date')}
                >
                    Ngày thay đổi gần nhất
                    {sortConfig.key === 'last_change_date' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    ) : (
                        <ArrowUpDown size={14} className="text-gray-400" />
                    )}
                </div>
            ) 
        },
        { key: 'actions', title: 'Hành động' },
    ];

    // Pagination Logic
    const totalPages = Math.ceil(sortedHouseholds.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedHouseholds.slice(indexOfFirstItem, indexOfLastItem);

    const tableData = currentItems.map(h => ({
        ...h,
        last_change_date: new Date(h.last_change_date).toLocaleDateString('vi-VN'),
        actions: (
            <Button 
                variant="primary" 
                size="small"
                onClick={() => navigate(`/admin/history/${h.household_id}`)}
            >
                Chi tiết
            </Button>
        )
    }));

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxVisiblePages = 5; // Show at most 5 page numbers

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show first page
            pageNumbers.push(1);

            if (currentPage > 3) {
                pageNumbers.push('...');
            }

            // Show pages around current page
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                endPage = 4;
            }
            if (currentPage >= totalPages - 2) {
                startPage = totalPages - 3;
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }

            // Always show last page
            pageNumbers.push(totalPages);
        }

        return (
            <div className="pagination-container">
                <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    &lt;
                </button>
                
                {pageNumbers.map((number, index) => (
                    <React.Fragment key={index}>
                        {number === '...' ? (
                            <span className="pagination-dots">...</span>
                        ) : (
                            <button
                                className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                                onClick={() => setCurrentPage(number)}
                            >
                                {number}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    &gt;
                </button>
            </div>
        );
    };

    return (
        <div className="p-6">
            <div className="mb-5">
                <h1 className="page-title">Lịch sử biến động</h1>
            </div>

            <div className="history-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        <Table 
                            columns={columns} 
                            data={tableData} 
                        />
                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
};

export default HistoryList;
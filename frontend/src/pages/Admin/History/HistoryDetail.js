import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/commons/Button/Button';
import Table from '../../../components/commons/Table/Table';
import { fetchHistory, getHouseholdById } from '../../../utils/api';
import './HistoryDetail.css';

const HistoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [historyData, setHistoryData] = useState([]);
    const [household, setHousehold] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [historyRes, householdRes] = await Promise.all([
                    fetchHistory(id),
                    getHouseholdById(id, true) 
                ]);
                
                setHistoryData(historyRes.data);
                setHousehold(householdRes.household);
            } catch (error) {
                console.error('Error loading history detail:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const getChangeTypeBadge = (type) => {
        let label = type;
        let className = 'bg-blue-100 text-blue-800';

        switch (type) {
            case 'NewBirth':
                label = 'Mới sinh';
                className = 'bg-green-100 text-green-800';
                break;
            case 'Death':
                label = 'Khai tử';
                className = 'bg-red-100 text-red-800';
                break;
            case 'MoveOut':
                label = 'Chuyển đi';
                className = 'bg-yellow-100 text-yellow-800';
                break;
            case 'Split':
                label = 'Tách hộ';
                className = 'bg-purple-100 text-purple-800';
                break;
            case 'ChangeHead':
            case 'ChangeHeadOfHousehold':
                label = 'Thay đổi chủ hộ';
                className = 'bg-indigo-100 text-indigo-800';
                break;
            case 'UpdateInfo':
                label = 'Cập nhật thông tin';
                className = 'bg-blue-100 text-blue-800';
                break;
            case 'Added':
                label = 'Chuyển đến';
                className = 'bg-green-100 text-green-800';
                break;
            case 'TemporaryAbsence':
                label = 'Tạm vắng';
                className = 'bg-orange-100 text-orange-800';
                break;
            case 'Removed':
                label = 'Loại bỏ';
                className = 'bg-red-100 text-red-800';
                break;
            default:
                label = type;
        }

        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}>
                {label}
            </span>
        );
    };

    const columns = [
        { key: 'date', title: 'Ngày thay đổi' },
        { key: 'type', title: 'Loại thay đổi' },
        { key: 'user', title: 'Người thực hiện' },
        { key: 'resident', title: 'Nhân khẩu liên quan' }
    ];

    const formattedData = historyData.map(item => ({
        date: new Date(item.change_date).toLocaleDateString('vi-VN'),
        type: getChangeTypeBadge(item.change_type),
        user: item.changed_by || 'Admin',
        resident: (item.first_name || item.last_name) 
            ? `${item.first_name || ''} ${item.last_name || ''}`.trim() 
            : 'Tất cả'
    }));

    if (loading) return <div>Loading...</div>;
    if (!household) return <div>Household not found</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="page-title">Chi tiết biến động</h1>
                </div>
            </div>

            <div className="detail-card">
                <div className="detail-card-header">
                    <h2 className="detail-card-title">Thông tin chung</h2>
                </div>
                <div className="detail-card-body">
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">MÃ HỘ KHẨU</span>
                            <span className="info-value">{household.household_code}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">CHỦ HỘ</span>
                            <span className="info-value">{household.owner_name}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">ĐỊA CHỈ</span>
                            <span className="info-value">{household.address}</span>
                        </div>
                    </div>
                </div>
            </div>

            <Table 
                columns={columns} 
                data={formattedData} 
            />
        </div>
    );
};

export default HistoryDetail;
import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../../components/commons/Card/Card';
import Table from '../../../components/commons/Table/Table';
import Button from '../../../components/commons/Button/Button';
import Modal from '../../../components/commons/Modal/Modal';
import AddMemberModal from './AddMemberModal';
import { getHouseholdById, fetchHistory, getAuthToken } from '../../../utils/api';
import './HouseholdDetail.css';

const StatusBadge = ({ status }) => {
    let colorClass = '';
    let dotColor = '';
    let displayStatus = status;
    
    if (status === 'Permanent' || status === 'Thường trú') {
        colorClass = 'bg-green-100 text-green-700';
        dotColor = 'bg-green-500';
        displayStatus = 'Thường trú';
    } else if (status === 'MovedOut' || status === 'Đã chuyển đi') {
        colorClass = 'bg-yellow-100 text-yellow-700';
        dotColor = 'bg-yellow-500';
        displayStatus = 'Đã chuyển đi';
    } else if (status === 'Deceased' || status === 'Đã qua đời') {
        colorClass = 'bg-red-100 text-red-700';
        dotColor = 'bg-red-500';
        displayStatus = 'Đã qua đời';
    } else if (status === 'Temporary' || status === 'Tạm trú') {
        colorClass = 'bg-blue-100 text-blue-700';
        dotColor = 'bg-blue-500';
        displayStatus = 'Tạm trú';
    } else {
        colorClass = 'bg-gray-100 text-gray-700';
        dotColor = 'bg-gray-500';
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></span>
            {displayStatus}
        </span>
    );
};

const HouseholdDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [household, setHousehold] = useState(null);
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [addMemberType, setAddMemberType] = useState('NewBirth'); // 'NewBirth' or 'MoveIn'
    const [editingMember, setEditingMember] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [selectedResidentDetail, setSelectedResidentDetail] = useState(null); // For MovedOut/Deceased details

    useEffect(() => {
        fetchHouseholdDetails();
    }, [id]);

    const fetchHouseholdDetails = async () => {
        try {
            const data = await getHouseholdById(id);
            setHousehold(data.household);
            setResidents(data.residents);
        } catch (error) {
            console.error('Error fetching household details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchHistory = async () => {
        try {
            const data = await fetchHistory(id);
            setHistoryData(data.data);
            setIsHistoryModalOpen(true);
        } catch (error) {
            console.error('Error fetching history:', error);
            alert('Không thể tải lịch sử biến động. Vui lòng thử lại sau.');
        }
    };

    const handleSelectType = (type) => {
        setEditingMember(null);
        setAddMemberType(type);
        setIsAddMemberModalOpen(true);
    };

    const handleEditClick = (member) => {
        setEditingMember(member);
        // Nếu là tạm trú thì set type là MoveIn để hiện các trường tạm trú
        if (member.status === 'Temporary' || member.status === 'Tạm trú') {
            setAddMemberType('MoveIn');
        } else {
            // Nếu là thường trú thì set type khác NewBirth để hiện đầy đủ các trường (nghề nghiệp, CCCD...)
            setAddMemberType('Permanent');
        }
        setIsAddMemberModalOpen(true);
    };

    const handleDeleteClick = async (residentId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhân khẩu này?')) {
            try {
                const token = getAuthToken();
                
                const response = await fetch(`http://localhost:5000/api/residents/${residentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                    
                });

                if (response.ok) {
                    alert('Xóa nhân khẩu thành công!');
                    fetchHouseholdDetails();
                } else {
                    const errorData = await response.json();
                    alert(`Lỗi: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error deleting resident:', error);
                alert('Có lỗi xảy ra khi xóa nhân khẩu');
            }
        }
    };

    const handleSaveMember = async (memberData) => {
        try {
            const token = getAuthToken();
            
            const url = editingMember 
                ? `http://localhost:5000/api/residents/${editingMember.resident_id}`
                : 'http://localhost:5000/api/residents';
            
            const method = editingMember ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
            
                },
                body: JSON.stringify(memberData),
            });

            if (response.ok) {
                alert(editingMember ? 'Cập nhật nhân khẩu thành công!' : 'Thêm nhân khẩu thành công!');
                setIsAddMemberModalOpen(false);
                setEditingMember(null);
                fetchHouseholdDetails(); // Refresh list
            } else {
                const errorData = await response.json();
                alert(`Lỗi: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error saving resident:', error);
            alert('Có lỗi xảy ra khi lưu thông tin nhân khẩu');
        }
    };

    const columns = [
        { key: 'identity_card_number', title: 'CCCD' },
        { key: 'full_name', title: 'Họ và tên' },
        { key: 'relationship_to_head', title: 'Quan hệ với chủ hộ' },
        { key: 'dob', title: 'Ngày sinh' },
        { key: 'occupation', title: 'Nghề nghiệp' },
        { key: 'statusDisplay', title: 'Trạng thái' },
        { key: 'actions', title: 'Hành động' },
    ];

    const createTableData = (data) => data.map(member => ({
    
        ...member,
        full_name: `${member.first_name} ${member.last_name}`,
        dob: new Date(member.dob).toLocaleDateString('vi-VN'),
        statusDisplay: <StatusBadge status={member.status} />,
        actions: (
            <div className="table-actions">
                <button 
                    className="btn-action btn-detail"
                    onClick={() => handleEditClick(member)}
                >
                    Sửa
                </button>
                <button 
                    className="btn-action btn-delete"
                    onClick={() => handleDeleteClick(member.resident_id)}
                >
                    Xóa
                </button>
            </div>
        )
    }));

    const permanentResidents = residents.filter(r => r.status === 'Permanent' || r.status === 'Thường trú');
    const temporaryResidents = residents.filter(r => r.status === 'Temporary' || r.status === 'Tạm trú');
    const historyResidents = residents.filter(r => ['MovedOut', 'Deceased', 'Đã chuyển đi', 'Đã qua đời'].includes(r.status));

    const permanentTableData = createTableData(permanentResidents);
    const temporaryTableData = createTableData(temporaryResidents);
    
    const historyTableData = historyResidents.map(member => ({
        ...member,
        full_name: `${member.first_name} ${member.last_name}`,
        dob: new Date(member.dob).toLocaleDateString('vi-VN'),
        statusDisplay: <StatusBadge status={member.status} />,
        actions: (
            <div className="table-actions">
                <button 
                    className="btn-action btn-detail"
                    onClick={() => setSelectedResidentDetail(member)}
                >
                    Xem chi tiết
                </button>
            </div>
        )
    }));


    if (loading) return <div>Loading...</div>;
    if (!household) return <div>Household not found</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="page-title">Chi tiết hộ khẩu: {household.household_code}</h2>
            </div>

            <div className="detail-card">
                <div className="detail-card-header">
                    <h2 className="detail-card-title">Thông tin chung</h2>
                </div>
                <div className="detail-card-body">
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Chủ hộ:</span>
                            <span className="info-value">{household.owner_name}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Địa chỉ:</span>
                            <span className="info-value">{household.address}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Ngày tạo:</span>
                            <span className="info-value">{new Date(household.date_created).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {household.status !== 'Temporary' && (
                <div className="detail-card">
                    <div className="detail-card-header flex-between">
                        <h2 className="detail-card-title">Danh sách thường trú</h2>
                        <Button 
                            variant="primary" 
                            className="btn-add-member"
                            onClick={() => handleSelectType('NewBirth')}
                        >
                            + Thêm mới sinh
                        </Button>
                    </div>
                    
                    <div className="detail-card-body p-0">
                        <Table 
                            columns={columns} 
                            data={permanentTableData} 
                            className="w-full"
                        />
                    </div>
                </div>
            )}

            <div className="detail-card mt-6">
                <div className="detail-card-header flex-between">
                    <h2 className="detail-card-title">Danh sách tạm trú (Chuyển đến)</h2>
                </div>
                
                <div className="detail-card-body p-0">
                    <Table 
                        columns={columns} 
                        data={temporaryTableData} 
                        className="w-full"
                    />
                </div>
            </div>

            {historyResidents.length > 0 && (
                <div className="detail-card mt-6">
                    <div className="detail-card-header">
                        <h2 className="detail-card-title">Nhân khẩu đã chuyển đi / Qua đời</h2>
                    </div>
                    <div className="detail-card-body p-0">
                        <Table 
                            columns={columns} 
                            data={historyTableData} 
                            className="w-full"
                        />
                    </div>
                </div>
            )}

            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                onSave={handleSaveMember}
                type={addMemberType}
                householdId={household.household_id}
                initialData={editingMember}
            />

            <Modal
                isOpen={!!selectedResidentDetail}
                onClose={() => setSelectedResidentDetail(null)}
                title="Chi tiết biến động nhân khẩu"
                size="medium"
            >
                {selectedResidentDetail && (
                    <div className="p-0">
                        <table className="w-full text-sm text-left text-gray-500">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 w-1/3">
                                        Họ và tên
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 font-semibold text-lg">
                                        {selectedResidentDetail.first_name} {selectedResidentDetail.last_name}
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50">
                                        Ngày sinh
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">
                                        {new Date(selectedResidentDetail.dob).toLocaleDateString('vi-VN')}
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50">
                                        CCCD
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">
                                        {selectedResidentDetail.identity_card_number || 'Chưa có'}
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50">
                                        Trạng thái
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={selectedResidentDetail.status} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 align-top">
                                        Chi tiết biến động
                                    </td>
                                    <td className="px-6 py-4 text-gray-800 whitespace-pre-wrap bg-yellow-50">
                                        {selectedResidentDetail.notes || 'Không có ghi chú'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                title="Lịch sử biến động"
                size="large"
            >
                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Ngày thay đổi</th>
                                <th>Loại thay đổi</th>
                                <th>Người thực hiện</th>
                                <th>Nhân khẩu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyData.length > 0 ? (
                                historyData.map((item) => (
                                    <tr key={item.history_id}>
                                        <td>{new Date(item.change_date).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span className={`history-badge ${
                                                item.change_type === 'NewBirth' ? 'badge-success' :
                                                item.change_type === 'Death' ? 'badge-danger' :
                                                item.change_type === 'MoveOut' ? 'badge-warning' :
                                                item.change_type === 'UpdateInfo' ? 'badge-info' :
                                                'badge-info'
                                            }`}>
                                                {item.change_type === 'NewBirth' ? 'Mới sinh' :
                                                 item.change_type === 'Death' ? 'Khai tử' :
                                                 item.change_type === 'MoveOut' ? 'Chuyển đi' :
                                                 item.change_type === 'Split' ? 'Tách hộ' : 
                                                 item.change_type === 'UpdateInfo' ? 'Cập nhật' : item.change_type}
                                            </span>
                                        </td>
                                        <td>{item.changed_by || 'Admin'}</td>
                                        <td>{item.last_name} {item.first_name}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-data">Chưa có lịch sử biến động</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
};

export default HouseholdDetail;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../../components/commons/Card/Card';
import Table from '../../../components/commons/Table/Table';
import Button from '../../../components/commons/Button/Button';
import Modal from '../../../components/commons/Modal/Modal';
import AddMemberModal from './AddMemberModal';
import './HouseholdDetail.css';

const StatusBadge = ({ status }) => {
    let colorClass = '';
    let dotColor = '';
    
    if (status === 'Permanent' || status === 'Thường trú') {
        colorClass = 'bg-green-100 text-green-700';
        dotColor = 'bg-green-500';
    } else if (status === 'MovedOut' || status === 'Đã chuyển đi') {
        colorClass = 'bg-yellow-100 text-yellow-700';
        dotColor = 'bg-yellow-500';
    } else if (status === 'Deceased' || status === 'Đã qua đời') {
        colorClass = 'bg-red-100 text-red-700';
        dotColor = 'bg-red-500';
    } else {
        colorClass = 'bg-gray-100 text-gray-700';
        dotColor = 'bg-gray-500';
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></span>
            {status}
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
    const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);
    const [addMemberType, setAddMemberType] = useState('NewBirth'); // 'NewBirth' or 'MoveIn'
    const [editingMember, setEditingMember] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        fetchHouseholdDetails();
    }, [id]);

    const fetchHouseholdDetails = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/households/${id}`);
            if (response.ok) {
                const data = await response.json();
                setHousehold(data.household);
                setResidents(data.residents);
            } else {
                console.error('Failed to fetch household details');
            }
        } catch (error) {
            console.error('Error fetching household details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/history/household/${id}`);
            if (response.ok) {
                const data = await response.json();
                setHistoryData(data.data);
                setIsHistoryModalOpen(true);
            } else {
                console.error('Failed to fetch history');
                alert('Không thể tải lịch sử biến động. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            alert('Lỗi kết nối server. Vui lòng kiểm tra lại.');
        }
    };

    const handleOpenTypeSelection = () => {
        setEditingMember(null);
        setIsTypeSelectionOpen(true);
    };

    const handleSelectType = (type) => {
        setAddMemberType(type);
        setIsTypeSelectionOpen(false);
        setIsAddMemberModalOpen(true);
    };

    const handleEditClick = (member) => {
        setEditingMember(member);
        setAddMemberType(member.status === 'Permanent' ? 'MoveIn' : 'NewBirth'); // Just a default, or infer from data
        setIsAddMemberModalOpen(true);
    };

    const handleDeleteClick = async (residentId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhân khẩu này?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/residents/${residentId}`, {
                    method: 'DELETE',
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
            const url = editingMember 
                ? `http://localhost:5000/api/residents/${editingMember.resident_id}`
                : 'http://localhost:5000/api/residents';
            
            const method = editingMember ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
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
        { key: 'resident_id', title: 'ID' },
        { key: 'full_name', title: 'Họ và tên' },
        { key: 'relationship_to_head', title: 'Quan hệ với chủ hộ' },
        { key: 'dob', title: 'Ngày sinh' },
        { key: 'occupation', title: 'Nghề nghiệp' },
        { key: 'statusDisplay', title: 'Trạng thái' },
        { key: 'actions', title: 'Hành động' },
    ];

    const tableData = residents.map(member => ({
        ...member,
        full_name: `${member.first_name} ${member.last_name}`,
        dob: new Date(member.dob).toLocaleDateString('vi-VN'),
        statusDisplay: <StatusBadge status={member.status} />,
        actions: (
            <div className="flex gap-4">
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

    if (loading) return <div>Loading...</div>;
    if (!household) return <div>Household not found</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Chi tiết hộ khẩu: {household.household_code}</h1>
                <div className="flex gap-2">
                    <Button 
                        variant="secondary" 
                        onClick={fetchHistory}
                    >
                        Lịch sử thay đổi nhân khẩu
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => navigate('/admin/household')}
                    >
                        Quay lại
                    </Button>
                </div>
            </div>

            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-2">Thông tin chung</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-500">Chủ hộ: </span>
                        <span className="ml-2 font-medium">{household.owner_name}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Địa chỉ: </span>
                        <span className="ml-2 font-medium">{household.address}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Ngày tạo: </span>
                        <span className="ml-2 font-medium">{new Date(household.date_created).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
            </div>

            <Card className="bg-white shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Danh sách nhân khẩu</h2>
                    <div className="flex gap-2">
                        <Button 
                            variant="primary" 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                            onClick={handleOpenTypeSelection}
                        >
                            + Thêm nhân khẩu mới
                        </Button>
                    </div>
                </div>
                
                <Table 
                    columns={columns} 
                    data={tableData} 
                    className="w-full"
                />
            </Card>

            {/* Modal chọn loại thêm mới */}
            <Modal 
                isOpen={isTypeSelectionOpen} 
                onClose={() => setIsTypeSelectionOpen(false)}
                title="Chọn loại thêm mới"
                size="medium"
            >
                <div className="type-selection-container">
                    <div 
                        className="type-option-card new-birth"
                        onClick={() => handleSelectType('NewBirth')}
                    >
                        <div className="type-option-icon">
                            👶
                        </div>
                        <div className="type-option-title">Mới sinh</div>
                        <div className="type-option-desc">Thêm trẻ em mới sinh vào hộ khẩu</div>
                    </div>

                    <div 
                        className="type-option-card move-in"
                        onClick={() => handleSelectType('MoveIn')}
                    >
                        <div className="type-option-icon">
                            🚚
                        </div>
                        <div className="type-option-title">Chuyển đến</div>
                        <div className="type-option-desc">Thêm người từ nơi khác chuyển đến</div>
                    </div>
                </div>
            </Modal>

            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                onSave={handleSaveMember}
                type={addMemberType}
                householdId={household.household_id}
                initialData={editingMember}
            />

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
                                                'badge-info'
                                            }`}>
                                                {item.change_type === 'NewBirth' ? 'Mới sinh' :
                                                 item.change_type === 'Death' ? 'Khai tử' :
                                                 item.change_type === 'MoveOut' ? 'Chuyển đi' :
                                                 item.change_type === 'Split' ? 'Tách hộ' : item.change_type}
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

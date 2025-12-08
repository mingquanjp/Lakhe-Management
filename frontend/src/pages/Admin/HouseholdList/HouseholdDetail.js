import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../../components/commons/Card/Card';
import Table from '../../../components/commons/Table/Table';
import Button from '../../../components/commons/Button/Button';
import Modal from '../../../components/commons/Modal/Modal';
import AddMemberModal from './AddMemberModal';

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

    const handleOpenTypeSelection = () => {
        setIsTypeSelectionOpen(true);
    };

    const handleSelectType = (type) => {
        setAddMemberType(type);
        setIsTypeSelectionOpen(false);
        setIsAddMemberModalOpen(true);
    };

    const handleSaveMember = async (memberData) => {
        try {
            const response = await fetch('http://localhost:5000/api/residents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(memberData),
            });

            if (response.ok) {
                alert('Thêm nhân khẩu thành công!');
                setIsAddMemberModalOpen(false);
                fetchHouseholdDetails(); // Refresh list
            } else {
                const errorData = await response.json();
                alert(`Lỗi: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error adding resident:', error);
            alert('Có lỗi xảy ra khi thêm nhân khẩu');
        }
    };

    const columns = [
        { key: 'resident_id', title: 'ID' },
        { key: 'full_name', title: 'Họ và tên' },
        { key: 'relationship_to_head', title: 'Quan hệ với chủ hộ' },
        { key: 'dob', title: 'Ngày sinh' },
        { key: 'occupation', title: 'Nghề nghiệp' },
        { key: 'statusDisplay', title: 'Trạng thái' },
    ];

    const tableData = residents.map(member => ({
        ...member,
        full_name: `${member.first_name} ${member.last_name}`,
        dob: new Date(member.dob).toLocaleDateString('vi-VN'),
        statusDisplay: <StatusBadge status={member.status} />
    }));

    if (loading) return <div>Loading...</div>;
    if (!household) return <div>Household not found</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Chi tiết hộ khẩu: {household.household_code}</h1>
                <Button 
                    variant="secondary" 
                    onClick={() => navigate('/admin/household')}
                >
                    Quay lại
                </Button>
            </div>

            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-2">Thông tin chung</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-500">Chủ hộ:</span>
                        <span className="ml-2 font-medium">{household.owner_name}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Địa chỉ:</span>
                        <span className="ml-2 font-medium">{household.address}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Ngày tạo:</span>
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
                size="sm"
            >
                <div className="flex flex-col gap-4 p-4">
                    <button 
                        className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all text-left flex items-center gap-3"
                        onClick={() => handleSelectType('NewBirth')}
                    >
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                            👶
                        </div>
                        <div>
                            <div className="font-semibold text-gray-800">Mới sinh</div>
                            <div className="text-sm text-gray-500">Thêm trẻ em mới sinh vào hộ khẩu</div>
                        </div>
                    </button>

                    <button 
                        className="p-4 border rounded-lg hover:bg-green-50 hover:border-green-500 transition-all text-left flex items-center gap-3"
                        onClick={() => handleSelectType('MoveIn')}
                    >
                        <div className="bg-green-100 p-2 rounded-full text-green-600">
                            🚚
                        </div>
                        <div>
                            <div className="font-semibold text-gray-800">Chuyển đến</div>
                            <div className="text-sm text-gray-500">Thêm người từ nơi khác chuyển đến</div>
                        </div>
                    </button>
                </div>
            </Modal>

            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                onSave={handleSaveMember}
                type={addMemberType}
                householdId={household.household_id}
            />
        </div>
    );
};

export default HouseholdDetail;

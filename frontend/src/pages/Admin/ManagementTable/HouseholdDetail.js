import React, { useState } from 'react';
import Card from '../../../components/commons/Card/Card';
import Table from '../../../components/commons/Table/Table';
import Button from '../../../components/commons/Button/Button';
import Modal from '../../../components/commons/Modal/Modal';
import Input from '../../../components/commons/Input/Input';

// Mock Data
const initialHouseholds = [
    { 
        id: 1, 
        householdId: 'HK001',
        ownerName: 'Nguyễn Minh Quân', 
        address: 'Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
        memberCount: 4,
        regDate: '01/01/2020',
        status: 'Thường trú' 
    },
    { 
        id: 2, 
        householdId: 'HK002',
        ownerName: 'Đặng Hoàng Quân', 
        address: 'Số 10, Tạ Quang Bửu, Hai Bà Trưng, Hà Nội',
        memberCount: 3,
        regDate: '15/03/2021',
        status: 'Thường trú' 
    },
    { 
        id: 3, 
        householdId: 'HK003',
        ownerName: 'Đinh Văn Phạm Việt', 
        address: 'Số 5, Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội',
        memberCount: 2,
        regDate: '20/11/2022',
        status: 'Tạm trú' 
    },
];

const StatusBadge = ({ status }) => {
    let colorClass = '';
    let dotColor = '';
    
    if (status === 'Thường trú') {
        colorClass = 'bg-green-100 text-green-700';
        dotColor = 'bg-green-500';
    } else if (status === 'Tạm trú') {
        colorClass = 'bg-yellow-100 text-yellow-700';
        dotColor = 'bg-yellow-500';
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
    const [selectedHousehold, setSelectedHousehold] = useState(null);
    const [households] = useState(initialHouseholds);
    
    // New Household Form State
    const [isAddHouseholdModalOpen, setIsAddHouseholdModalOpen] = useState(false);
    const [newHouseholdData, setNewHouseholdData] = useState({
        householdId: '',
        ownerName: '',
        address: ''
    });

    const handleNewHouseholdChange = (e) => {
        const { name, value } = e.target;
        setNewHouseholdData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleNewHouseholdSubmit = (e) => {
        e.preventDefault();
        console.log('New Household Data:', newHouseholdData);
        alert('Đã gửi thông tin khai báo hộ khẩu mới!');
        setIsAddHouseholdModalOpen(false);
    };

    const columns = [
        { key: 'householdId', title: 'Mã hộ khẩu' },
        { key: 'ownerName', title: 'Chủ hộ' },
        { key: 'address', title: 'Địa chỉ' },
        { key: 'memberCount', title: 'Số thành viên' },
        { key: 'regDate', title: 'Ngày đăng ký' },
        { key: 'statusDisplay', title: 'Trạng thái' },
        { key: 'actions', title: 'Hành động' },
    ];

    // Transform data for Table component
    const tableData = households.map(household => ({
        ...household,
        statusDisplay: <StatusBadge status={household.status} />,
        actions: (
            <div className="flex items-center space-x-2">
                <Button 
                    size="small" 
                    variant="primary" 
                    onClick={() => setSelectedHousehold(household)}
                    className="bg-cyan-400 hover:bg-cyan-500 border-none"
                >
                    Sửa
                </Button>
                <Button 
                    size="small" 
                    variant="danger"
                    className="bg-red-500 hover:bg-red-600 text-white border-none"
                >
                    Xóa
                </Button>
            </div>
        )
    }));

    return (
        <div className="p-6">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Quản lý hộ khẩu</h1>
                    <p className="text-gray-500 text-sm">Danh sách các hộ khẩu trong khu vực quản lý</p>
                </div>
                <div className="flex gap-2">
                     {/* Using Button component for navigation/action */}
                     <Button 
                        variant="primary" 
                        className="bg-gray-800 hover:bg-gray-900"
                        onClick={() => setIsAddHouseholdModalOpen(true)}
                     >
                        Khai báo hộ khẩu
                     </Button>
                </div>
            </div>

            <Card className="bg-white shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-800 whitespace-nowrap">Danh sách hộ khẩu</h2>
                    <div className="flex gap-2 flex-1 justify-end">
                        <Input placeholder="Search..." className="w-full max-w-md" />
                    </div>
                </div>
                
                <Table 
                    columns={columns} 
                    data={tableData} 
                    className="w-full"
                />
                
                {/* Pagination could go here */}
                <div className="p-4 border-t border-gray-100 flex justify-center">
                    <div className="flex gap-2">
                        <Button size="small" variant="outline">&lt;</Button>
                        <Button size="small" variant="primary">1</Button>
                        <Button size="small" variant="outline">2</Button>
                        <Button size="small" variant="outline">&gt;</Button>
                    </div>
                </div>
            </Card>

            {/* Edit Household Modal */}
            <Modal
                isOpen={!!selectedHousehold}
                onClose={() => setSelectedHousehold(null)}
                title="Chỉnh sửa hộ khẩu"
                size="medium"
            >
                <form className="space-y-4">
                    <Input 
                        label="Mã hộ khẩu" 
                        defaultValue={selectedHousehold?.householdId} 
                        readOnly
                        className="bg-gray-100"
                    />
                    <Input 
                        label="Chủ hộ" 
                        defaultValue={selectedHousehold?.ownerName} 
                    />
                    <Input 
                        label="Địa chỉ" 
                        defaultValue={selectedHousehold?.address} 
                    />
                    <Input 
                        label="Ngày đăng ký" 
                        type="date"
                        defaultValue={selectedHousehold?.regDate ? selectedHousehold.regDate.split('/').reverse().join('-') : ''} 
                    />
                    
                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                        <Button variant="outline" onClick={() => setSelectedHousehold(null)} className="text-red-500 border-red-500 hover:bg-red-50">
                            Đóng
                        </Button>
                        <Button variant="primary" className="bg-blue-600 hover:bg-blue-700">
                            Lưu thay đổi
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* New Household Modal */}
            <Modal
                isOpen={isAddHouseholdModalOpen}
                onClose={() => setIsAddHouseholdModalOpen(false)}
                title="Khai báo hộ khẩu mới"
                size="medium"
            >
                <form className="space-y-4" onSubmit={handleNewHouseholdSubmit}>
                    <Input
                        label="Số sổ hộ khẩu"
                        name="householdId"
                        value={newHouseholdData.householdId}
                        onChange={handleNewHouseholdChange}
                        required
                    />
                    <Input
                        label="Chủ hộ"
                        name="ownerName"
                        value={newHouseholdData.ownerName}
                        onChange={handleNewHouseholdChange}
                        required
                    />
                    <Input
                        label="Địa chỉ"
                        name="address"
                        value={newHouseholdData.address}
                        onChange={handleNewHouseholdChange}
                        required
                    />
                    <div className="mt-6 flex justify-end gap-4">
                        <Button variant="outline" onClick={() => setIsAddHouseholdModalOpen(false)} className="text-red-500 border-red-500 hover:bg-red-50">
                            Hủy
                        </Button>
                        <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700">
                            Tạo mới
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default HouseholdDetail;

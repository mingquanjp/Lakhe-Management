import React, { useState, useEffect } from 'react';
import Card from '../components/commons/Card/Card';
import Table from '../components/commons/Table/Table';
import Button from '../components/commons/Button/Button';
import Modal from '../components/commons/Modal/Modal';
import Input from '../components/commons/Input/Input';
import Loading from '../components/commons/Loading/Loading';
import { 
  getAllHouseholds, 
  createHousehold, 
  updateHousehold, 
  deleteHousehold 
} from '../services/householdService';

const StatusBadge = ({ status }) => {
    let colorClass = '';
    let dotColor = '';
    
    if (status === 'Active') {
        colorClass = 'bg-green-100 text-green-700';
        dotColor = 'bg-green-500';
    } else if (status === 'MovedOut') {
        colorClass = 'bg-gray-100 text-gray-700';
        dotColor = 'bg-gray-500';
    } else {
        colorClass = 'bg-yellow-100 text-yellow-700';
        dotColor = 'bg-yellow-500';
    }

    const displayStatus = status === 'Active' ? 'Thường trú' : 'Đã chuyển đi';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></span>
            {displayStatus}
        </span>
    );
};

const HouseholdDetail = () => {
    const [selectedHousehold, setSelectedHousehold] = useState(null);
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // New Household Form State
    const [isAddHouseholdModalOpen, setIsAddHouseholdModalOpen] = useState(false);
    const [newHouseholdData, setNewHouseholdData] = useState({
        household_code: '',
        address: ''
    });

    // Edit Household Form State
    const [editHouseholdData, setEditHouseholdData] = useState({
        household_code: '',
        address: '',
        status: 'Active'
    });

    // Fetch households khi component mount
    useEffect(() => {
        fetchHouseholds();
    }, []);

    const fetchHouseholds = async () => {
        try {
            setLoading(true);
            const response = await getAllHouseholds();
            
            if (response.success) {
                setHouseholds(response.data);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching households:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle tạo hộ khẩu mới
    const handleNewHouseholdChange = (e) => {
        const { name, value } = e.target;
        setNewHouseholdData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleNewHouseholdSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await createHousehold(newHouseholdData);
            
            if (response.success) {
                alert('Tạo hộ khẩu mới thành công!');
                setIsAddHouseholdModalOpen(false);
                setNewHouseholdData({ household_code: '', address: '' });
                fetchHouseholds(); // Refresh danh sách
            }
        } catch (err) {
            alert(`Lỗi: ${err.message}`);
            console.error('Error creating household:', err);
        }
    };

    // Handle sửa hộ khẩu
    const handleEditClick = (household) => {
        setSelectedHousehold(household);
        setEditHouseholdData({
            household_code: household.household_code,
            address: household.address,
            status: household.status
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditHouseholdData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await updateHousehold(selectedHousehold.household_id, editHouseholdData);
            
            if (response.success) {
                alert('Cập nhật hộ khẩu thành công!');
                setSelectedHousehold(null);
                fetchHouseholds(); // Refresh danh sách
            }
        } catch (err) {
            alert(`Lỗi: ${err.message}`);
            console.error('Error updating household:', err);
        }
    };

    // Handle xóa hộ khẩu
    const handleDelete = async (householdId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa hộ khẩu này?')) {
            return;
        }

        try {
            const response = await deleteHousehold(householdId);
            
            if (response.success) {
                alert('Xóa hộ khẩu thành công!');
                fetchHouseholds(); // Refresh danh sách
            }
        } catch (err) {
            alert(`Lỗi: ${err.message}`);
            console.error('Error deleting household:', err);
        }
    };

    // Format ngày
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const columns = [
        { key: 'household_code', title: 'Mã hộ khẩu' },
        { key: 'head_name', title: 'Chủ hộ' },
        { key: 'address', title: 'Địa chỉ' },
        { key: 'member_count', title: 'Số thành viên' },
        { key: 'regDate', title: 'Ngày đăng ký' },
        { key: 'statusDisplay', title: 'Trạng thái' },
        { key: 'actions', title: 'Hành động' },
    ];

    // Lọc theo search term
    const filteredHouseholds = households.filter(household =>
        household.household_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        household.head_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        household.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Transform data for Table component
    const tableData = filteredHouseholds.map(household => ({
        ...household,
        regDate: formatDate(household.date_created),
        statusDisplay: <StatusBadge status={household.status} />,
        actions: (
            <div className="flex items-center space-x-2">
                <Button 
                    size="small" 
                    variant="primary" 
                    onClick={() => handleEditClick(household)}
                    className="bg-cyan-400 hover:bg-cyan-500 border-none"
                >
                    Sửa
                </Button>
                <Button 
                    size="small" 
                    variant="danger"
                    className="bg-red-500 hover:bg-red-600 text-white border-none"
                    onClick={() => handleDelete(household.household_id)}
                >
                    Xóa
                </Button>
            </div>
        )
    }));

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <p className="text-red-500">Lỗi: {error}</p>
                    <Button onClick={fetchHouseholds} className="mt-4">Thử lại</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Quản lý hộ khẩu</h1>
                    <p className="text-gray-500 text-sm">Danh sách các hộ khẩu trong khu vực quản lý ({filteredHouseholds.length} hộ)</p>
                </div>
                <div className="flex gap-2">
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
                        <Input 
                            placeholder="Tìm kiếm theo mã, chủ hộ, địa chỉ..." 
                            className="w-full max-w-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <Table 
                    columns={columns} 
                    data={tableData} 
                    className="w-full"
                />
                
                {tableData.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        Không tìm thấy hộ khẩu nào
                    </div>
                )}
            </Card>

            {/* Edit Household Modal */}
            <Modal
                isOpen={!!selectedHousehold}
                onClose={() => setSelectedHousehold(null)}
                title="Chỉnh sửa hộ khẩu"
                size="medium"
            >
                <form className="space-y-4" onSubmit={handleEditSubmit}>
                    <Input 
                        label="Mã hộ khẩu" 
                        name="household_code"
                        value={editHouseholdData.household_code}
                        onChange={handleEditChange}
                        required
                    />
                    <Input 
                        label="Địa chỉ" 
                        name="address"
                        value={editHouseholdData.address}
                        onChange={handleEditChange}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <select
                            name="status"
                            value={editHouseholdData.status}
                            onChange={handleEditChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="Active">Thường trú</option>
                            <option value="MovedOut">Đã chuyển đi</option>
                        </select>
                    </div>
                    
                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                        <Button variant="outline" type="button" onClick={() => setSelectedHousehold(null)} className="text-red-500 border-red-500 hover:bg-red-50">
                            Đóng
                        </Button>
                        <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700">
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
                        name="household_code"
                        value={newHouseholdData.household_code}
                        onChange={handleNewHouseholdChange}
                        required
                        placeholder="Ví dụ: HK001"
                    />
                    <Input
                        label="Địa chỉ"
                        name="address"
                        value={newHouseholdData.address}
                        onChange={handleNewHouseholdChange}
                        required
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                    />
                    <div className="mt-6 flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => setIsAddHouseholdModalOpen(false)} className="text-red-500 border-red-500 hover:bg-red-50">
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

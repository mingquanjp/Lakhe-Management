import React, { useState } from 'react';
import Card from '../../../components/commons/Card/Card';
import Table from '../../../components/commons/Table/Table';
import Button from '../../../components/commons/Button/Button';
import Modal from '../../../components/commons/Modal/Modal';
import Input from '../../../components/commons/Input/Input';

// Mock Data
const initialMembers = [
    { id: 1, name: 'Nguyễn Minh Quân', relation: 'Chủ hộ', dob: '01/01/1995', job: 'Kỹ sư Full Stack', status: 'Còn sống' },
    { id: 2, name: 'Đặng Hoàng Quân', relation: 'Anh trai', dob: '01/02/2005', job: 'Kỹ sư Full Stack', status: 'Còn sống' },
    { id: 3, name: 'Đinh Văn Phạm Việt', relation: 'Con trai', dob: '01/03/2024', job: 'Sinh viên', status: 'Đã qua đời' },
    { id: 4, name: 'Nguyễn Minh Quân', relation: 'Bố', dob: '01/04/1975', job: 'Quản lý dự án', status: 'Còn sống' },
];

const StatusBadge = ({ status }) => {
    let colorClass = '';
    let dotColor = '';
    
    if (status === 'Còn sống' || status === 'Active') {
        colorClass = 'bg-green-100 text-green-700';
        dotColor = 'bg-green-500';
    } else if (status === 'Đã qua đời' || status === 'Inactive') {
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

const Declaration = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [members] = useState(initialMembers);

    // New Member Form State
    const [declarationType, setDeclarationType] = useState('newborn');
    const [formData, setFormData] = useState({
        fullName: '',
        alias: '',
        dob: '',
        gender: 'Nam',
        pob: '',
        origin: '',
        ethnicity: 'Kinh',
        religion: 'Không',
        nationality: 'Việt Nam',
        idCard: '',
        passport: '',
        job: '',
        workplace: '',
        relation: '',
        prevAddress: '',
        moveInDate: '',
        address: 'Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleTypeChange = (e) => {
        setDeclarationType(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('New Member Data:', { type: declarationType, ...formData });
        alert('Đã thêm nhân khẩu mới thành công!');
        setIsAddModalOpen(false);
    };

    const columns = [
        { key: 'id', title: 'ID' },
        { key: 'name', title: 'Họ và tên' },
        { key: 'relation', title: 'Quan hệ' },
        { key: 'dob', title: 'Ngày sinh' },
        { key: 'job', title: 'Nghề nghiệp' },
        { key: 'statusDisplay', title: 'Trạng thái' },
    ];

    const tableData = members.map(member => ({
        ...member,
        statusDisplay: <StatusBadge status={member.status} />
    }));

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý thông tin nhân khẩu</h1>
                <Button 
                    variant="primary" 
                    className="bg-gray-800 hover:bg-gray-900"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    + Thêm nhân khẩu mới
                </Button>
            </div>

            <Card className="bg-white shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-800 whitespace-nowrap">Danh sách nhân khẩu</h2>
                    <div className="flex gap-2 flex-1 justify-end">
                        <Input placeholder="Search..." className="w-full max-w-md" />
                    </div>
                </div>
                
                <Table 
                    columns={columns} 
                    data={tableData} 
                    className="w-full"
                />
            </Card>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Thêm nhân khẩu mới"
                size="large"
            >
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Declaration Type Selection */}
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại khai báo</label>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        className="form-radio text-blue-600 h-5 w-5"
                                        name="declarationType" 
                                        value="newborn" 
                                        checked={declarationType === 'newborn'}
                                        onChange={handleTypeChange}
                                    />
                                    <span className="ml-3 font-medium text-gray-800">Mới sinh</span>
                                </label>
                            </div>
                            <div>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        className="form-radio text-blue-600 h-5 w-5"
                                        name="declarationType" 
                                        value="move_in" 
                                        checked={declarationType === 'move_in'}
                                        onChange={handleTypeChange}
                                    />
                                    <span className="ml-3 font-medium text-gray-800">Chuyển đến</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Identity Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Thông tin định danh</h3>
                            <Input
                                label="Họ và tên"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Biệt danh (nếu có)"
                                name="alias"
                                value={formData.alias}
                                onChange={handleChange}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Ngày sinh"
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="input-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                                    <select 
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                    </select>
                                </div>
                            </div>
                            <Input
                                label="Nơi sinh"
                                name="pob"
                                value={formData.pob}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Nguyên quán"
                                name="origin"
                                value={formData.origin}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Citizenship Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Thông tin công dân</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Dân tộc"
                                    name="ethnicity"
                                    value={formData.ethnicity}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Tôn giáo"
                                    name="religion"
                                    value={formData.religion}
                                    onChange={handleChange}
                                />
                            </div>
                            <Input
                                label="Quốc tịch"
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleChange}
                            />
                            
                            {declarationType === 'move_in' && (
                                <>
                                    <Input
                                        label="Số CMND/CCCD"
                                        name="idCard"
                                        value={formData.idCard}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="Số Hộ chiếu (nếu có)"
                                        name="passport"
                                        value={formData.passport}
                                        onChange={handleChange}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Residence & Job Info */}
                    <div className="space-y-4 mt-6">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Cư trú & Công việc</h3>
                        
                        <Input
                            label="Quan hệ với chủ hộ"
                            name="relation"
                            value={formData.relation}
                            onChange={handleChange}
                            required
                        />

                        {declarationType === 'move_in' && (
                            <>
                                <Input
                                    label="Nơi thường trú trước khi chuyển đến"
                                    name="prevAddress"
                                    value={formData.prevAddress}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Ngày chuyển đến"
                                    type="date"
                                    name="moveInDate"
                                    value={formData.moveInDate}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Nghề nghiệp"
                                        name="job"
                                        value={formData.job}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Nơi làm việc"
                                        name="workplace"
                                        value={formData.workplace}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="text-red-500 border-red-500 hover:bg-red-50">
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
                            Thêm nhân khẩu
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Declaration;

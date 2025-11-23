import React, { useState } from 'react';
import Card from '../components/commons/Card/Card';
import Table from '../components/commons/Table/Table';
import Button from '../components/commons/Button/Button';
import Modal from '../components/commons/Modal/Modal';
import Input from '../components/commons/Input/Input';

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
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Khai báo tình trạng nhân khẩu</h1>
                    <p className="text-gray-500 text-sm">Quản lý thông tin nhân khẩu</p>
                </div>
                <div className="flex gap-2">
                     <Button 
                        variant="primary" 
                        className="bg-gray-800 hover:bg-gray-900"
                        onClick={() => setIsAddModalOpen(true)}
                     >
                        + Thêm nhân khẩu mới
                     </Button>
                </div>
            </div>

            <Card className="bg-white shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Danh sách nhân khẩu</h2>
                    <div className="flex gap-2">
                        <Input placeholder="Search..." className="w-64" />
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
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Input label="Họ và tên" required />
                    </div>
                    <div>
                        <Input label="Số CMND hoặc CCCD" required />
                    </div>
                    <div>
                        <Input label="Ngày sinh" type="date" required />
                    </div>
                    <div>
                        <Input label="Ngày cấp và nơi cấp" required />
                    </div>
                    <div>
                        <Input label="Nghề nghiệp" required />
                    </div>
                    <div>
                        <Input label="Ngày đăng ký thường trú" type="date" required />
                    </div>
                    <div className="md:col-span-2">
                        <Input label="Địa chỉ nơi thường trú trước khi chuyển đến" required />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="text-red-500 border-red-500 hover:bg-red-50">
                            Cancel
                        </Button>
                        <Button variant="primary" className="bg-green-700 hover:bg-green-800">
                            Add
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Declaration;

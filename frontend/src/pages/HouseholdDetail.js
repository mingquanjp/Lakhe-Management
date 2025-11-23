import React, { useState } from 'react';
import Card from '../components/commons/Card/Card';
import Table from '../components/commons/Table/Table';
import Button from '../components/commons/Button/Button';
import Modal from '../components/commons/Modal/Modal';
import Input from '../components/commons/Input/Input';

// Mock Data
const initialMembers = [
    { 
        id: 1, 
        name: 'Nguyễn Minh Quân', 
        alias: 'Quân',
        relation: 'Chủ hộ', 
        dob: '01/01/1995', 
        gender: 'Nam',
        pob: 'Hà Nội', // Place of Birth
        origin: 'Nam Định',
        ethnicity: 'Kinh',
        religion: 'Không',
        idCard: '001095000001',
        idCardDate: '01/01/2021',
        idCardPlace: 'Cục Cảnh sát QLHC về TTXH',
        job: 'Kỹ sư Full Stack', 
        workplace: 'Công ty ABC',
        regDate: '01/01/2020',
        prevAddress: 'Số 1, Đại Cồ Việt',
        status: 'Thường trú' 
    },
    { 
        id: 2, 
        name: 'Đặng Hoàng Quân', 
        alias: '',
        relation: 'Anh trai', 
        dob: '01/02/2005', 
        gender: 'Nam',
        pob: 'Hà Nội',
        origin: 'Hà Nội',
        ethnicity: 'Kinh',
        religion: 'Không',
        idCard: '001205000002',
        idCardDate: '01/02/2023',
        idCardPlace: 'CA Hà Nội',
        job: 'Kỹ sư Full Stack', 
        workplace: 'Freelancer',
        regDate: '01/02/2020',
        prevAddress: 'Không',
        status: 'Thường trú' 
    },
    // ... other members with similar structure
];

const StatusBadge = ({ status }) => {
    let colorClass = '';
    let dotColor = '';
    
    if (status === 'Thường trú' || status === 'Active') {
        colorClass = 'bg-green-100 text-green-700';
        dotColor = 'bg-green-500';
    } else if (status === 'Tạm vắng' || status === 'Inactive') {
        colorClass = 'bg-red-100 text-red-700';
        dotColor = 'bg-red-500';
    } else {
        colorClass = 'bg-yellow-100 text-yellow-700';
        dotColor = 'bg-yellow-500';
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></span>
            {status}
        </span>
    );
};

const HouseholdDetail = () => {
    const [selectedMember, setSelectedMember] = useState(null);
    const [members] = useState(initialMembers);

    const columns = [
        { key: 'id', title: 'STT' },
        { key: 'name', title: 'Họ và tên thành viên' },
        { key: 'relation', title: 'Quan hệ với chủ hộ' },
        { key: 'dob', title: 'Ngày sinh' },
        { key: 'job', title: 'Nghề nghiệp' },
        { key: 'statusDisplay', title: 'Trạng thái cư trú' },
        { key: 'actions', title: 'Hành động' },
    ];

    // Transform data for Table component
    const tableData = members.map(member => ({
        ...member,
        statusDisplay: <StatusBadge status={member.status} />,
        actions: (
            <div className="flex items-center space-x-2">
                <Button 
                    size="small" 
                    variant="primary" 
                    onClick={() => setSelectedMember(member)}
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
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Chi tiết hộ khẩu</h1>
                    <p className="text-gray-500 text-sm">Chi tiết các thành viên trong 1 hộ khẩu năm 2025</p>
                </div>
                <div className="flex gap-2">
                     {/* Using Button component for navigation/action */}
                     <Button variant="primary" className="bg-gray-800 hover:bg-gray-900">
                        Khai báo hộ khẩu
                     </Button>
                </div>
            </div>

            <Card className="bg-white shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Bảng chi tiết hộ khẩu</h2>
                    <div className="flex gap-2">
                        <Input placeholder="Search..." className="w-64" />
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

            <Modal
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                title="Chi tiết nhân khẩu"
                size="large"
            >
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Thông tin định danh */}
                    <div className="md:col-span-2">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1">Thông tin định danh</h3>
                    </div>
                    <div className="md:col-span-1">
                        <Input 
                            label="Họ và tên" 
                            defaultValue={selectedMember?.name} 
                        />
                    </div>
                    <div className="md:col-span-1">
                        <Input 
                            label="Bí danh" 
                            defaultValue={selectedMember?.alias}
                        />
                    </div>
                    <div>
                        <Input 
                            label="Ngày sinh" 
                            defaultValue={selectedMember?.dob} 
                        />
                    </div>
                    <div>
                        <Input 
                            label="Giới tính" 
                            defaultValue={selectedMember?.gender} 
                        />
                    </div>

                    {/* Thông tin xuất thân */}
                    <div className="md:col-span-2 mt-2">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1">Thông tin xuất thân</h3>
                    </div>
                    <div>
                        <Input 
                            label="Nơi sinh" 
                            defaultValue={selectedMember?.pob}
                        />
                    </div>
                    <div>
                        <Input 
                            label="Nguyên quán" 
                            defaultValue={selectedMember?.origin}
                        />
                    </div>
                    <div>
                        <Input 
                            label="Dân tộc" 
                            defaultValue={selectedMember?.ethnicity}
                        />
                    </div>
                    <div>
                        <Input 
                            label="Tôn giáo" 
                            defaultValue={selectedMember?.religion}
                        />
                    </div>

                    {/* Thông tin công dân */}
                    <div className="md:col-span-2 mt-2">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1">Thông tin công dân</h3>
                    </div>
                    <div className="md:col-span-2">
                        <Input 
                            label="Số CMND/CCCD" 
                            defaultValue={selectedMember?.idCard}
                        />
                    </div>
                    <div>
                        <Input 
                            label="Ngày cấp" 
                            defaultValue={selectedMember?.idCardDate}
                        />
                    </div>
                    <div>
                        <Input 
                            label="Nơi cấp" 
                            defaultValue={selectedMember?.idCardPlace}
                        />
                    </div>

                    {/* Thông tin cư trú & Công việc */}
                    <div className="md:col-span-2 mt-2">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1">Cư trú & Công việc</h3>
                    </div>
                    <div>
                        <Input 
                            label="Nghề nghiệp" 
                            defaultValue={selectedMember?.job} 
                        />
                    </div>
                    <div>
                        <Input 
                            label="Nơi làm việc" 
                            defaultValue={selectedMember?.workplace} 
                        />
                    </div>
                    <div>
                        <Input 
                            label="Ngày đăng ký thường trú" 
                            defaultValue={selectedMember?.regDate} 
                        />
                    </div>
                    <div>
                        <Input 
                            label="Địa chỉ trước khi chuyển đến" 
                            defaultValue={selectedMember?.prevAddress} 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Input 
                            label="Quan hệ với chủ hộ" 
                            defaultValue={selectedMember?.relation} 
                        />
                    </div>
                    
                    <div className="md:col-span-2 flex justify-end gap-4 mt-6 pt-4 border-t">
                        <Button variant="outline" onClick={() => setSelectedMember(null)} className="text-red-500 border-red-500 hover:bg-red-50">
                            Đóng
                        </Button>
                        <Button variant="primary" className="bg-blue-600 hover:bg-blue-700">
                            Lưu thay đổi
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default HouseholdDetail;

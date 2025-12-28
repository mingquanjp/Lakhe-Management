import React from "react";
import { useState } from "react";
import Button from '../../../../components/commons/Button/Button';
import Input from '../../../../components/commons/Input/Input';
import { DateInput } from '../../../../components/commons/Input';
import Card from '../../../../components/commons/Card/Card';
import Modal from '../../../../components/commons/Modal';
import './NewMemberForm.css';

const NewMemberForm = () => {
    const [declarationType, setDeclarationType] = useState('newborn'); // 'newborn' or 'move_in'
    const [formData, setFormData] = useState({
        fullName: '',
        alias: '',
        dob: '',
        gender: 'Nam',
        pob: '', // Place of Birth
        origin: '', // Native Land
        ethnicity: 'Kinh',
        religion: 'Không',
        nationality: 'Việt Nam',
        idCard: '',
        passport: '',
        job: '',
        workplace: '',
        relation: '',
        prevAddress: '', // Only for move_in
        moveInDate: '', // Only for move_in
        address: 'Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội' // Auto-filled for newborn
    });
    const [notification, setNotification] = useState({
        isOpen: false,
        message: '',
        type: 'success'
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
        setNotification({
            isOpen: true,
            message: 'Đã thêm nhân khẩu mới thành công!',
            type: 'success'
        });
    };

    return (
        <Card title="Thêm nhân khẩu mới" className="new-member-form">
            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Declaration Type Selection */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại khai báo</label>
                    <div className="flex space-x-6">
                        <label className="inline-flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                className="form-radio text-blue-600"
                                name="declarationType" 
                                value="newborn" 
                                checked={declarationType === 'newborn'}
                                onChange={handleTypeChange}
                            />
                            <span className="ml-2 font-medium">Mới sinh</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                className="form-radio text-blue-600"
                                name="declarationType" 
                                value="move_in" 
                                checked={declarationType === 'move_in'}
                                onChange={handleTypeChange}
                            />
                            <span className="ml-2 font-medium">Chuyển đến</span>
                        </label>
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
                            <DateInput
                                label="Ngày sinh"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                            />
                            <div className="input-group">
                                <label className="input-label">Giới tính</label>
                                <select 
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="input-field"
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
                            <DateInput
                                label="Ngày chuyển đến"
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

                <div className="mt-6 flex justify-end">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
                        Thêm nhân khẩu
                    </Button>
                </div>
            </form>
            <Modal
                isOpen={notification.isOpen}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                title={notification.type === 'success' ? 'Thành công' : 'Lỗi'}
                size="sm"
            >
                <div style={{ padding: "20px" }}>
                    <p style={{ marginBottom: "20px", color: "#333" }}>{notification.message}</p>
                    <div className="modal-footer">
                        <button 
                            className={notification.type === 'success' ? "modal-btn-success" : "modal-btn-delete"}
                            onClick={() => setNotification({ ...notification, isOpen: false })}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </Modal>
        </Card>
    );
};

export default NewMemberForm;

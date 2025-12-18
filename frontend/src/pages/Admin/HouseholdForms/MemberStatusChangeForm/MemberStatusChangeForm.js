import React, { useState } from 'react';
import Button from '../../../../components/commons/Button/Button';
import Input from '../../../../components/commons/Input/Input';
import './MemberStatusChangeForm.css';

const MemberStatusChangeForm = () => {
    const [formData, setFormData] = useState({
        memberName: '',
        changeType: 'move_out',
        changeDate: '',
        reason: '',
        // Move out specific
        newAddress: '',
        // Deceased specific
        deathCertificateNumber: '',
        deathReason: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Status Change Data:', formData);
        alert('Đã cập nhật trạng thái nhân khẩu!');
    };

    return (
        <div className="member-status-change-form">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label="Chọn nhân khẩu"
                    name="memberName"
                    value={formData.memberName}
                    onChange={handleChange}
                    placeholder="Tìm kiếm tên hoặc CMND/CCCD"
                    required
                />
                
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <div className="input-group">
                        <label className="input-label">Loại thay đổi</label>
                        <select 
                            name="changeType"
                            value={formData.changeType}
                            onChange={handleChange}
                            className="input-field font-medium"
                        >
                            <option value="move_out">Chuyển đi</option>
                            <option value="deceased">Qua đời</option>
                        </select>
                    </div>
                </div>

                <Input
                    label={formData.changeType === 'deceased' ? "Ngày mất" : "Ngày chuyển đi"}
                    type="date"
                    name="changeDate"
                    value={formData.changeDate}
                    onChange={handleChange}
                    required
                />

                {formData.changeType === 'move_out' ? (
                    <Input
                        label="Địa chỉ chuyển đến"
                        name="newAddress"
                        value={formData.newAddress}
                        onChange={handleChange}
                        required
                        placeholder="Nhập địa chỉ nơi chuyển đến"
                    />
                ) : (
                    <>
                        <Input
                            label="Số giấy chứng tử"
                            name="deathCertificateNumber"
                            value={formData.deathCertificateNumber}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Nguyên nhân mất"
                            name="deathReason"
                            value={formData.deathReason}
                            onChange={handleChange}
                        />
                    </>
                )}

                <div className="input-group">
                    <label className="input-label">Ghi chú thêm</label>
                    <textarea 
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="input-field"
                        rows="3"
                    ></textarea>
                </div>

                <div className="mt-4">
                    <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white">Cập nhật trạng thái</Button>
                </div>
            </form>
        </div>
    );
};

export default MemberStatusChangeForm;

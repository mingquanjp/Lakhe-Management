import React, { useState } from 'react';
import Button from '../../commons/Button/Button';
import Input from '../../commons/Input/Input';
import Card from '../../commons/Card/Card';
import './MemberStatusChangeForm.css';

const MemberStatusChangeForm = () => {
    const [formData, setFormData] = useState({
        memberName: '',
        changeType: 'move_out',
        changeDate: '',
        reason: ''
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
        <Card title="Thay đổi nhân khẩu" className="member-status-change-form">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                    label="Chọn nhân khẩu"
                    name="memberName"
                    value={formData.memberName}
                    onChange={handleChange}
                    placeholder="Tìm kiếm tên hoặc CMND/CCCD"
                    required
                />
                <div className="input-group">
                    <label className="input-label">Loại thay đổi</label>
                    <select 
                        name="changeType"
                        value={formData.changeType}
                        onChange={handleChange}
                        className="input-field"
                    >
                        <option value="move_out">Chuyển đi</option>
                        <option value="deceased">Qua đời</option>
                    </select>
                </div>
                <Input
                    label="Ngày thay đổi"
                    type="date"
                    name="changeDate"
                    value={formData.changeDate}
                    onChange={handleChange}
                    required
                />
                <div className="input-group">
                    <label className="input-label">Ghi chú / Lý do</label>
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
        </Card>
    );
};

export default MemberStatusChangeForm;

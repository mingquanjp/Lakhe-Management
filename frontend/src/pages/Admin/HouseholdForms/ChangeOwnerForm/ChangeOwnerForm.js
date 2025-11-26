import React, { useState } from 'react';
import Button from '../../../../components/commons/Button/Button';
import Input from '../../../../components/commons/Input/Input';
import './ChangeOwnerForm.css';

const ChangeOwnerForm = () => {
    const [formData, setFormData] = useState({
        currentOwner: 'Nguyễn Văn A', // Mock data
        newOwner: '',
        reason: '',
        date: ''
    });

    // Mock list of members in the household
    const members = [
        { id: 1, name: 'Nguyễn Văn A' },
        { id: 2, name: 'Trần Thị B' },
        { id: 3, name: 'Nguyễn Văn C' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Change Owner Data:', formData);
        alert('Đã thay đổi chủ hộ thành công!');
    };

    return (
        <div className="change-owner-form">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label="Chủ hộ hiện tại"
                    name="currentOwner"
                    value={formData.currentOwner}
                    readOnly
                    className="bg-gray-100"
                />
                
                <div className="input-group">
                    <label className="input-label">Chủ hộ mới</label>
                    <select 
                        name="newOwner"
                        value={formData.newOwner}
                        onChange={handleChange}
                        className="input-field"
                        required
                    >
                        <option value="">-- Chọn chủ hộ mới --</option>
                        {members.filter(m => m.name !== formData.currentOwner).map(member => (
                            <option key={member.id} value={member.name}>{member.name}</option>
                        ))}
                    </select>
                </div>

                <Input
                    label="Ngày thay đổi"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />

                <div className="input-group">
                    <label className="input-label">Lý do thay đổi</label>
                    <textarea 
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="input-field"
                        rows="3"
                        required
                    ></textarea>
                </div>

                <div className="mt-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Lưu thay đổi</Button>
                </div>
            </form>
        </div>
    );
};

export default ChangeOwnerForm;

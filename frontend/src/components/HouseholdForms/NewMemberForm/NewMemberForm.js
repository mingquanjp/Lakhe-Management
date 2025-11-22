import React, { useState } from 'react';
import Button from '../../commons/Button/Button';
import Input from '../../commons/Input/Input';
import Card from '../../commons/Card/Card';
import './NewMemberForm.css';

const NewMemberForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        gender: 'Nam',
        relation: ''
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
        console.log('New Member Data:', formData);
        alert('Đã thêm nhân khẩu mới thành công!');
    };

    return (
        <Card title="Thêm nhân khẩu mới (Mới sinh)" className="new-member-form">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                    label="Họ và tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Ngày sinh"
                    type="date"
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
                <Input
                    label="Quan hệ với chủ hộ"
                    name="relation"
                    value={formData.relation}
                    onChange={handleChange}
                    required
                />
                <div className="mt-4">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Thêm nhân khẩu</Button>
                </div>
            </form>
        </Card>
    );
};

export default NewMemberForm;

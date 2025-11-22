import React, { useState } from 'react';
import Button from '../../commons/Button/Button';
import Input from '../../commons/Input/Input';
import Card from '../../commons/Card/Card';
import './NewHouseholdForm.css';

const NewHouseholdForm = () => {
    const [formData, setFormData] = useState({
        householdId: '',
        ownerName: '',
        address: ''
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
        console.log('New Household Data:', formData);
        // Add API call logic here
        alert('Đã gửi thông tin khai báo hộ khẩu mới!');
    };

    return (
        <Card title="Khai báo hộ khẩu mới" className="new-household-form">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                    label="Số sổ hộ khẩu"
                    name="householdId"
                    value={formData.householdId}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Chủ hộ"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Địa chỉ"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                />
                <div className="mt-4">
                    <Button type="submit" variant="primary">Tạo mới</Button>
                </div>
            </form>
        </Card>
    );
};

export default NewHouseholdForm;

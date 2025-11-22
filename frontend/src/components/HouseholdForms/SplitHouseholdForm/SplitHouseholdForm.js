import React, { useState } from 'react';
import Button from '../../commons/Button/Button';
import Input from '../../commons/Input/Input';
import Card from '../../commons/Card/Card';
import './SplitHouseholdForm.css';

const SplitHouseholdForm = () => {
    const [formData, setFormData] = useState({
        originalHouseholdId: '',
        newOwnerName: '',
        newAddress: ''
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
        console.log('Split Household Data:', formData);
        alert('Đã thực hiện tách hộ khẩu thành công!');
    };

    return (
        <Card title="Tách hộ khẩu" className="split-household-form">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                    label="Chọn hộ khẩu gốc"
                    name="originalHouseholdId"
                    value={formData.originalHouseholdId}
                    onChange={handleChange}
                    placeholder="Nhập số sổ hộ khẩu hoặc tên chủ hộ"
                    required
                />
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Thông tin hộ mới</h3>
                    <Input
                        label="Chủ hộ mới"
                        name="newOwnerName"
                        value={formData.newOwnerName}
                        onChange={handleChange}
                        placeholder="Chọn thành viên làm chủ hộ mới"
                        required
                    />
                    <div className="mt-2">
                        <Input
                            label="Địa chỉ hộ mới"
                            name="newAddress"
                            value={formData.newAddress}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Thành viên chuyển sang hộ mới</h3>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-sm text-gray-500 italic">Danh sách thành viên sẽ được chọn từ hộ gốc...</p>
                        {/* List selection component would go here */}
                    </div>
                </div>

                <div className="mt-4">
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Tách hộ</Button>
                </div>
            </form>
        </Card>
    );
};

export default SplitHouseholdForm;

import React from 'react';
import { useState } from 'react';
import Button from '../../../../components/commons/Button/Button';
import Input from '../../../../components/commons/Input/Input';
import Card from '../../../../components/commons/Card/Card';
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
                        <div className="space-y-2">
                            {['Nguyễn Văn A', 'Nguyễn Thị B', 'Nguyễn Văn C'].map((member, index) => (
                                <label key={index} className="flex items-center space-x-2">
                                    <input type="checkbox" className="form-checkbox h-4 w-4 text-purple-600" />
                                    <span className="text-gray-700">{member}</span>
                                </label>
                            ))}
                        </div>
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

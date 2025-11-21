import React, { useState } from 'react';
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
        <div className="new-household-form p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Khai báo hộ khẩu mới</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Số sổ hộ khẩu</label>
                    <input 
                        type="text" 
                        name="householdId"
                        value={formData.householdId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Chủ hộ</label>
                    <input 
                        type="text" 
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                    <input 
                        type="text" 
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Tạo mới</button>
            </form>
        </div>
    );
};

export default NewHouseholdForm;

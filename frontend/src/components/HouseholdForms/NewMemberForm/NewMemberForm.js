import React, { useState } from 'react';
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
        <div className="new-member-form p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Thêm nhân khẩu mới (Mới sinh)</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                    <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                    <input 
                        type="date" 
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                    <select 
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Quan hệ với chủ hộ</label>
                    <input 
                        type="text" 
                        name="relation"
                        value={formData.relation}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                        required
                    />
                </div>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Thêm nhân khẩu</button>
            </form>
        </div>
    );
};

export default NewMemberForm;

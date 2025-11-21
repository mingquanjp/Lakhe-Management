import React, { useState } from 'react';
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
        <div className="member-status-change-form p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Thay đổi nhân khẩu</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Chọn nhân khẩu</label>
                    <input 
                        type="text" 
                        name="memberName"
                        value={formData.memberName}
                        onChange={handleChange}
                        placeholder="Tìm kiếm tên hoặc CMND/CCCD" 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Loại thay đổi</label>
                    <select 
                        name="changeType"
                        value={formData.changeType}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="move_out">Chuyển đi</option>
                        <option value="deceased">Qua đời</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày thay đổi</label>
                    <input 
                        type="date" 
                        name="changeDate"
                        value={formData.changeDate}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ghi chú / Lý do</label>
                    <textarea 
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                        rows="3"
                    ></textarea>
                </div>
                <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Cập nhật trạng thái</button>
            </form>
        </div>
    );
};

export default MemberStatusChangeForm;

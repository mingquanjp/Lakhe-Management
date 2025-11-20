import React from 'react';
import './MemberStatusChangeForm.css';

const MemberStatusChangeForm = () => {
    return (
        <div className="member-status-change-form p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Thay đổi nhân khẩu</h2>
            <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Chọn nhân khẩu</label>
                    <input type="text" placeholder="Tìm kiếm tên hoặc CMND/CCCD" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Loại thay đổi</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="move_out">Chuyển đi</option>
                        <option value="deceased">Qua đời</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày thay đổi</label>
                    <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ghi chú / Lý do</label>
                    <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" rows="3"></textarea>
                </div>
                <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Cập nhật trạng thái</button>
            </form>
        </div>
    );
};

export default MemberStatusChangeForm;

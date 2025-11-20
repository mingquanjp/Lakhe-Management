import React from 'react';
import './SplitHouseholdForm.css';

const SplitHouseholdForm = () => {
    return (
        <div className="split-household-form p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Tách hộ khẩu</h2>
            <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Chọn hộ khẩu gốc</label>
                    <input type="text" placeholder="Nhập số sổ hộ khẩu hoặc tên chủ hộ" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Thông tin hộ mới</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Chủ hộ mới</label>
                        <input type="text" placeholder="Chọn thành viên làm chủ hộ mới" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700">Địa chỉ hộ mới</label>
                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Thành viên chuyển sang hộ mới</h3>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-sm text-gray-500 italic">Danh sách thành viên sẽ được chọn từ hộ gốc...</p>
                        {/* List selection component would go here */}
                    </div>
                </div>

                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Tách hộ</button>
            </form>
        </div>
    );
};

export default SplitHouseholdForm;

import React from 'react';
import './NewHouseholdForm.css';

const NewHouseholdForm = () => {
    return (
        <div className="new-household-form p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Khai báo hộ khẩu mới</h2>
            <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Số sổ hộ khẩu</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Chủ hộ</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Tạo mới</button>
            </form>
        </div>
    );
};

export default NewHouseholdForm;

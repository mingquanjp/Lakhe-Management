import React from 'react';
import './TemporaryResidenceForm.css';

const TemporaryResidenceForm = () => {
    return (
        <div className="temporary-residence-form p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Khai báo Tạm trú / Tạm vắng</h2>
            <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Loại khai báo</label>
                    <div className="mt-2 space-x-4">
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio text-blue-600" name="type" value="temporary_residence" defaultChecked />
                            <span className="ml-2">Tạm trú</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio text-blue-600" name="type" value="temporary_absence" />
                            <span className="ml-2">Tạm vắng</span>
                        </label>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                    <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Số CMND/CCCD</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Từ ngày</label>
                        <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Đến ngày</label>
                        <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Lý do</label>
                    <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" rows="3"></textarea>
                </div>

                <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">Lưu khai báo</button>
            </form>
        </div>
    );
};

export default TemporaryResidenceForm;

import React, { useState } from 'react';
import './TemporaryResidenceForm.css';

const TemporaryResidenceForm = () => {
    const [formData, setFormData] = useState({
        type: 'temporary_residence',
        fullName: '',
        dob: '',
        identityCard: '',
        fromDate: '',
        toDate: '',
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
        console.log('Temporary Residence/Absence Data:', formData);
        alert(`Đã lưu khai báo ${formData.type === 'temporary_residence' ? 'tạm trú' : 'tạm vắng'}!`);
    };

    const isTemporaryResidence = formData.type === 'temporary_residence';
    const themeClass = isTemporaryResidence ? 'theme-yellow' : 'theme-red';
    const buttonClass = isTemporaryResidence 
        ? 'bg-yellow-500 hover:bg-yellow-600' 
        : 'bg-red-600 hover:bg-red-700';

    return (
        <div className={`temporary-residence-form p-6 bg-white rounded-lg shadow-md ${themeClass}`}>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Khai báo Tạm trú / Tạm vắng</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Loại khai báo</label>
                    <div className="mt-2 space-x-4">
                        <label className="inline-flex items-center">
                            <input 
                                type="radio" 
                                className={`form-radio ${isTemporaryResidence ? 'text-yellow-500' : 'text-gray-400'}`}
                                name="type" 
                                value="temporary_residence" 
                                checked={formData.type === 'temporary_residence'}
                                onChange={handleChange}
                            />
                            <span className="ml-2">Tạm trú</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input 
                                type="radio" 
                                className={`form-radio ${!isTemporaryResidence ? 'text-red-600' : 'text-gray-400'}`}
                                name="type" 
                                value="temporary_absence" 
                                checked={formData.type === 'temporary_absence'}
                                onChange={handleChange}
                            />
                            <span className="ml-2">Tạm vắng</span>
                        </label>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                    <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-opacity-50 transition-colors" 
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-opacity-50 transition-colors" 
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Số CMND/CCCD</label>
                    <input 
                        type="text" 
                        name="identityCard"
                        value={formData.identityCard}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-opacity-50 transition-colors" 
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Từ ngày</label>
                        <input 
                            type="date" 
                            name="fromDate"
                            value={formData.fromDate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-opacity-50 transition-colors" 
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Đến ngày</label>
                        <input 
                            type="date" 
                            name="toDate"
                            value={formData.toDate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-opacity-50 transition-colors" 
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Lý do</label>
                    <textarea 
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-opacity-50 transition-colors" 
                        rows="3"
                    ></textarea>
                </div>

                <button type="submit" className={`${buttonClass} text-white px-4 py-2 rounded transition-colors shadow-sm`}>Lưu khai báo</button>
            </form>
        </div>
    );
};

export default TemporaryResidenceForm;

import React, { useState } from 'react';
import Button from '../../commons/Button/Button';
import Input from '../../commons/Input/Input';
import Card from '../../commons/Card/Card';
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
        <Card title="Khai báo Tạm trú / Tạm vắng" className={`temporary-residence-form ${themeClass}`}>
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
                
                <Input
                    label="Họ và tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Ngày sinh"
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Số CMND/CCCD"
                    name="identityCard"
                    value={formData.identityCard}
                    onChange={handleChange}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Từ ngày"
                        type="date"
                        name="fromDate"
                        value={formData.fromDate}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Đến ngày"
                        type="date"
                        name="toDate"
                        value={formData.toDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Lý do</label>
                    <textarea 
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="input-field"
                        rows="3"
                    ></textarea>
                </div>

                <div className="mt-4">
                    <Button type="submit" className={`${buttonClass} text-white`}>Lưu khai báo</Button>
                </div>
            </form>
        </Card>
    );
};

export default TemporaryResidenceForm;

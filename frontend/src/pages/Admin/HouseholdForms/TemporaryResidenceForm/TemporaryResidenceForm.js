import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/commons/Button/Button';
import Input from '../../../../components/commons/Input/Input';
import { getAuthToken } from '../../../../utils/api';
import './TemporaryResidenceForm.css';

const TemporaryResidenceForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'temporary_residence',
        householdCode: '', // New field
        fullName: '',
        dob: '',
        gender: 'Nam',
        identityCard: '',
        fromDate: '',
        toDate: '',
        reason: '',
        // Temp Residence specific
        phone: '',
        email: '',
        permanentAddress: '',
        job: '',
        workplace: '',
        temporaryAddress: '', // Địa chỉ tạm trú
        hostName: '', // Chủ hộ
        relationshipWithHost: '',
        // Temp Absence specific
        tempAddress: '' // Nơi đến
    });

    // Search state
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedResidentId, setSelectedResidentId] = useState(null);
    const searchTimeoutRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        
        // Reset selectedResidentId if user manually changes name or dob
        if (name === 'fullName' || name === 'dob') {
            setSelectedResidentId(null);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        console.log("Search value:", value); // Debug log
        setFormData(prev => ({ ...prev, fullName: value }));
        
        // Only search if in Temporary Absence mode
        if (formData.type === 'temporary_residence') {
            console.log("Skipping search: mode is temporary_residence");
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (value.length > 1) {
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const token = getAuthToken();
                    console.log("Fetching residents with search:", value);
                    const response = await fetch(`http://localhost:5000/api/residents?search=${encodeURIComponent(value)}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const result = await response.json();
                        console.log("Search results:", result.data);
                        setSearchResults(result.data);
                        setShowSuggestions(true);
                    } else {
                        console.error("Search failed:", response.status);
                    }
                } catch (error) {
                    console.error("Error searching residents:", error);
                }
            }, 300);
        } else {
            setSearchResults([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectResident = async (resident) => {
        setSelectedResidentId(resident.resident_id);
        setFormData(prev => ({
            ...prev,
            fullName: `${resident.last_name} ${resident.first_name}`,
            dob: resident.dob ? new Date(resident.dob).toISOString().split('T')[0] : '',
            gender: resident.gender === 'Male' ? 'Nam' : 'Nữ',
            identityCard: resident.identity_card_number || '',
        }));
        setShowSuggestions(false);

        // Fetch full details to get address
        try {
            const token = getAuthToken();
            const response = await fetch(`http://localhost:5000/api/residents/${resident.resident_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const detail = data.data;
                setFormData(prev => ({
                    ...prev,
                    permanentAddress: detail.household_address || detail.place_of_origin || '',
                }));
            }
        } catch (error) {
            console.error("Error fetching resident details:", error);
        }
    };

    const splitName = (fullName) => {
        const parts = fullName.trim().split(' ');
        const firstName = parts.pop() || '';
        const lastName = parts.join(' ') || '';
        return { firstName, lastName };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = getAuthToken();
            const { firstName, lastName } = splitName(formData.fullName);

            if (formData.type === 'temporary_residence') {
                // Use createTemporaryHousehold endpoint
                const payload = {
                    household_code: formData.householdCode,
                    address: formData.temporaryAddress,
                    start_date: formData.fromDate,
                    end_date: formData.toDate,
                    reason: formData.reason,
                    owner: {
                        name: formData.fullName,
                        dob: formData.dob,
                        gender: formData.gender === 'Nam' ? 'Male' : 'Female',
                        cccd: formData.identityCard
                    },
                    members: [] // Currently only supporting one person as owner
                };

                const response = await fetch('http://localhost:5000/api/households/temporary', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                if (result.success) {
                    alert('Đăng ký tạm trú thành công!');
                    navigate('/admin/temporary-household');
                } else {
                    alert('Lỗi: ' + result.message + (result.error ? `\nChi tiết: ${result.error}` : ''));
                }

            } else {
                // Temporary Absence
                const payload = {
                    resident_id: selectedResidentId,
                    first_name: firstName,
                    last_name: lastName,
                    dob: formData.dob,
                    gender: formData.gender === 'Nam' ? 'Male' : 'Female',
                    identity_card_number: formData.identityCard,
                    permanent_address: formData.permanentAddress, 
                    temporary_address: formData.tempAddress,
                    reason: formData.reason,
                    start_date: formData.fromDate,
                    end_date: formData.toDate,
                    absence_code: formData.householdCode // Use householdCode field for absence code
                };

                const response = await fetch('http://localhost:5000/api/residents/temporary-absence', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                if (result.success) {
                    alert('Khai báo tạm vắng thành công!');
                    navigate('/admin/temporary-absence');
                } else {
                    alert('Lỗi: ' + result.message + (result.error ? `\nChi tiết: ${result.error}` : ''));
                }
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Có lỗi xảy ra khi gửi biểu mẫu.');
        }
    };

    const isTemporaryResidence = formData.type === 'temporary_residence';
    const themeClass = isTemporaryResidence ? 'theme-yellow' : 'theme-red';
    const buttonClass = isTemporaryResidence 
        ? 'bg-yellow-500 hover:bg-yellow-600' 
        : 'bg-red-600 hover:bg-red-700';

    return (
        <div className={`temporary-residence-form ${themeClass}`}>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Loại khai báo</h3>
                    <div className="flex space-x-8">
                        <label className="inline-flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                className={`form-radio ${isTemporaryResidence ? 'text-yellow-500' : 'text-gray-400'}`}
                                name="type" 
                                value="temporary_residence" 
                                checked={formData.type === 'temporary_residence'}
                                onChange={handleChange}
                            />
                            <span className="ml-2 font-medium">Đăng ký Tạm trú</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                className={`form-radio ${!isTemporaryResidence ? 'text-red-600' : 'text-gray-400'}`}
                                name="type" 
                                value="temporary_absence" 
                                checked={formData.type === 'temporary_absence'}
                                onChange={handleChange}
                            />
                            <span className="ml-2 font-medium">Khai báo Tạm vắng</span>
                        </label>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Thông tin cá nhân</h3>
                        <Input
                            label={isTemporaryResidence ? "Mã hộ khẩu (HKTT2025-XX)" : "Mã tạm vắng (HKTV2025-XX)"}
                            name="householdCode"
                            value={formData.householdCode}
                            onChange={handleChange}
                            required
                            placeholder={isTemporaryResidence ? "Ví dụ: HKTT2025-01" : "Ví dụ: HKTV2025-01"}
                        />
                        
                        <div style={{ position: 'relative' }} ref={wrapperRef}>
                            <Input
                                label="Họ và tên"
                                name="fullName"
                                value={formData.fullName}
                                onChange={!isTemporaryResidence ? handleSearchChange : handleChange}
                                required
                                autoComplete="off"
                            />
                            {!isTemporaryResidence && showSuggestions && searchResults.length > 0 && (
                                <div className="suggestion-box">
                                    {searchResults.map(resident => (
                                        <div 
                                            key={resident.resident_id}
                                            className="suggestion-item"
                                            onClick={() => handleSelectResident(resident)}
                                        >
                                            <span className="suggestion-name">{resident.last_name} {resident.first_name}</span>
                                            <span className="suggestion-details">
                                                {new Date(resident.dob).toLocaleDateString('vi-VN')} - {resident.household_code}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Input
                            label="Ngày sinh"
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            required
                        />
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </select>
                        </div>
                        <Input
                            label="Số CMND/CCCD"
                            name="identityCard"
                            value={formData.identityCard}
                            onChange={handleChange}
                            required
                        />
                        {isTemporaryResidence && (
                            <>
                                <Input
                                    label="Số điện thoại"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Thông tin cư trú</h3>
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

                        {isTemporaryResidence ? (
                            <>
                                <Input
                                    label="Địa chỉ thường trú (Quê quán)"
                                    name="permanentAddress"
                                    value={formData.permanentAddress}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Nghề nghiệp"
                                        name="job"
                                        value={formData.job}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Nơi làm việc"
                                        name="workplace"
                                        value={formData.workplace}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="bg-yellow-50 p-3 rounded border border-yellow-100 mt-2">
                                    <p className="text-sm font-medium text-yellow-800 mb-2">Thông tin nơi tạm trú</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            label="Địa chỉ tạm trú"
                                            name="temporaryAddress"
                                            value={formData.temporaryAddress}
                                            onChange={handleChange}
                                            required
                                            placeholder="Nhập địa chỉ tạm trú"
                                        />
                                        <Input
                                            label="Tên chủ hộ (nếu có)"
                                            name="hostName"
                                            value={formData.hostName}
                                            onChange={handleChange}
                                        />
                                        <Input
                                            label="Quan hệ với chủ hộ"
                                            name="relationshipWithHost"
                                            value={formData.relationshipWithHost}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Input
                                    label="Địa chỉ thường trú (Hiện tại)"
                                    name="permanentAddress"
                                    value={formData.permanentAddress}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập địa chỉ thường trú hiện tại"
                                />
                                <Input
                                    label="Nơi đến (Địa chỉ tạm trú)"
                                    name="tempAddress"
                                    value={formData.tempAddress}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập địa chỉ nơi sẽ đến tạm trú"
                                />
                            </>
                        )}
                    </div>
                </div>

                <div className="input-group mt-4">
                    <label className="input-label">Lý do</label>
                    <textarea 
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="input-field"
                        rows="3"
                    ></textarea>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button type="submit" className={`${buttonClass} text-white px-6 py-2`}>
                        {isTemporaryResidence ? 'Đăng ký Tạm trú' : 'Lưu khai báo Tạm vắng'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default TemporaryResidenceForm;
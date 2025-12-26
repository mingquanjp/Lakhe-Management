import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/commons/Button/Button';
import Input from '../../../../components/commons/Input/Input';
import { getAuthToken } from '../../../../utils/api';
import './TemporaryResidenceForm.css';

const TemporaryResidenceForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'temporary_residence_new', // 'temporary_residence_new', 'temporary_residence_existing', 'temporary_absence'
        householdCode: '', 
        hostHouseholdId: '', // For existing household
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
        hostName: '', 
        relationshipWithHost: '',
        // Temp Absence specific
        tempAddress: '' 
    });

    // State for temporary absence
    const [selectedAbsenceHouseholdId, setSelectedAbsenceHouseholdId] = useState('');
    const [householdMembers, setHouseholdMembers] = useState([]);
    const [selectedResidentId, setSelectedResidentId] = useState(null);
    
    // State for temporary residence
    const [households, setHouseholds] = useState([]); // List of households for selection

    // Fetch households when switching to 'existing' or 'absence' type
    useEffect(() => {
        if (formData.type === 'temporary_residence_existing' || formData.type === 'temporary_absence') {
            fetchHouseholds();
        }
    }, [formData.type]);

    const fetchHouseholds = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch('http://localhost:5000/api/households', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                setHouseholds(result.data);
            }
        } catch (error) {
            console.error("Error fetching households:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        
        if (name === 'fullName' || name === 'dob') {
            setSelectedResidentId(null);
        }
    };

    const handleHouseholdChange = (e) => {
        const householdId = e.target.value;
        const selectedHousehold = households.find(h => h.household_id === parseInt(householdId));
        
        setFormData(prev => ({
            ...prev,
            hostHouseholdId: householdId,
            hostName: selectedHousehold ? selectedHousehold.head_name : '',
            tempAddress: selectedHousehold ? selectedHousehold.address : ''
        }));
    };

    // Handle household selection for temporary absence
    const handleAbsenceHouseholdChange = async (e) => {
        const householdId = e.target.value;
        setSelectedAbsenceHouseholdId(householdId);
        setSelectedResidentId(null);
        
        if (householdId) {
            try {
                const token = getAuthToken();
                const response = await fetch(`http://localhost:5000/api/residents?household_id=${householdId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const result = await response.json();
                    setHouseholdMembers(result.data || []);
                } else {
                    setHouseholdMembers([]);
                }
            } catch (error) {
                console.error('Error fetching household members:', error);
                setHouseholdMembers([]);
            }
        } else {
            setHouseholdMembers([]);
        }
    };

    // Handle member selection for temporary absence
    const handleMemberChange = (e) => {
        const residentId = e.target.value;
        if (!residentId) {
            setSelectedResidentId(null);
            return;
        }
        
        const member = householdMembers.find(m => m.resident_id === parseInt(residentId));
        if (member) {
            setSelectedResidentId(member.resident_id);
            setFormData(prev => ({
                ...prev,
                fullName: `${member.last_name} ${member.first_name}`,
                dob: member.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
                identityCard: member.identity_card_number || '',
            }));
        }
    };

    // Remove search change handler - no longer needed for temporary absence

    // Remove handleSelectResident - replaced by handleMemberChange

    const splitName = (fullName) => {
        const parts = fullName.trim().split(' ');
        const firstName = parts.pop() || '';
        const lastName = parts.join(' ') || '';
        return { firstName, lastName };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getAuthToken();
        const { firstName, lastName } = splitName(formData.fullName);

        try {
            if (formData.type === 'temporary_residence_existing') {
                // Option A: Into existing household
                const payload = {
                    host_household_id: formData.hostHouseholdId,
                    first_name: firstName,
                    last_name: lastName,
                    identity_card_number: formData.identityCard,
                    dob: formData.dob,
                    gender: 'Male', // Default or add field
                    home_address: formData.permanentAddress,
                    reason: formData.reason,
                    start_date: formData.fromDate,
                    end_date: formData.toDate,
                    occupation: formData.job,
                    workplace: formData.workplace,
                    email: formData.email,
                    phone: formData.phone
                };

                const response = await fetch('http://localhost:5000/api/residents/temporary-residence', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.success) {
                    alert('Đăng ký tạm trú vào hộ đã có thành công!');
                    navigate('/admin/householdtemporary');
                } else {
                    alert('Lỗi: ' + result.message);
                }

            } else if (formData.type === 'temporary_residence_new') {
                // Option B: New household
                const payload = {
                    household_code: formData.householdCode,
                    address: formData.tempAddress,
                    start_date: formData.fromDate,
                    end_date: formData.toDate,
                    reason: formData.reason,
                    owner: {
                        name: formData.fullName,
                        dob: formData.dob,
                        gender: 'Male', // Default or add field
                        cccd: formData.identityCard
                    },
                    members: []
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
                    alert('Đăng ký tạm trú (hộ mới) thành công!');
                    navigate('/admin/householdtemporary');
                } else {
                    alert('Lỗi: ' + result.message);
                }
            } else {
                // Temporary Absence
                const payload = {
                    resident_id: selectedResidentId,
                    first_name: firstName,
                    last_name: lastName,
                    dob: formData.dob,
                    gender: 'Male', // Default or add field
                    identity_card_number: formData.identityCard,
                    permanent_address: formData.permanentAddress, 
                    temporary_address: formData.tempAddress,
                    reason: formData.reason,
                    start_date: formData.fromDate,
                    end_date: formData.toDate,
                    absence_code: formData.householdCode
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
                    alert('Lỗi: ' + result.message);
                }
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Có lỗi xảy ra khi gửi biểu mẫu.');
        }
    };

    const isTemporaryResidence = formData.type.startsWith('temporary_residence');
    const themeClass = isTemporaryResidence ? 'theme-yellow' : 'theme-red';
    const buttonClass = isTemporaryResidence 
        ? 'bg-yellow-500 hover:bg-yellow-600' 
        : 'bg-red-600 hover:bg-red-700';

    return (
        <div className={`temporary-residence-form ${themeClass}`}>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="declaration-tabs-container">
                    <div className="declaration-tabs">
                        <button
                            type="button"
                            className={`tab-button ${formData.type === 'temporary_residence_new' ? 'active-yellow' : ''}`}
                            onClick={() => handleChange({ target: { name: 'type', value: 'temporary_residence_new' } })}
                        >
                            Tạm trú (Hộ mới)
                        </button>
                        <button
                            type="button"
                            className={`tab-button ${formData.type === 'temporary_residence_existing' ? 'active-yellow' : ''}`}
                            onClick={() => handleChange({ target: { name: 'type', value: 'temporary_residence_existing' } })}
                        >
                            Tạm trú (Vào hộ có)
                        </button>
                        <button
                            type="button"
                            className={`tab-button ${formData.type === 'temporary_absence' ? 'active-red' : ''}`}
                            onClick={() => handleChange({ target: { name: 'type', value: 'temporary_absence' } })}
                        >
                            Tạm vắng
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Thông tin cá nhân</h3>
                        
                        {/* Conditional Household Code / Selection */}
                        {formData.type === 'temporary_residence_new' && (
                            <Input
                                label="Mã hộ khẩu mới"
                                name="householdCode"
                                value={formData.householdCode}
                                onChange={handleChange}
                                required
                                placeholder="Nhập mã hộ khẩu mới"
                            />
                        )}
                        
                        {formData.type === 'temporary_residence_existing' && (
                            <div className="input-group">
                                <label className="input-label">Chọn hộ khẩu thường trú</label>
                                <select 
                                    className="input-field"
                                    name="hostHouseholdId"
                                    value={formData.hostHouseholdId}
                                    onChange={handleHouseholdChange}
                                    required
                                >
                                    <option value="">-- Chọn hộ khẩu --</option>
                                    {households.map(h => (
                                        <option key={h.household_id} value={h.household_id}>
                                            {h.household_code} - {h.head_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        {/* Temporary Absence: Household and Member Selector */}
                        {formData.type === 'temporary_absence' && (
                            <>
                                <div className="input-group">
                                    <label className="input-label">Chọn hộ khẩu</label>
                                    <select 
                                        className="input-field"
                                        value={selectedAbsenceHouseholdId}
                                        onChange={handleAbsenceHouseholdChange}
                                        required
                                    >
                                        <option value="">-- Chọn hộ khẩu --</option>
                                        {households.map(h => (
                                            <option key={h.household_id} value={h.household_id}>
                                                {h.household_code} - {h.head_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="input-group">
                                    <label className="input-label">Chọn thành viên</label>
                                    <select 
                                        className="input-field"
                                        value={selectedResidentId || ''}
                                        onChange={handleMemberChange}
                                        required
                                        disabled={!selectedAbsenceHouseholdId}
                                    >
                                        <option value="">-- Chọn thành viên --</option>
                                        {householdMembers.map(member => (
                                            <option key={member.resident_id} value={member.resident_id}>
                                                {member.first_name} {member.last_name} - {member.dob ? new Date(member.dob).toLocaleDateString('vi-VN') : 'N/A'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

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
                                    label="Địa chỉ tạm trú"
                                    name="tempAddress"
                                    value={formData.tempAddress}
                                    onChange={handleChange}
                                    required
                                    readOnly={formData.type === 'temporary_residence_existing'} // Readonly if existing
                                />
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
                                <div className="bg-yellow-50 p-4 rounded border border-yellow-100 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">Thông tin chủ hộ (Nơi tạm trú)</h3>
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
                                            readOnly={formData.type === 'temporary_residence_existing'}
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
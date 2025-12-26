import React, { useState, useEffect, useRef } from 'react';
import Button from '../../../../components/commons/Button/Button';
import Input from '../../../../components/commons/Input/Input';
import { getAuthToken } from '../../../../utils/api';
import './MemberStatusChangeForm.css';

const MemberStatusChangeForm = () => {
    const [formData, setFormData] = useState({
        residentId: '',
        memberName: '',
        changeType: 'move_out',
        changeDate: '',
        reason: '',
        // Move out specific
        newAddress: '',
        // Deceased specific
        deathCertificateNumber: '',
        deathReason: ''
    });
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeoutRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        // Close suggestions when clicking outside
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

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, memberName: value }));
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (value.length > 1) {
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const token = getAuthToken();
                    const response = await fetch(`http://localhost:5000/api/residents?search=${encodeURIComponent(value)}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const result = await response.json();
                        setSearchResults(result.data);
                        setShowSuggestions(true);
                    }
                } catch (error) {
                    console.error("Error searching residents:", error);
                }
            }, 300); // Debounce 300ms
        } else {
            setSearchResults([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectResident = (resident) => {
        setFormData(prev => ({
            ...prev,
            memberName: `${resident.last_name} ${resident.first_name}`,
            residentId: resident.resident_id
        }));
        setShowSuggestions(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.residentId) {
            alert("Vui lòng chọn nhân khẩu từ danh sách gợi ý!");
            return;
        }

        try {
            const token = getAuthToken();
            let response;
            if (formData.changeType === 'deceased') {
                response = await fetch(`http://localhost:5000/api/residents/${formData.residentId}/death`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        death_date: formData.changeDate,
                        notes: formData.deathReason
                    })
                });
            } else {
                // Move out
                response = await fetch(`http://localhost:5000/api/residents/${formData.residentId}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: 'MovedOut',
                        notes: `Chuyển đi ngày: ${new Date(formData.changeDate).toLocaleDateString('vi-VN')}\nLý do: ${formData.reason}\nĐịa chỉ mới: ${formData.newAddress}`
                    })
                });
            }

            const result = await response.json();
            
            if (response.ok) {
                alert('Đã cập nhật trạng thái nhân khẩu thành công!');
                // Reset form
                setFormData({
                    residentId: '',
                    memberName: '',
                    changeType: 'move_out',
                    changeDate: '',
                    reason: '',
                    newAddress: '',
                    deathCertificateNumber: '',
                    deathReason: ''
                });
            } else {
                alert(`Lỗi: ${result.message}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Có lỗi xảy ra khi cập nhật trạng thái.");
        }
    };

    return (
        <div className="member-status-change-form">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div style={{ position: 'relative' }} ref={wrapperRef}>
                    <Input
                        label="Chọn nhân khẩu"
                        name="memberName"
                        value={formData.memberName}
                        onChange={handleSearchChange}
                        placeholder="Tìm kiếm tên, CCCD hoặc Mã hộ khẩu"
                        required
                        autoComplete="off"
                    />
                    {showSuggestions && searchResults.length > 0 && (
                        <div className="suggestion-box">
                            {searchResults.map(resident => (
                                <div 
                                    key={resident.resident_id} 
                                    className="suggestion-item"
                                    onClick={() => handleSelectResident(resident)}
                                >
                                    <div className="suggestion-name">{resident.last_name} {resident.first_name}</div>
                                    <div className="suggestion-details">
                                        <span>HK: {resident.household_code || 'N/A'}</span>
                                        <span>•</span>
                                        <span>CCCD: {resident.identity_card_number || 'N/A'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <div className="input-group">
                        <label className="input-label">Loại thay đổi</label>
                        <select 
                            name="changeType"
                            value={formData.changeType}
                            onChange={handleChange}
                            className="input-field font-medium"
                        >
                            <option value="move_out">Chuyển đi</option>
                            <option value="deceased">Qua đời</option>
                        </select>
                    </div>
                </div>

                <Input
                    label={formData.changeType === 'deceased' ? "Ngày mất" : "Ngày chuyển đi"}
                    type="date"
                    name="changeDate"
                    value={formData.changeDate}
                    onChange={handleChange}
                    required
                />

                {formData.changeType === 'move_out' ? (
                    <Input
                        label="Địa chỉ chuyển đến"
                        name="newAddress"
                        value={formData.newAddress}
                        onChange={handleChange}
                        required
                        placeholder="Nhập địa chỉ nơi chuyển đến"
                    />
                ) : (
                    <>
                        <Input
                            label="Số giấy chứng tử"
                            name="deathCertificateNumber"
                            value={formData.deathCertificateNumber}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Nguyên nhân mất"
                            name="deathReason"
                            value={formData.deathReason}
                            onChange={handleChange}
                        />
                    </>
                )}

                <div className="input-group">
                    <label className="input-label">Ghi chú thêm</label>
                    <textarea 
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="input-field"
                        rows="3"
                    ></textarea>
                </div>

                <div className="mt-4">
                    <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white">Cập nhật trạng thái</Button>
                </div>
            </form>
        </div>
    );
};

export default MemberStatusChangeForm;
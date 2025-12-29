import React, { useState, useEffect } from 'react';
import Button from '../../../../components/commons/Button/Button';
import Input from '../../../../components/commons/Input/Input';
import { DateInput } from '../../../../components/commons/Input';
import Modal from '../../../../components/commons/Modal';
import { getAuthToken } from '../../../../utils/api';
import './ChangeOwnerForm.css';

const ChangeOwnerForm = () => {
    // 1. Khai báo các state còn thiếu
    const [households, setHouseholds] = useState([]);
    const [selectedHouseholdId, setSelectedHouseholdId] = useState('');
    const [currentHeadId, setCurrentHeadId] = useState(null);
    const [members, setMembers] = useState([]);
    
    const [formData, setFormData] = useState({
        currentOwner: '', 
        newOwnerId: '', 
        reason: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [notification, setNotification] = useState({
        isOpen: false,
        type: 'success',
        message: ''
    });

    useEffect(() => {
        fetchHouseholds();
    }, []);

    const fetchHouseholds = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch('http://localhost:5000/api/households', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setHouseholds(data.data);
            }
        } catch (error) {
            console.error('Error fetching households:', error);
        }
    };

    const handleHouseholdChange = async (e) => {
        const householdId = e.target.value;
        setSelectedHouseholdId(householdId);
        
        if (householdId) {
            try {
                const token = getAuthToken();
                const response = await fetch(`http://localhost:5000/api/households/${householdId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMembers(data.residents || []);
                    setCurrentHeadId(data.household.head_of_household_id || null);
                    setFormData(prev => ({
                        ...prev,
                        currentOwner: data.household.owner_name || data.household.head_name || 'Chưa có chủ hộ',
                        newOwnerId: ''
                    }));
                }
            } catch (error) {
                console.error('Error fetching household details:', error);
            }
        } else {
            setMembers([]);
            setFormData(prev => ({ ...prev, currentOwner: '', newOwnerId: '' }));
        }
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
        
        if (!selectedHouseholdId || !formData.newOwnerId) {
            setNotification({
                isOpen: true,
                message: 'Vui lòng chọn hộ khẩu và chủ hộ mới',
                type: 'error'
            });
            return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch('http://localhost:5000/api/households/change-head', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    household_id: selectedHouseholdId,
                    new_head_id: formData.newOwnerId,
                    reason: formData.reason,
                    change_date: formData.date
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setNotification({
                    isOpen: true,
                    message: 'Đã thay đổi chủ hộ thành công!',
                    type: 'success'
                });
                // Refresh data
                handleHouseholdChange({ target: { value: selectedHouseholdId } });
                setFormData(prev => ({ ...prev, reason: '', newOwnerId: '' }));
            } else {
                setNotification({
                    isOpen: true,
                    message: `Lỗi: ${result.message}`,
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error changing owner:', error);
            setNotification({
                isOpen: true,
                message: 'Có lỗi xảy ra khi thay đổi chủ hộ',
                type: 'error'
            });
        }
    };

    return (
        <div className="change-owner-form">
            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Thêm dropdown chọn hộ khẩu */}
                <div className="input-group">
                    <label className="input-label">Chọn hộ khẩu</label>
                    <select 
                        className="input-field"
                        onChange={handleHouseholdChange}
                        value={selectedHouseholdId}
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
                    <label className="input-label">Chủ hộ hiện tại</label>
                    <input 
                        className="input-field bg-gray-100"
                        name="currentOwner"
                        value={formData.currentOwner}
                        readOnly
                    />
                </div>
                
                <div className="input-group">
                    <label className="input-label">Chủ hộ mới</label>
                    <select 
                        name="newOwnerId" // Sửa name thành newOwnerId
                        value={formData.newOwnerId} // Sửa value thành newOwnerId
                        onChange={handleChange}
                        className="input-field"
                        required
                        disabled={!selectedHouseholdId}
                    >
                        <option value="">-- Chọn chủ hộ mới --</option>
                        {members && members
                            .filter(m => (m.status === 'Permanent' || m.status === 'Thường trú') && m.resident_id !== currentHeadId) 
                            .map(member => (
                            <option key={member.resident_id} value={member.resident_id}>
                                {member.first_name} {member.last_name} ({new Date(member.dob).getFullYear()})
                            </option>
                        ))}
                    </select>
                </div>

                <DateInput
                    label="Ngày thay đổi"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />

                <div className="input-group">
                    <label className="input-label">Lý do thay đổi</label>
                    <textarea 
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="input-field"
                        rows="3"
                        required
                    ></textarea>
                </div>

                <div className="mt-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Lưu thay đổi</Button>
                </div>
            </form>

            <Modal
                isOpen={notification.isOpen}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                title={notification.type === 'success' ? 'Thành công' : 'Lỗi'}
                size="sm"
            >
                <div style={{ padding: "20px" }}>
                    <p style={{ marginBottom: "20px", color: "#333" }}>{notification.message}</p>
                    <div className="modal-footer">
                        <button 
                            className={notification.type === 'success' ? "modal-btn-success" : "modal-btn-delete"}
                            onClick={() => setNotification({ ...notification, isOpen: false })}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ChangeOwnerForm;
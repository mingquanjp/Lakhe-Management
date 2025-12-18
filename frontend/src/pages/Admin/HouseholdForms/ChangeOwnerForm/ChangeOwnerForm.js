import React from "react";
import { useState, useEffect } from "react";
import Button from '../../../../components/commons/Button/Button';
import Input from '../../../../components/commons/Input/Input';
import { getAuthToken } from '../../../../utils/api';
import './ChangeOwnerForm.css';

const ChangeOwnerForm = () => {
    const [households, setHouseholds] = useState([]);
    const [selectedHouseholdId, setSelectedHouseholdId] = useState('');
    const [members, setMembers] = useState([]);
    const [formData, setFormData] = useState({
        currentOwner: '',
        newOwnerId: '',
        reason: '',
        date: new Date().toISOString().split('T')[0]
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
                    setMembers(data.residents);
                    setFormData(prev => ({
                        ...prev,
                        currentOwner: data.household.owner_name || 'Chưa có chủ hộ',
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
            alert('Vui lòng chọn hộ khẩu và chủ hộ mới');
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
                alert('Đã thay đổi chủ hộ thành công!');
                // Refresh data
                handleHouseholdChange({ target: { value: selectedHouseholdId } });
                setFormData(prev => ({ ...prev, reason: '', newOwnerId: '' }));
            } else {
                alert(`Lỗi: ${result.message}`);
            }
        } catch (error) {
            console.error('Error changing owner:', error);
            alert('Có lỗi xảy ra khi thay đổi chủ hộ');
        }
    };

    return (
        <div className="change-owner-form">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="input-label">Chọn hộ khẩu</label>
                    <select 
                        className="input-field"
                        value={selectedHouseholdId}
                        onChange={handleHouseholdChange}
                        required
                    >
                        <option value="">-- Chọn hộ khẩu --</option>
                        {households.map(h => (
                            <option key={h.household_id} value={h.household_id}>
                                {h.household_code} - {h.owner_name}
                            </option>
                        ))}
                    </select>
                </div>

                <Input
                    label="Chủ hộ hiện tại"
                    name="currentOwner"
                    value={formData.currentOwner}
                    readOnly
                    className="input-field bg-gray-100"
                />
                
                <div className="input-group">
                    <label className="input-label">Chủ hộ mới</label>
                    <select 
                        name="newOwnerId"
                        value={formData.newOwnerId}
                        onChange={handleChange}
                        className="input-field"
                        required
                        disabled={!selectedHouseholdId}
                    >
                        <option value="">-- Chọn chủ hộ mới --</option>
                        {members
                            .filter(m => m.status === 'Permanent' || m.status === 'Thường trú') // Only show permanent residents
                            .map(member => (
                            <option key={member.resident_id} value={member.resident_id}>
                                {member.last_name} {member.first_name} ({new Date(member.dob).getFullYear()})
                            </option>
                        ))}
                    </select>
                </div>

                <Input
                    label="Ngày thay đổi"
                    type="date"
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
        </div>
    );
};

export default ChangeOwnerForm;
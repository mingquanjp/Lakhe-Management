import React from "react";
import { useState } from "react";
import Button from '../../../../components/commons/Button/Button';
import Input from '../../../../components/commons/Input/Input';
import Card from '../../../../components/commons/Card/Card';
import Modal from '../../../../components/commons/Modal';
import './NewHouseholdForm.css';

const NewHouseholdForm = () => {
    const [formData, setFormData] = useState({
        householdId: '',
        ownerName: '',
        address: ''
    });
    const [notification, setNotification] = useState({
        isOpen: false,
        message: '',
        type: 'success'
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
        console.log('New Household Data:', formData);
        // Add API call logic here
        setNotification({
            isOpen: true,
            message: 'Đã gửi thông tin khai báo hộ khẩu mới!',
            type: 'success'
        });
    };

    return (
        <Card title="Khai báo hộ khẩu mới" className="new-household-form">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                    label="Số sổ hộ khẩu"
                    name="householdId"
                    value={formData.householdId}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Chủ hộ"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Địa chỉ"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                />
                <div className="mt-4">
                    <Button type="submit" variant="primary">Tạo mới</Button>
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
        </Card>
    );
};

export default NewHouseholdForm;

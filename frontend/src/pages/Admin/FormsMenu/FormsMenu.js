import React from "react";
import { useState } from "react";
import Modal from '../../../components/commons/Modal/Modal';
import MemberStatusChangeForm from '../HouseholdForms/MemberStatusChangeForm/MemberStatusChangeForm';
import ChangeOwnerForm from '../HouseholdForms/ChangeOwnerForm/ChangeOwnerForm';
import TemporaryResidenceForm from '../HouseholdForms/TemporaryResidenceForm/TemporaryResidenceForm';
import './FormsMenu.css';

const FormsMenu = () => {
    const [selectedForm, setSelectedForm] = useState(null);

    const menuItems = [
        {
            id: 'member-status-change',
            title: 'Thay đổi nhân khẩu',
            description: 'Khai báo chuyển đi, qua đời hoặc thay đổi thông tin khác.',
            icon: '🔄',
            themeClass: 'card-blue'
        },
        {
            id: 'change-owner',
            title: 'Thay đổi chủ hộ',
            description: 'Chuyển quyền chủ hộ cho thành viên khác trong gia đình.',
            icon: '🏠',
            themeClass: 'card-green'
        },
        {
            id: 'temporary-residence',
            title: 'Tạm trú / Tạm vắng',
            description: 'Khai báo thông tin tạm trú cho người mới đến hoặc tạm vắng.',
            icon: '📝',
            themeClass: 'card-yellow'
        }
    ];

    const renderFormContent = () => {
        switch(selectedForm) {
            case 'member-status-change':
                return <MemberStatusChangeForm onClose={() => setSelectedForm(null)} />;
            case 'change-owner':
                return <ChangeOwnerForm />;
            case 'temporary-residence':
                return <TemporaryResidenceForm />;
            default:
                return null;
        }
    };

    const getFormTitle = () => {
        const item = menuItems.find(m => m.id === selectedForm);
        return item ? item.title : '';
    };

    return (
        <div className="forms-menu-container">
            <div className="forms-menu-header">
                <h2 className="page-title">Các biểu mẫu khai báo</h2>
                <p className="forms-menu-subtitle">Chọn loại biểu mẫu bạn cần thực hiện khai báo</p>
            </div>

            <div className="forms-grid">
                {menuItems.map((item) => (
                    <div 
                        key={item.id}
                        onClick={() => setSelectedForm(item.id)}
                        className={`form-card ${item.themeClass}`}
                    >
                        <div className="card-icon">{item.icon}</div>
                        <h3 className="card-title">{item.title}</h3>
                        <p className="card-description">{item.description}</p>
                        <div className="card-action">
                            <span className="action-badge">
                                Nhấn để mở →
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={!!selectedForm}
                onClose={() => setSelectedForm(null)}
                title={getFormTitle()}
                size="large"
            >
                {renderFormContent()}
            </Modal>
        </div>
    );
};

export default FormsMenu;

import React from 'react';
import Modal from './Modal';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Xác nhận xóa", 
    message = "Bạn có chắc chắn muốn xóa bản ghi này?" 
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            style={{ width: '700px' }}
        >
            <div className="delete-modal-content">
                <p className="delete-modal-text">{message}</p>
                <div className="delete-modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Hủy
                    </button>
                    <button className="btn-delete-confirm" onClick={onConfirm}>
                        Xóa
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteConfirmationModal;
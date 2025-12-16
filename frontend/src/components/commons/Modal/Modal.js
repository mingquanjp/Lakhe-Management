import React from "react";
import './Modal.css';
const Modal =({
    isOpen = false,
    onClose,
    title,
    children,
    size= 'medium',
    showCloseButton = true,
    ...props
}) => {
    if(!isOpen) return null;

    const handleOverlayClick = (e) => {
        if(e.target === e.currentTarget){
            onClose();
        }
    }
    return(
         <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content modal-${size}`} {...props}>
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          {showCloseButton && (
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
          )}
        </div>
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
    )
}

export default Modal;
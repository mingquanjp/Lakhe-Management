import React, { useRef } from 'react';
import Input from './Input';

const DateInput = ({ label, name, value, onChange, required, ...props }) => {
    const dateInputRef = useRef(null);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const handleClick = () => {
        if (dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') {
            dateInputRef.current.showPicker();
        } else if (dateInputRef.current) {
            dateInputRef.current.focus();
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <Input
                label={label}
                name={name}
                value={formatDate(value)}
                onChange={() => {}}
                required={required}
                placeholder="dd/mm/yyyy"
                onClick={handleClick}
                readOnly
                style={{ cursor: 'pointer', backgroundColor: '#fff' }}
                {...props}
            />
            <input
                type="date"
                ref={dateInputRef}
                name={name}
                value={value}
                onChange={onChange}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    opacity: 0,
                    pointerEvents: 'none',
                    border: 0
                }}
                tabIndex={-1}
                required={required}
            />
        </div>
    );
};

export default DateInput;

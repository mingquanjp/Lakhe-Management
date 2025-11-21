import React from 'react';
import './Card.css';

const Card = ({ children, className = '', padding = 'medium', ...props }) => {
  const cardClass = [
    'card',
    `card-padding-${padding}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
};

export default Card;
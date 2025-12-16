import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value}) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
      </div>
      <div className="stat-content">
        <h2 className="stat-value">{value}</h2>
      </div>
    </div>
  );
};

export default StatCard;
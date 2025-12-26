import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value}) => {
  return (
    <div className="stat-card-overview">
      <div className="stat-header-overview">
        <span className="stat-title-overview">{title}</span>
      </div>
      <div className="stat-content-overview">
        <h2 className="stat-value-overview">{value}</h2>
      </div>
    </div>
  );
};

export default StatCard;
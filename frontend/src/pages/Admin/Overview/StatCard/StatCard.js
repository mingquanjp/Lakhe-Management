import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import './StatCard.css';

const StatCard = ({ title, value, change, isPositive }) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
      </div>
      <div className="stat-content">
        <h2 className="stat-value">{value}</h2>
        <span className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          {change}
        </span>
      </div>
    </div>
  );
};

export default StatCard;
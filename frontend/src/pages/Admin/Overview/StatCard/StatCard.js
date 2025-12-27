import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, color = "#1890ff" }) => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = React.useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      className="stat-card-overview"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        "--x": `${position.x}px`,
        "--y": `${position.y}px`,
        "--spotlight-opacity": opacity,
        "--card-color": color,
      }}
    >
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
import React from 'react';
import './ActivityList.css';

const ActivityList = () => {
  return (
    <div className="chart-card activity-card">
      <div className="card-header">
        <h3>Hoạt động gần đây</h3>
      </div>
      <ul className="activity-list">
        <li>Hộ anh Việt vừa thêm nhân khẩu mới.</li>
        <li>Hộ anh Quân vừa thêm nhân khẩu mới.</li>
        <li>Hộ anh Minh vừa đăng kí tạm vắng.</li>
      </ul>
    </div>
  );
};

export default ActivityList;
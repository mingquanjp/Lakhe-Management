import React from "react";
import "./ActivityList.css";

const ActivityList = ({ activities }) => {
  return (
    <div className="chart-card activity-card">
      <div className="card-header">
        <h3>Hoạt động gần đây</h3>
      </div>
      <ul className="activity-list">
        {activities && activities.length > 0 ? (
          activities.map((act, index) => {
            const time = new Date(act.change_date).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            let content = "";
            const hCode = act.household_code || "Unknown";
            const rName = act.resident_name; 

            const performer = act.performer_name
              ? `Thực hiện bởi: ${act.performer_name}`
              : "Thực hiện bởi: Hệ thống";

            switch (act.change_type) {
              case "Added":
                content = `Thêm hộ khẩu mới ${hCode}.`;
                break;

              case "Split":
                content = `Tách hộ khẩu từ hộ ${hCode}.`;
                break;

              case "Removed":
                  content = `Xóa hộ khẩu ${hCode}.`;
                break;

              case "MoveOut":
                content = rName
                  ? `Hộ ${hCode}: Thành viên "${rName}" chuyển đi.`
                  : `Hộ khẩu "${hCode}" đã chuyển đi.`;
                break;

              case "NewBirth":
                content = `Hộ ${hCode}: Đăng ký khai sinh cho "${rName}".`;
                break;

              case "Death":
                content = `Hộ ${hCode}: Khai tử cho "${rName}".`;
                break;

              default:
                content = `Hộ ${hCode}: Có thay đổi (${act.change_type}).`;
            }

            return (
              <li key={index} className="activity-item">
                <div className="activity-top">{content}</div>
                <div className="activity-bottom">
                  <span className="activity-performer">{performer}</span>
                  <span className="activity-dot">•</span>
                  <span className="activity-time">{time}</span>
                </div>
              </li>
            );
          })
        ) : (
          <li className="no-activity">Chưa có hoạt động nào được ghi nhận.</li>
        )}
      </ul>
    </div>
  );
};

export default ActivityList;
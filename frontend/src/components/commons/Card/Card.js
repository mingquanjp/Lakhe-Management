import React from "react";
import "./Card.css";

/**
 * Card Component - Component thẻ chứa nội dung với header và actions
 *
 * // Card với các tùy chọn như:
 * - title (tiêu đề card)
 * - subtitle (phụ đề card)
 * - actions (các nút hành động ở góc phải header)
 * - children (nội dung bên trong card)
 * - className (thêm class tùy chỉnh)
 *
 * Anh em có thể dùng Card cơ bản hoặc tùy chỉnh theo nhu cầu
 * // Card đầy đủ với title, và nhiều  actions
      <Card
        title="Quản lý hộ khẩu"
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <Button size="small" variant="outline">
              Sửa
            </Button>
            <Button size="small" variant="danger">
              Xóa
            </Button>
          </div>
        }
      >
        <p>Quản lý thông tin hộ khẩu và nhân khẩu</p>
      </Card>
 */
const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = "",
  ...props
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || subtitle || actions) && (
        <div className="card-header">
          <div className="card-title-section">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}

      <div className="card-content">{children}</div>
    </div>
  );
};

export default Card;

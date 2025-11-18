import React from "react";
import Card from "./Card";
import Button from "../Button/Button";

const Demo = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "400px",
      }}
    >
      {/* Card cơ bản */}
      <Card title="Thông tin hộ khẩu">
        <p>Số hộ khẩu: HK001</p>
        <p>Chủ hộ: Nguyễn Văn A</p>
        <p>Địa chỉ: Số 1, Tổ 7, La Khê</p>
      </Card>

      {/* Card có subtitle và actions */}
      <Card
        title="Danh sách nhân khẩu"
        subtitle="Tổng: 4 người"
        actions={<Button size="small">Thêm người</Button>}
      >
        <ul>
          <li>Nguyễn Văn A - Chủ hộ</li>
          <li>Trần Thị B - Vợ</li>
          <li>Nguyễn Văn C - Con</li>
        </ul>
      </Card>

      {/* Card chỉ có content */}
      <Card>
        <p>Đây là card không có tiêu đề</p>
        <Button variant="primary">Xem chi tiết</Button>
      </Card>

      {/* Card nhiều actions */}
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
    </div>
  );
};

export default Demo;

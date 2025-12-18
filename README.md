# Accountant

Các chức năng chính ở nghiệp vụ kế toán

## Tính năng chính

- **Dashboard:**  
  - Xem tổng quan các đợt thu phí, số liệu thống kê (tổng tiền đã thu, dự kiến, số hộ đã nộp/chưa nộp).
  - Chuyển nhanh giữa các đợt thu phí.
- **Quản lý đợt thu phí:**  
  - Tạo mới, xem chi tiết, và quản lý các đợt thu phí (bắt buộc hoặc tự nguyện).
  - Theo dõi tiến độ thu phí, trạng thái từng hộ.
  - Ghi nhận thanh toán cho từng hộ khẩu, chỉnh sửa ngày nộp.
- **Quản lý hộ khẩu:**  
  - Xem danh sách hộ khẩu, thông tin chủ hộ, địa chỉ, số thành viên.
  - Theo dõi trạng thái đóng phí của từng hộ.
- **Tìm kiếm, lọc, xuất dữ liệu:**  
  - Tìm kiếm hộ khẩu theo tên hoặc mã số.
  - Lọc, xuất dữ liệu bảng chi tiết từng đợt thu.

## Công nghệ sử dụng

- [React](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- Create React App

## Hướng dẫn cài đặt & sử dụng

### Yêu cầu

- [Node.js](https://nodejs.org/) >= 14.x
- [npm](https://www.npmjs.com/)

### Cài đặt

1. **Clone repository:**
    ```bash
    git clone https://github.com/mingquanjp/Lakhe-Management.git
    ```
2. **Đi vào thư mục dự án:**
    ```bash
    cd Lakhe-Management/frontend
    ```
3. **Cài đặt dependencies:**
    ```bash
    npm install
    ```
4. **Chạy ứng dụng:**
    ```bash
    npm start
    ```
    Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt.

## Cấu trúc thư mục

```
frontend/
├── public/                        # File tĩnh (index.html, manifest, robots)
├── src/
│   ├── App.js                     # Điểm vào chính của React
│   ├── index.js                   # Render React root
│   ├── index.css                  # CSS toàn cục
│   ├── assets/                    # Hình ảnh, icon, font
│   ├── components/
│   │   ├── common/                # Component dùng chung (Button, Card, Modal, Table, ...)
│   │   ├── Dashboard/             # Component cho dashboard (DashboardContent.js, .css)
│   │   └── forms/                 # Các form (tạo đợt thu, ghi nhận thanh toán)
│   ├── context/                   # React Context (nếu dùng)
│   ├── data/                      # Dữ liệu mẫu (mockData.js)
│   ├── hooks/                     # Custom React hooks
│   ├── pages/                     # Các trang chính (FeeDetails, TestAccountantDashboard, ...)
│   ├── services/                  # Hàm gọi API (nếu có)
│   ├── styles/                    # CSS toàn cục (nếu có)
│   └── utils/                     # Hàm tiện ích
├── package.json                   # Danh sách dependencies
└── README.md                      # Tài liệu dự án
```

## Ghi chú

- Dữ liệu hiện tại sử dụng mock data trong `src/data/mockData.js`.
- Chuyển trang và điều hướng sử dụng React Router.
- Giao diện responsive, dễ mở rộng thêm chức năng quản lý cư dân, báo cáo, phân quyền, v.v.

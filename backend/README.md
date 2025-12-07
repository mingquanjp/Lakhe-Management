# Lakhe Management - Backend API

Backend API cho hệ thống quản lý hộ khẩu và nhân khẩu Lakhe Management, được xây dựng với Node.js, Express và PostgreSQL.

## 📋 Mục lục

- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)

## 🚀 Công nghệ sử dụng

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client cho Node.js
- **dotenv** - Quản lý biến môi trường
- **cors** - Cross-Origin Resource Sharing
- **nodemon** - Auto-restart server khi development

## 💻 Yêu cầu hệ thống

- Node.js >= 14.x
- PostgreSQL >= 12.x
- npm hoặc yarn

## 📦 Cài đặt

1. Clone repository và di chuyển vào thư mục backend:
```bash
cd backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo database PostgreSQL:
```bash
# Đăng nhập vào PostgreSQL
psql -U postgres

# Tạo database mới
CREATE DATABASE lakhe_management;

# Thoát khỏi psql
\q
```

4. Import database schema:
```bash
psql -U postgres -d lakhe_management -f src/database_definition.sql
```

## ⚙️ Cấu hình

Tạo file `.env` trong thư mục `backend/` với nội dung sau:

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=lakhe
DB_PASSWORD=your_password_here
DB_PORT=5432
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
```

> **Lưu ý:** Thay `your_password_here` bằng mật khẩu PostgreSQL của bạn.
> Thay `your_jwt_secret_here` bằng một chuỗi bí mật.

## 🏃 Chạy ứng dụng

### Development mode (với nodemon):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

### Kiểm tra kết nối:

- **Server status:** `http://localhost:5000/`
- **Database connection:** `http://localhost:5000/api/test-db`

## 📁 Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Cấu hình kết nối PostgreSQL
│   ├── controllers/             # Business logic
│   ├── middleware/              # Custom middleware
│   ├── models/                  # Database models
│   ├── routes/                  # API routes
│   ├── database_definition.sql  # Database schema
│   └── server.js               # Entry point
├── .env                        # Environment variables (không commit)
├── package.json
└── README.md
```

## 🗄️ Database Schema

Hệ thống quản lý 9 bảng chính:

### 1. **users** - Cán bộ quản lý
- Quản lý tài khoản admin và staff
- Phân quyền: `admin`, `staff`

### 2. **households** - Hộ khẩu
- Thông tin sổ hộ khẩu
- Liên kết với chủ hộ
- Trạng thái: `Active`, `MovedOut`

### 3. **residents** - Nhân khẩu
- Thông tin chi tiết cư dân
- CMND/CCCD, ngày sinh, nghề nghiệp
- Trạng thái: `Permanent`, `MovedOut`, `Deceased`

### 4. **temporary_residents** - Tạm trú
- Quản lý người tạm trú
- Thời gian bắt đầu và kết thúc

### 5. **temporary_absences** - Tạm vắng
- Theo dõi cư dân tạm vắng
- Nơi đến và lý do

### 6. **change_history** - Lịch sử biến động
- Log mọi thay đổi về hộ khẩu
- Loại thay đổi: `Split`, `MoveOut`, `Death`, `NewBirth`

### 7. **fees** - Danh mục khoản thu
- Quản lý các khoản phí
- Loại: `Mandatory`, `Voluntary`

### 8. **payment_history** - Lịch sử nộp tiền
- Theo dõi thanh toán của từng hộ
- Ghi nhận cán bộ thu tiền

## 🔌 API Endpoints

### Health Check
```
GET /                    # Kiểm tra server status
GET /api/test-db        # Kiểm tra database connection
```

### Households (Hộ khẩu)
```
GET    /api/households           # Lấy danh sách hộ khẩu
GET    /api/households/:id       # Lấy chi tiết hộ khẩu
POST   /api/households           # Tạo hộ khẩu mới
PUT    /api/households/:id       # Cập nhật hộ khẩu
DELETE /api/households/:id       # Xóa hộ khẩu
```

### Residents (Nhân khẩu)
```
GET    /api/residents            # Lấy danh sách nhân khẩu
GET    /api/residents/:id        # Lấy chi tiết nhân khẩu
POST   /api/residents            # Thêm nhân khẩu mới
PUT    /api/residents/:id        # Cập nhật nhân khẩu
DELETE /api/residents/:id        # Xóa nhân khẩu
```

### Fees (Khoản thu)
```
GET    /api/fees                 # Lấy danh sách khoản thu
GET    /api/fees/:id             # Lấy chi tiết khoản thu
POST   /api/fees                 # Tạo khoản thu mới
PUT    /api/fees/:id             # Cập nhật khoản thu
DELETE /api/fees/:id             # Xóa khoản thu
```

### Payments (Thanh toán)
```
GET    /api/payments             # Lấy lịch sử thanh toán
POST   /api/payments             # Ghi nhận thanh toán mới
GET    /api/payments/household/:id  # Lịch sử thanh toán của hộ
```

> **Lưu ý:** Các endpoints trên là ví dụ. Cần implement trong thư mục `routes/` và `controllers/`.

## 🔒 Authentication & Authorization

- Sử dụng JWT (JSON Web Tokens) để xác thực
- Middleware kiểm tra quyền admin/staff
- Protected routes yêu cầu token hợp lệ

## 🐛 Debugging

Khi gặp lỗi kết nối database, kiểm tra:

1. PostgreSQL service đang chạy
2. Thông tin trong file `.env` chính xác
3. Database đã được tạo và import schema
4. Port 5432 không bị conflict

Xem logs chi tiết khi chạy:
```bash
npm run dev
```

## 📝 License

ISC

## 👥 Author

Lakhe Management Team

---

**Cần hỗ trợ?** Liên hệ team development.

## Cấu trúc thư mục Quản lý - Accountants

frontend/
├── public/                        # Tài nguyên công khai (HTML, manifest, robots)
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/                           # Mã nguồn chính
│   ├── App.js
│   ├── index.js
│   ├── index.css
│   ├── assets/                    # Hình ảnh, icon, font
│   ├── components/                # Các component tái sử dụng
│   │   ├── common/                # Component dùng chung
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Header/
│   │   │   ├── Input/
│   │   │   ├── Layout/
│   │   │   ├── Loading/
│   │   │   ├── Modal/
│   │   │   ├── Sidebar/
│   │   │   └── Table/
│   │   ├── Dashboard/
│   │   │   ├── DashboardContent.css
│   │   │   └── DashboardContent.js
│   │   └── forms/
│   │       ├── CreateFeeForm.js
│   │       ├── Form.css
│   │       └── Paymentform.js
│   ├── context/                   # React Context (quản lý state toàn cục)
│   ├── data/                      # Mock data dùng thử
│   │   └── mockData.js
│   ├── hooks/                     # Custom React hooks
│   ├── pages/                     # Các trang chính của ứng dụng
│   │   ├── FeeDetails.css
│   │   ├── FeeDetails.js
│   │   └── TestAccountantDashboard.js
│   ├── services/                  # Các service gọi API
│   ├── styles/                    # Style CSS toàn cục
│   └── utils/                     # Các hàm tiện ích
├── package.json                   # Cấu hình dependencies
└── README.md                      # Tài liệu dự án
```
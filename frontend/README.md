## Cấu trúc thư mục Quản lý - Accountants
frontend/
├── public/                          // Thư mục tài nguyên công khai
│   ├── index.html                   // File HTML chính
│   ├── manifest.json               // Cấu hình PWA
│   └── robots.txt                  // Cấu hình cho search engine
├── src/                            // Thư mục mã nguồn chính
│   ├── components/                 // Các component tái sử dụng
│   │   ├── common/                 // Component dùng chung toàn dự án
│   │   │   ├── Header/             // Thanh header/navigation
│   │   │   │   ├── Header.js       // Component header chính
│   │   │   │   └── Header.css      // Style cho header
│   │   │   ├── Sidebar/            // Thanh menu bên
│   │   │   │   ├── Sidebar.js      // Component sidebar
│   │   │   │   └── Sidebar.css     // Style cho sidebar
│   │   │   ├── Layout/             // Layout tổng thể
│   │   │   │   ├── Layout.js       // Component layout chính
│   │   │   │   └── Layout.css      // Style cho layout
│   │   │   ├── Button/             // Nút bấm tái sử dụng
│   │   │   ├── Modal/              // Popup/modal
│   │   │   ├── Loading/            // Hiệu ứng loading
│   │   │   ├── Table/              // Bảng dữ liệu
│   │   │   └── Card/               // Thẻ hiển thị thông tin
│   │   ├── forms/                  // Các component form
│   │   │   ├── HouseholdForm/      // Form quản lý hộ khẩu
│   │   │   ├── PersonForm/         // Form quản lý nhân khẩu
│   │   │   └── FeeForm/            // Form quản lý phí
│   │   ├── charts/                 // Các component biểu đồ
│   │   |   ├── PieChart/           // Biểu đồ tròn
│   │   |   └── BarChart/           // Biểu đồ cột
|   |   └── Dashboard/
|   |       ├── DashboardContent.css
|   |       └── DashboardContent.js
│   ├── pages/                      // Các trang chính của ứng dụng
│   │   ├── Admin/                  // Trang dành cho Admin
│   │   │   ├── Dashboard/          // Trang tổng quan admin
│   │   │   │   ├── Dashboard.js    // Component dashboard admin
│   │   │   │   └── Dashboard.css   // Style cho dashboard admin
│   │   │   ├── HouseholdManagement/ // Quản lý hộ khẩu
│   │   │   │   ├── HouseholdList.js     // Danh sách hộ khẩu
│   │   │   │   ├── HouseholdDetail.js   // Chi tiết hộ khẩu
│   │   │   │   └── HouseholdManagement.css
│   │   │   ├── PersonManagement/   // Quản lý nhân khẩu
│   │   │   ├── FormManagement/     // Quản lý các loại form
│   │   │   └── Reports/            // Báo cáo thống kê
│   │   ├── Accountant/             // Trang dành cho Kế toán
│   │   │   ├── FeeManagement/      // Quản lý phí
│   │   │   ├── PaymentTracking/    // Theo dõi thanh toán
│   │   │   └── FinancialReports/   // Báo cáo tài chính
│   │   ├── Resident/               // Trang dành cho Cư dân
│   │   │   ├── Profile/            // Hồ sơ cá nhân
│   │   │   ├── FeeHistory/         // Lịch sử phí
│   │   │   └── Forms/              // Các form đơn từ
│   │   └── Auth/                   // Trang xác thực
│   │       ├── Login/              // Trang đăng nhập
│   │       │   ├── Login.js        // Component đăng nhập
│   │       │   └── Login.css       // Style đăng nhập
│   │       ├── Register/           // Trang đăng ký
│   │       └── ForgotPassword/     // Quên mật khẩu
│   ├── services/                   // Các service gọi API
│   │   ├── api.js                  // Service API chung
│   │   ├── authService.js          // Service xác thực
│   │   ├── householdService.js     // Service hộ khẩu
│   │   ├── personService.js        // Service nhân khẩu
│   │   └── feeService.js           // Service phí
│   ├── utils/                      // Các hàm tiện ích
│   │   ├── constants.js            // Hằng số dự án
│   │   ├── helpers.js              // Hàm hỗ trợ chung
│   │   ├── validators.js           // Hàm validate form
│   │   ├── formatters.js           // Hàm format dữ liệu
│   │   └── dateHelpers.js          // Hàm xử lý ngày tháng
│   ├── hooks/                      // Custom React hooks
│   │   ├── useAuth.js              // Hook xác thực
│   │   ├── useApi.js               // Hook gọi API
│   │   ├── useForm.js              // Hook quản lý form
│   │   └── useLocalStorage.js      // Hook local storage
│   ├── context/                    // React Context (quản lý state toàn cục)
│   │   ├── AuthContext.js          // Context xác thực
│   │   ├── ThemeContext.js         // Context theme
│   │   └── AppContext.js           // Context chung app
│   ├── styles/                     // Style CSS toàn cục
│   │   ├── globals.css             // Style toàn cục
│   │   ├── variables.css           // Biến CSS (màu sắc, font...)
│   │   ├── components.css          // Style component chung
│   │   └── responsive.css          // Style responsive
│   ├── assets/                     // Tài nguyên tĩnh
│   │   ├── images/                 // Hình ảnh
│   │   │   ├── logos/              // Logo
│   │   │   ├── avatars/            // Avatar mặc định
│   │   │   └── illustrations/      // Hình minh họa
│   │   ├── icons/                  // Icon SVG
│   │   └── fonts/                  // Font chữ
│   ├── App.js                      // Component App chính
│   ├── index.js                    // File khởi động React
│   └── index.css                   // Style cơ bản
├── package.json                    // Cấu hình dependencies
└── README.md                       // Tài liệu dự án
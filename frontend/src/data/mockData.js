// Mock data cho các đợt thu
export const feeData = [
  {
    id: 1,
    title: 'Thu phí bảo kê năm 2025',
    status: 'pending',
    statusText: 'BẮT BUỘC',
    collected: 350,
    total: 400,
    totalAmount: '1 950 000 VND',
    totalCollected: '1 950 000 VND',
    expectedTotal: '3 000 000 VND',
    paidHouseholds: 150,
    unpaidHouseholds: 250,
    deadline: '30/11/2025',
    color: 'red'
  },
  {
    id: 2,
    title: 'Quyên góp đồng bào lũ lụt',
    status: 'voluntary',
    statusText: 'TỰ NGUYỆN',
    collected: 250,
    total: 400,
    totalAmount: '5 000 000 VND',
    totalCollected: '5 000 000 VND',
    expectedTotal: '8 000 000 VND',
    paidHouseholds: 250,
    unpaidHouseholds: 150,
    deadline: '11/12/2025',
    color: 'green'
  },
  {
    id: 3,
    title: 'Thu thuế người già và trẻ em',
    status: 'pending',
    statusText: 'BẮT BUỘC',
    collected: 250,
    total: 400,
    totalAmount: '10 000 000 VND',
    totalCollected: '10 000 000 VND',
    expectedTotal: '15 000 000 VND',
    paidHouseholds: 180,
    unpaidHouseholds: 220,
    deadline: '19/11/2025',
    color: 'red'
  },
  {
    id: 4,
    title: 'Thu thế người em và trẻ già',
    status: 'pending',
    statusText: 'BẮT BUỘC',
    collected: 120,
    total: 400,
    totalAmount: '8 500 000 VND',
    totalCollected: '8 500 000 VND',
    expectedTotal: '12 000 000 VND',
    paidHouseholds: 120,
    unpaidHouseholds: 280,
    deadline: '19/11/2025',
    color: 'red'
  }
];

export const existedFeeData = [
  {
    id: 5,
    title: 'Thu phí bảo kê năm 2024',
    status: 'pending',
    statusText: 'BẮT BUỘC',
    collected: 350,
    total: 400,
    totalAmount: '3600 USD',
    totalCollected: '2 000 000 VND',
    expectedTotal: '3 500 000 VND',
    paidHouseholds: 300,
    unpaidHouseholds: 100,
    deadline: '30/11/2024',
    color: 'red'
  },
  {
    id: 6,
    title: 'Thu thuế viện dưỡng lão',
    status: 'voluntary',
    statusText: 'TỰ NGUYỆN',
    collected: 250,
    total: 400,
    totalAmount: '6 000 000 VND',
    totalCollected: '6 000 000 VND',
    expectedTotal: '10 000 000 VND',
    paidHouseholds: 200,
    unpaidHouseholds: 200,
    deadline: '11/12/2024',
    color: 'green'
  },
  {
    id: 7,
    title: 'Thu thuế người già và trẻ em',
    status: 'pending',
    statusText: 'BẮT BUỘC',
    collected: 250,
    total: 400,
    totalAmount: '12 000 000 VND',
    totalCollected: '12 000 000 VND',
    expectedTotal: '18 000 000 VND',
    paidHouseholds: 280,
    unpaidHouseholds: 120,
    deadline: '19/11/2024',
    color: 'red'
  }
];

// Mock data cho household (hộ gia đình) - mỗi đợt thu sẽ có dữ liệu riêng
export const householdDataByFee = {
  1: [ // Thu phí bảo kê năm 2025
    {
      householdNumber: 'H001',
      ownerName: 'Nguyễn Minh Quân',
      location: 'Quốc Oai',
      members: 4,
      amount: '120 USD',
      status: 'paid',
      deadline: '11/11/2025'
    },
    {
      householdNumber: 'H002',
      ownerName: 'Đặng Hoàng Quân',
      location: 'Hà Đông',
      members: 4,
      amount: '120 USD',
      status: 'paid',
      deadline: '12/11/2025'
    },
    {
      householdNumber: 'H003',
      ownerName: 'Đinh Văn Phạm Việt',
      location: 'Đan Phượng',
      members: 4,
      amount: '120 USD',
      status: 'unpaid',
      deadline: ''
    },
    {
      householdNumber: 'H004',
      ownerName: 'Nguyễn Minh Quân',
      location: 'Đan Phượng',
      members: 3,
      amount: '90 USD',
      status: 'paid',
      deadline: '12/11/2025'
    },
    {
      householdNumber: 'H005',
      ownerName: 'Nguyễn Nhật Minh',
      location: 'Mỹ Đình',
      members: 2,
      amount: '60 USD',
      status: 'unpaid',
      deadline: ''
    },
    {
      householdNumber: 'H006',
      ownerName: 'Tạ Hải Tùng',
      location: 'Torino, Italia',
      members: 2,
      amount: '60 USD',
      status: 'paid',
      deadline: '12/11/2025'
    },
    {
      householdNumber: 'H007',
      ownerName: 'Trịnh Văn Chiến',
      location: 'Hàn Quốc',
      members: 2,
      amount: '60 USD',
      status: 'paid',
      deadline: '12/11/2025'
    },
    {
      householdNumber: 'H008',
      ownerName: 'Trần Thế Hùng',
      location: 'Mỹ',
      members: 2,
      amount: '60 USD',
      status: 'unpaid',
      deadline: ''
    }
  ],
  2: [ // Quyên góp đồng bào lũ lụt
    {
      householdNumber: 'H001',
      ownerName: 'Trần Văn An',
      location: 'Hà Nội',
      members: 5,
      amount: '200 USD',
      status: 'paid',
      deadline: '10/12/2025'
    },
    {
      householdNumber: 'H002',
      ownerName: 'Lê Thị Bình',
      location: 'Hải Phòng',
      members: 3,
      amount: '150 USD',
      status: 'unpaid',
      deadline: ''
    }
  ]
  // Thêm dữ liệu cho các đợt thu khác tương tự...
};
export const statData = [
  {
    title: "Tổng số hộ khẩu",
    value: "7,265",
    change: "+11.01%",
    isPositive: true,
  },
  {
    title: "Tổng số nhân khẩu",
    value: "3,671",
    change: "-0.03%",
    isPositive: false,
  },
  {
    title: "Số nhân khẩu tạm trú",
    value: "156",
    change: "+15.03%",
    isPositive: true,
  },
  {
    title: "Số nhân khẩu tạm vắng",
    value: "2,318",
    change: "+6.08%",
    isPositive: true,
  },
];

export const populationData = [
  { name: "Tháng 1", total: 20, temp: 10 },
  { name: "Tháng 2", total: 25, temp: 15 },
  { name: "Tháng 3", total: 48, temp: 60 },
  { name: "Tháng 4", total: 30, temp: 30 },
  { name: "Tháng 5", total: 40, temp: 40 },
  { name: "Tháng 6", total: 60, temp: 70 },
  { name: "Tháng 12", total: 10, temp: 30 },
];

export const ageData = [
  { name: "Mầm non", value: 35, fill: "#9ba6fa" },
  { name: "Cấp 1", value: 60, fill: "#5ce1e6" },
  { name: "Cấp 2", value: 42, fill: "#000000" },
  { name: "Cấp 3", value: 62, fill: "#74b9ff" },
  { name: "Lao động", value: 68, fill: "#c4a6fa" },
  { name: "Nghỉ hưu", value: 50, fill: "#55efc4" },
];

export const genderData = [
  { name: "Nam", value: 70 },
  { name: "Nữ", value: 30 },
];

export const householdData = [
  {
    id: 1,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 10, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 1, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 2, name: "Đinh Thị Kim Chi", relation: "Vợ" },
      { id: 3, name: "Đinh Văn A", relation: "Con" },    ],
  },
  {
    id: 2,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 4, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 5, name: "Đinh Thị Lan", relation: "Vợ" },
      { id: 6, name: "Đinh Thị B", relation: "Con" },
    ],
  },
  {
    id: 3,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 7, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 8, name: "Đinh Thị C", relation: "Vợ" },
      { id: 9, name: "Đinh Văn C", relation: "Con" },
    ],
  },
  {
    id: 4,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 10, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 11, name: "Đinh Thị D", relation: "Vợ" },
      { id: 12, name: "Đinh Văn D", relation: "Con" },
    ],
  },
  {
    id: 5,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 13, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 14, name: "Đinh Thị E", relation: "Vợ" },
      { id: 15, name: "Đinh Văn E", relation: "Con" },
    ],
  },
  {
    id: 6,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 16, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 17, name: "Đinh Thị F", relation: "Vợ" },
      { id: 18, name: "Đinh Văn F", relation: "Con" },
    ],
  },
  {
    id: 7,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 19, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 20, name: "Đinh Thị G", relation: "Vợ" },
      { id: 21, name: "Đinh Văn G", relation: "Con" },
    ],
  },
  {
    id: 8,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 22, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 23, name: "Đinh Thị H", relation: "Vợ" },
      { id: 24, name: "Đinh Văn H", relation: "Con" },
    ],
  },
  {
    id: 9,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 25, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 26, name: "Đinh Thị I", relation: "Vợ" },
      { id: 27, name: "Đinh Văn I", relation: "Con" },
    ],
  },

  {
    id: 10,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 28, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 29, name: "Đinh Thị J", relation: "Vợ" },
      { id: 30, name: "Đinh Văn J", relation: "Con" },
    ],
  },
  {
    id: 11,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 31, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 32, name: "Đinh Thị K", relation: "Vợ" },
      { id: 33, name: "Đinh Văn K", relation: "Con" },
    ],
  },
  {
    id: 12,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 34, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 35, name: "Đinh Thị L", relation: "Vợ" },
      { id: 36, name: "Đinh Văn L", relation: "Con" },
    ],
  },
  {
    id: 13,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 37, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 38, name: "Đinh Thị M", relation: "Vợ" },
      { id: 39, name: "Đinh Văn M", relation: "Con" },
    ],
  },
  {
    id: 14,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 40, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 41, name: "Đinh Thị N", relation: "Vợ" },
      { id: 42, name: "Đinh Văn N", relation: "Con" },
    ],
  },
  {
    id: 15,
    code: "09123456",
    owner: "Đinh Văn Phạm Việt",
    address: "Số 12, ngõ 50...",
    members: 3,
    memberDetails: [
      { id: 43, name: "Đinh Văn Phạm Việt", relation: "Chủ hộ" },
      { id: 44, name: "Đinh Thị O", relation: "Vợ" },
      { id: 45, name: "Đinh Văn O", relation: "Con" },
    ],
  }
];


export const HouseholdDetailData = {
  id: 1,
  code: "HK123456",
  owner: "Nguyễn Văn A",
  address: "Hà Nội",
  members: [
    { id: 10, name: "Nguyễn Văn A", relation: "Chủ hộ" },
    { id: 11, name: "Nguyễn Văn B", relation: "Con" },
    { id: 12, name: "Nguyễn Thị C", relation: "Vợ" },
    { id: 13, name: "Nguyễn Văn D", relation: "Con" },
    { id: 14, name: "Nguyễn Thị E", relation: "Con" },
  ]
};

export const householdTemporaryData = [
  {
    id: 101,
    code: "TT001",
    owner: "Trần Văn Minh",
    address: "Số 5, ngõ 10...",
    members: 3,
    memberDetails: [
      { id: 101, name: "Trần Văn Minh", relation: "Chủ hộ" },
      { id: 102, name: "Trần Thị Hương", relation: "Vợ" },
      { id: 103, name: "Trần Văn Hùng", relation: "Con" },
    ],
  },
  {
    id: 102,
    code: "TT002",
    owner: "Phạm Thị Hồng",
    address: "Số 8, ngõ 15...",
    members: 2,
    memberDetails: [
      { id: 104, name: "Phạm Thị Hồng", relation: "Chủ hộ" },
      { id: 105, name: "Phạm Văn Nam", relation: "Con" },
    ],
  },
  {
    id: 103,
    code: "TT003",
    owner: "Hoàng Văn Sơn",
    address: "Số 12, ngõ 20...",
    members: 4,
    memberDetails: [
      { id: 106, name: "Hoàng Văn Sơn", relation: "Chủ hộ" },
      { id: 107, name: "Hoàng Thị Liên", relation: "Vợ" },
      { id: 108, name: "Hoàng Văn Tùng", relation: "Con" },
      { id: 109, name: "Hoàng Thị Yến", relation: "Con" },
    ],
  },
  {
    id: 104,
    code: "TT004",
    owner: "Lê Văn Hải",
    address: "Số 15, ngõ 25...",
    members: 3,
    memberDetails: [
      { id: 110, name: "Lê Văn Hải", relation: "Chủ hộ" },
      { id: 111, name: "Lê Thị Mai", relation: "Vợ" },
      { id: 112, name: "Lê Văn An", relation: "Con" },
    ],
  },
  {
    id: 105,
    code: "TT005",
    owner: "Vũ Thị Lan",
    address: "Số 20, ngõ 30...",
    members: 2,
    memberDetails: [
      { id: 113, name: "Vũ Thị Lan", relation: "Chủ hộ" },
      { id: 114, name: "Vũ Văn Kiên", relation: "Con" },
    ],
  },
];




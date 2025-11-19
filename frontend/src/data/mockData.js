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
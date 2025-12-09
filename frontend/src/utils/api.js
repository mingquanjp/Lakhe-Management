// API Base URL
const API_BASE_URL = "http://localhost:5000";

// Login API call
export const loginAPI = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Đăng nhập thất bại");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Store auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem("token", token);
};

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem("token");
};

// Store user info in localStorage
export const setUserInfo = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

// Get user info from localStorage
export const getUserInfo = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Dashboard API calls
export const getDashboardStats = async (startDate, endDate) => {
  try {
    const token = getAuthToken();
    const queryParams = new URLSearchParams({
      startDate: startDate || "",
      endDate: endDate || "",
    }).toString();

    const response = await fetch(
      `${API_BASE_URL}/api/dashboard/population?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy dữ liệu thống kê");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Remove user info from localStorage
export const removeUserInfo = () => {
  localStorage.removeItem("user");
};

// Clear all auth data
export const clearAuthData = () => {
  removeAuthToken();
  removeUserInfo();
};


export const fetchHouseholds = async () => {
  const token = getAuthToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/households`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy danh sách hộ khẩu');
    }

    return data; 
  } catch (error) {
    throw error;
  }
};

export const createHousehold = async (householdData) => {
  const token = getAuthToken();
  try {
    const response = await fetch(`${API_BASE_URL}/api/households`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(householdData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tạo hộ khẩu');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteHousehold = async (id) => {
  const token = getAuthToken();
  try {
    const response = await fetch(`${API_BASE_URL}/api/households/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchResidents = async (householdId) => {
  const token = getAuthToken();
  // Nếu có householdId thì thêm vào đường dẫn query
  const url = householdId 
    ? `${API_BASE_URL}/api/residents?household_id=${householdId}`
    : `${API_BASE_URL}/api/residents`;
    
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (error) {
    throw error;
  }
};

export const splitHousehold = async (data) => {
  const token = getAuthToken();
  try {
    const response = await fetch(`${API_BASE_URL}/api/households/split`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) throw new Error(resData.message);
    return resData;
  } catch (error) {
    throw error;
  }
};


// Finance API calls
export const getFees = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/finance/fees`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy danh sách khoản thu");
    }
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: error.message };
  }
};

export const getFinanceStats = async (feeId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/finance/stats/${feeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || "Không thể lấy dữ liệu thống kê tài chính"
      );
    }
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: error.message };
  }
};

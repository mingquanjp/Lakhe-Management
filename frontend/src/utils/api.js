// API Base URL
const API_BASE_URL = 'http://localhost:5000';

// Login API call
export const loginAPI = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Store auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// Store user info in localStorage
export const setUserInfo = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Get user info from localStorage
export const getUserInfo = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Remove user info from localStorage
export const removeUserInfo = () => {
  localStorage.removeItem('user');
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

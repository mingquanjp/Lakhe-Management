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

export const fetchOverviewStats = async () => {
  const token = getAuthToken(); 
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy dữ liệu thống kê');
    }

    return data; 
  } catch (error) {
    throw error;
  }
};


export const fetchTemporaryHouseholds = async (searchTerm = '') => {
  const token = getAuthToken();
  
  let url = `${API_BASE_URL}/api/households/temporary`;
  if (searchTerm) {
    url += `?search=${encodeURIComponent(searchTerm)}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy danh sách tạm trú');
    }

    return data; 
  } catch (error) {
    throw error;
  }
};

export const fetchTemporaryHouseholdDetail = async (id) => {
  const token = getAuthToken();
  try {
    const response = await fetch(`${API_BASE_URL}/api/households/temporary/${id}`, {
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

export const createTemporaryHousehold = async (data) => {
  const token = getAuthToken();
  try {
    const response = await fetch(`${API_BASE_URL}/api/households/temporary`, {
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

export const fetchOverview = async () => {
  const token = getAuthToken();
  try {
    const response = await fetch(`${API_BASE_URL}/api/overview`, {
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

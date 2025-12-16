import { getAuthToken } from '../utils/api';
const API_BASE_URL = 'http://localhost:5000';
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};
export const getAllHouseholds = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/households`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy danh sách hộ khẩu');
    }

    return data;
  } catch (error) {
    console.error('Error fetching households:', error);
    throw error;
  }
};
export const getHouseholdById = async (householdId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/households/${householdId}`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy thông tin hộ khẩu');
    }

    return data;
  } catch (error) {
    console.error('Error fetching household:', error);
    throw error;
  }
};

/**
 * Tạo hộ khẩu mới
 * POST /api/households
 */
export const createHousehold = async (householdData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/households`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(householdData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tạo hộ khẩu');
    }

    return data;
  } catch (error) {
    console.error('Error creating household:', error);
    throw error;
  }
};

/**
 * Cập nhật hộ khẩu
 * PUT /api/households/:householdId
 */
export const updateHousehold = async (householdId, householdData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/households/${householdId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(householdData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi cập nhật hộ khẩu');
    }

    return data;
  } catch (error) {
    console.error('Error updating household:', error);
    throw error;
  }
};

/**
 * Xóa hộ khẩu
 * DELETE /api/households/:householdId
 */
export const deleteHousehold = async (householdId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/households/${householdId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi xóa hộ khẩu');
    }

    return data;
  } catch (error) {
    console.error('Error deleting household:', error);
    throw error;
  }
};
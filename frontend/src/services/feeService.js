import { getAuthToken } from '../utils/api';
const API_BASE_URL = 'http://localhost:5000';

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};
export const getAllFees = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fees`, {
      method: 'GET',
      headers: getHeaders()
    });
    // Kiểm tra response trước khi parse JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server không trả về JSON. Có thể backend chưa chạy hoặc chưa đăng nhập.');
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy danh sách khoản thu');
    }
    return data;
  } catch (error) {
    console.error('Error fetching fees:', error);
    throw error;
  }
};
/**
 * Lấy chi tiết một khoản thu
 * GET /api/fees/:feeId
 */
export const getFeeById = async (feeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fees/${feeId}`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy thông tin khoản thu');
    }

    return data;
  } catch (error) {
    console.error('Error fetching fee:', error);
    throw error;
  }
};

/**
 * Tạo khoản thu mới 
 * POST /api/fees
 */
export const createFee = async (feeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(feeData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi tạo khoản thu');
    }

    return data;
  } catch (error) {
    console.error('Error creating fee:', error);
    throw error;
  }
};

/**
 * Cập nhật khoản thu (Admin only)
 * PUT /api/fees/:feeId
 */
export const updateFee = async (feeId, feeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fees/${feeId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(feeData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi cập nhật khoản thu');
    }

    return data;
  } catch (error) {
    console.error('Error updating fee:', error);
    throw error;
  }
};

/**
 * Xóa khoản thu (Admin only)
 * DELETE /api/fees/:feeId
 */
export const deleteFee = async (feeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fees/${feeId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi xóa khoản thu');
    }

    return data;
  } catch (error) {
    console.error('Error deleting fee:', error);
    throw error;
  }
};

/**
 * Lấy danh sách hộ chưa đóng tiền
 * GET /api/fees/:feeId/unpaid-households
 */
export const getUnpaidHouseholds = async (feeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fees/${feeId}/unpaid-households`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy danh sách hộ chưa đóng');
    }

    return data;
  } catch (error) {
    console.error('Error fetching unpaid households:', error);
    throw error;
  }
};

/**
 * Lấy tổng hợp thống kê khoản thu
 * GET /api/fees/:feeId/summary
 */
export const getFeeSummary = async (feeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fees/${feeId}/summary`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy tổng hợp khoản thu');
    }

    return data;
  } catch (error) {
    console.error('Error fetching fee summary:', error);
    throw error;
  }
};

// ==================== QUẢN LÝ THANH TOÁN ====================

/**
 * Ghi nhận thanh toán
 * POST /api/payments
 */
export const createPayment = async (paymentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fees/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi ghi nhận thanh toán');
    }

    return data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};
/**
 * Cập nhật thông tin thanh toán
 * PUT /api/fees/payments/:paymentId
 */
export const updatePayment = async (paymentId, paymentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fees/payments/${paymentId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi cập nhật thanh toán');
    }

    return data;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

/**
 * Xóa thanh toán (nếu cần)
 * DELETE /api/fees/payments/:paymentId
 */
export const deletePayment = async (paymentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fees/payments/${paymentId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi xóa thanh toán');
    }

    return data;
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};
/**
 * Lấy lịch sử thanh toán của một hộ khẩu
 * GET /api/payments/household/:householdId
 */
export const getHouseholdPaymentHistory = async (householdId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/household/${householdId}`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi khi lấy lịch sử thanh toán');
    }

    return data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

/**
 * Lấy tất cả hộ (cả đã nộp và chưa nộp) cho một khoản thu
 * GET /api/fees/:feeId/all-households
 */
export const getAllHouseholdsForFee = async (feeId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/fees/${feeId}/all-households`, { // ← SỬA: THÊM /api
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Kiểm tra content-type trước khi parse JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Response is not JSON:', text);
      throw new Error('Server không trả về JSON. Có thể endpoint chưa được cấu hình đúng.');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch households');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching all households:', error);
    throw error;
  }
};
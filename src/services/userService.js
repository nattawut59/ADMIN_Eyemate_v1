// src/services/userService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// สร้าง axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ===================== USER MANAGEMENT APIs =====================

/**
 * ดูรายการผู้ใช้ทั้งหมด
 */
export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get('/users', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' };
  }
};

/**
 * ดูรายละเอียดผู้ใช้
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' };
  }
};

/**
 * สร้างผู้ใช้ใหม่
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' };
  }
};

/**
 * แก้ไขข้อมูลผู้ใช้
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้' };
  }
};

/**
 * เปลี่ยนสถานะผู้ใช้
 */
export const updateUserStatus = async (userId, status) => {
  try {
    const response = await api.patch(`/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้ใช้' };
  }
};

/**
 * รีเซ็ตรหัสผ่านผู้ใช้
 */
export const resetUserPassword = async (userId, newPassword) => {
  try {
    const response = await api.post(`/users/${userId}/reset-password`, { newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' };
  }
};

/**
 * ลบผู้ใช้
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'เกิดข้อผิดพลาดในการลบผู้ใช้' };
  }
};

/**
 * ดูสถิติผู้ใช้
 */
export const getUserStatistics = async () => {
  try {
    const response = await api.get('/users/statistics');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'เกิดข้อผิดพลาดในการดึงสถิติผู้ใช้' };
  }
};

const userService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  resetUserPassword,
  deleteUser,
  getUserStatistics,
};

export default userService;
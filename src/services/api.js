import axios from 'axios';

// Base URL จาก environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// สร้าง axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - เพิ่ม token ทุก request (ถ้ามี)
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

// Response interceptor - จัดการ error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token หมดอายุ - ลบ token และ redirect ไป login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

/**
 * Admin Login
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise}
 */
export const adminLogin = async (username, password) => {
  try {
    const response = await api.post('/api/auth/admin/login', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
  }
};

/**
 * Verify Token
 * @returns {Promise}
 */
export const verifyToken = async () => {
  try {
    const response = await api.get('/api/auth/verify');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Token ไม่ถูกต้อง' };
  }
};

/**
 * Get Dashboard Statistics
 * @returns {Promise}
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' };
  }
};

/**
 * Get Recent Activities
 * @returns {Promise}
 */
export const getRecentActivities = async () => {
  try {
    const response = await api.get('/api/dashboard/activities');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม' };
  }
};

// ==================== MEDICINES ====================

/**
 * ดึงรายการยาทั้งหมด
 */
export const getAllMedicines = async (params = {}) => {
  try {
    const response = await api.get('/api/medicines', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMedicineById = async (medicineId) => {
  try {
    const response = await api.get(`/api/medicines/${medicineId}`);  // ✅ เพิ่ม /api
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createMedicine = async (medicineData) => {
  try {
    const response = await api.post('/api/medicines', medicineData);  // ✅ เพิ่ม /api
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMedicine = async (medicineId, medicineData) => {
  try {
    const response = await api.put(`/api/medicines/${medicineId}`, medicineData);  // ✅ เพิ่ม /api
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMedicine = async (medicineId) => {
  try {
    const response = await api.delete(`/api/medicines/${medicineId}`);  // ✅ เพิ่ม /api
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const permanentDeleteMedicine = async (medicineId) => {
  try {
    const response = await api.delete(`/api/medicines/${medicineId}/permanent`);  // ✅ เพิ่ม /api
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== APPOINTMENTS ====================

/**
 * ดึงรายการคำขอเลื่อนนัดทั้งหมด
 */
export const getAllChangeRequests = async (params = {}) => {
  try {
    const response = await api.get('/api/appointments/change-requests', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * ดึงสถิติคำขอเลื่อนนัด
 */
export const getChangeRequestStatistics = async () => {
  try {
    const response = await api.get('/api/appointments/change-requests/statistics/overview');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * ดูรายละเอียดคำขอเลื่อนนัดตาม ID
 */
export const getChangeRequestById = async (requestId) => {
  try {
    const response = await api.get(`/api/appointments/change-requests/${requestId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * อนุมัติคำขอเลื่อนนัด
 */
export const approveChangeRequest = async (requestId, adminNotes = null) => {
  try {
    const response = await api.post(
      `/api/appointments/change-requests/${requestId}/approve`,
      { admin_notes: adminNotes }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * ปฏิเสธคำขอเลื่อนนัด
 */
export const rejectChangeRequest = async (requestId, adminNotes) => {
  try {
    const response = await api.post(
      `/api/appointments/change-requests/${requestId}/reject`,
      { admin_notes: adminNotes }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== SPECIAL TESTS (PDF MANAGEMENT) ====================

/**
 * Get all special tests with filters
 * @param {Object} params - { page, limit, search, test_type, start_date, end_date }
 * @returns {Promise}
 */
export const getSpecialTests = async (params = {}) => {
  try {
    const response = await api.get('/api/special-tests', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'ไม่สามารถโหลดข้อมูลได้' };
  }
};

/**
 * Upload special test PDF
 * @param {FormData} formData - Form data containing file and test info
 * @returns {Promise}
 */
export const uploadSpecialTest = async (formData) => {
  try {
    // ใช้ axios instance แต่ไม่ต้องกำหนด Content-Type (axios จะจัดการ multipart/form-data เอง)
    const response = await api.post('/api/special-tests/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'ไม่สามารถอัปโหลดได้' };
  }
};

/**
 * Delete special test
 * @param {string} testId 
 * @returns {Promise}
 */
export const deleteSpecialTest = async (testId) => {
  try {
    const response = await api.delete(`/api/special-tests/${testId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'ไม่สามารถลบได้' };
  }
};

/**
 * Update special test
 * @param {string} testId 
 * @param {Object} data - { doctor_id, test_date, test_type, eye, notes }
 * @returns {Promise}
 */
export const updateSpecialTest = async (testId, data) => {
  try {
    const response = await api.put(`/api/special-tests/${testId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'ไม่สามารถแก้ไขได้' };
  }
};

/**
 * Download special test PDF
 * @param {string} testId 
 * @returns {Promise}
 */
export const downloadSpecialTest = async (testId) => {
  try {
    const response = await api.get(`/api/special-tests/${testId}/download`, {
      responseType: 'blob', // สำคัญ! ต้องเป็น blob
    });
    
    // Create blob and download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `test_report_${testId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  } catch (error) {
    throw error.response?.data || { message: 'ไม่สามารถดาวน์โหลดได้' };
  }
};

/**
 * Get special test by ID
 * @param {string} testId 
 * @returns {Promise}
 */
export const getSpecialTestById = async (testId) => {
  try {
    const response = await api.get(`/api/special-tests/${testId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'ไม่สามารถโหลดข้อมูลได้' };
  }
};

/**
 * Get patients list for dropdown
 * @returns {Promise}
 */
export const getPatientsList = async () => {
  try {
    const response = await api.get('/api/special-tests/patients/list');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'ไม่สามารถโหลดรายชื่อผู้ป่วยได้' };
  }
};

/**
 * Get doctors list for dropdown
 * @returns {Promise}
 */
export const getDoctorsList = async () => {
  try {
    const response = await api.get('/api/special-tests/doctors/list');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'ไม่สามารถโหลดรายชื่อแพทย์ได้' };
  }
};

// Dashboard APIs
export const getPendingTasks = async () => {
  const response = await api.get('/api/dashboard/pending-tasks');  
  return response.data;
};

export const getRecentPatients = async () => {
  const response = await api.get('/api/dashboard/recent-patients');  
  return response.data;
};

export default api;
// ✅ import api จาก api.js
import api from './api';

/**
 * =============================================
 * Support Tickets API Service
 * =============================================
 */

// ดูรายการ tickets ทั้งหมด
export const getAllTickets = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.category) queryParams.append('category', params.category);
    if (params.assigned_to) queryParams.append('assigned_to', params.assigned_to);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    // ✅ ใช้ api จาก api.js (มี baseURL + /api อยู่แล้ว)
    const response = await api.get(`/api/tickets?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tickets:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// ดูรายละเอียด ticket
export const getTicketById = async (ticketId) => {
  try {
    const response = await api.get(`/api/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    throw error;
  }
};

// รับเคส (Assign to self)
export const assignTicket = async (ticketId) => {
  try {
    const response = await api.post(`/api/tickets/${ticketId}/assign`);
    return response.data;
  } catch (error) {
    console.error('Error assigning ticket:', error);
    throw error;
  }
};

// ตอบกลับ ticket
export const replyToTicket = async (ticketId, data) => {
  try {
    const response = await api.post(`/api/tickets/${ticketId}/reply`, data);
    return response.data;
  } catch (error) {
    console.error('Error replying to ticket:', error);
    throw error;
  }
};

// เปลี่ยนสถานะ
export const updateTicketStatus = async (ticketId, data) => {
  try {
    const response = await api.patch(`/api/tickets/${ticketId}/status`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
};

// เปลี่ยนความสำคัญ
export const updateTicketPriority = async (ticketId, data) => {
  try {
    const response = await api.patch(`/api/tickets/${ticketId}/priority`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating ticket priority:', error);
    throw error;
  }
};

// โอนเคส
export const reassignTicket = async (ticketId, data) => {
  try {
    const response = await api.patch(`/api/tickets/${ticketId}/reassign`, data);
    return response.data;
  } catch (error) {
    console.error('Error reassigning ticket:', error);
    throw error;
  }
};

// สถิติ
export const getTicketStatistics = async (period = 30) => {
  try {
    const response = await api.get(`/api/tickets/statistics?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket statistics:', error);
    throw error;
  }
};

/**
 * =============================================
 * FAQ Management APIs
 * =============================================
 */

// ดูรายการ FAQs
export const getAllFAQs = async () => {
  try {
    const response = await api.get('/api/faqs');
    return response.data;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw error;
  }
};

// สร้าง FAQ ใหม่
export const createFAQ = async (data) => {
  try {
    const response = await api.post('/api/faqs', data);
    return response.data;
  } catch (error) {
    console.error('Error creating FAQ:', error);
    throw error;
  }
};

// แก้ไข FAQ
export const updateFAQ = async (faqId, data) => {
  try {
    const response = await api.put(`/api/faqs/${faqId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating FAQ:', error);
    throw error;
  }
};

// ลบ FAQ
export const deleteFAQ = async (faqId) => {
  try {
    const response = await api.delete(`/api/faqs/${faqId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    throw error;
  }
};

// เรียงลำดับใหม่
export const reorderFAQs = async (updates) => {
  try {
    const response = await api.post('/api/faqs/reorder', { updates });
    return response.data;
  } catch (error) {
    console.error('Error reordering FAQs:', error);
    throw error;
  }
};
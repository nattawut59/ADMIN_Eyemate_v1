/**
 * =============================================
 * Ticket Helper Functions
 * =============================================
 */

// แปลงสถานะเป็นภาษาไทย
export const getStatusLabel = (status) => {
  const statusMap = {
    open: 'เปิดใหม่',
    in_progress: 'กำลังดำเนินการ',
    waiting_user: 'รอผู้ใช้ตอบกลับ',
    resolved: 'แก้ไขแล้ว',
    closed: 'ปิดเคส',
  };
  return statusMap[status] || status;
};

// สีของ status chip
export const getStatusColor = (status) => {
  const colorMap = {
    open: { bg: '#fef3c7', color: '#d97706' },
    in_progress: { bg: '#dbeafe', color: '#2563eb' },
    waiting_user: { bg: '#e9d5ff', color: '#9333ea' },
    resolved: { bg: '#dcfce7', color: '#16a34a' },
    closed: { bg: '#e2e8f0', color: '#64748b' },
  };
  return colorMap[status] || { bg: '#f1f5f9', color: '#475569' };
};

// แปลงความสำคัญเป็นภาษาไทย
export const getPriorityLabel = (priority) => {
  const priorityMap = {
    low: 'ต่ำ',
    medium: 'ปานกลาง',
    high: 'สูง',
    urgent: 'เร่งด่วน',
  };
  return priorityMap[priority] || priority;
};

// สีของ priority
export const getPriorityColor = (priority) => {
  const colorMap = {
    low: { bg: '#e2e8f0', color: '#64748b' },
    medium: { bg: '#fef3c7', color: '#d97706' },
    high: { bg: '#fed7aa', color: '#ea580c' },
    urgent: { bg: '#fee2e2', color: '#dc2626' },
  };
  return colorMap[priority] || { bg: '#f1f5f9', color: '#475569' };
};

// แปลงหมวดหมู่เป็นภาษาไทย
export const getCategoryLabel = (category) => {
  const categoryMap = {
    technical: 'ปัญหาทางเทคนิค',
    account: 'บัญชีผู้ใช้',
    appointment: 'นัดหมาย',
    medication: 'ยา',
    billing: 'ค่าใช้จ่าย',
    other: 'อื่นๆ',
  };
  return categoryMap[category] || category;
};

// แปลงเวลาเป็น "เมื่อกี้", "5 นาที", "2 ชั่วโมง"
export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'เมื่อสักครู่';
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays === 1) return 'เมื่อวานนี้';
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format วันที่แบบเต็ม
export const formatFullDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ไอคอนของหมวดหมู่
export const getCategoryIcon = (category) => {
  const iconMap = {
    technical: '⚙️',
    account: '👤',
    appointment: '📅',
    medication: '💊',
    billing: '💰',
    other: '❓',
  };
  return iconMap[category] || '📝';
};
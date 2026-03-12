// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    locale: 'th-TH'
  };
  
  return date.toLocaleDateString('th-TH', options);
};

// Format datetime
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const dateOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  };
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return `${date.toLocaleDateString('th-TH', dateOptions)} ${date.toLocaleTimeString('th-TH', timeOptions)}`;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
export const saveAuthData = (token, adminData) => {
  localStorage.setItem('adminToken', token);
  localStorage.setItem('adminData', JSON.stringify(adminData));
};

export const getAdminData = () => {
  const data = localStorage.getItem('adminData');
  return data ? JSON.parse(data) : null;
};

export const getToken = () => {
  return localStorage.getItem('adminToken');
};

export const isAuthenticated = () => {
  return !!getToken() || !!getAdminData();
};

export const clearAuthData = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminData');
};

export const logout = () => {
  clearAuthData();
  window.location.href = '/';
};
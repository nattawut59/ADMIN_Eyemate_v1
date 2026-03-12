import api from './api';

export const getMedicationAlerts = async () => {
  try {
    const response = await api.get('/api/admin/medication-reports/alerts');
    return response.data;
  } catch (error) {
    console.error('Error getting medication alerts:', error);
    throw error.response?.data || error;
  }
};

export const getAllPatientsAdherence = async (year, month, filters = {}) => {
  try {
    const params = { year, month, ...filters };
    const response = await api.get('/api/admin/medication-reports/patients/adherence', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting patients adherence:', error);
    throw error.response?.data || error;
  }
};

export const getPatientMonthlyReport = async (patientId, year, month) => {
  try {
    const params = { year, month };
    const response = await api.get(`/api/admin/medication-reports/patient/${patientId}/monthly`, { params });
    return response.data;
  } catch (error) {
    console.error('Error getting patient monthly report:', error);
    throw error.response?.data || error;
  }
};

export const getMedicationOverview = async (year, month) => {
  try {
    const params = { year, month };
    const response = await api.get('/api/admin/medication-reports/overview', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting medication overview:', error);
    throw error.response?.data || error;
  }
};

export default {
  getMedicationAlerts,
  getAllPatientsAdherence,
  getPatientMonthlyReport,
  getMedicationOverview,
};
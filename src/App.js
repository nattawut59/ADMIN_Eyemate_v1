import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import UserManagementPage from './components/UserManagementPage';
import MedicationsPage from './components/MedicationsPage';
import ApprovalsPage from './components/ApprovalsPage';
import SpecialTestsPage from './components/SpecialTestsPage';
import MedicationReportsPage from './components/MedicationReportsPage';
import ProtectedRoute from './components/ProtectedRoute';
import SupportTicketsPage from './components/SupportTicketsPage';
import SettingsPage from './components/SettingsPage';
import AppointmentsPage from './components/AppointmentsPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: '"Prompt", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/medications" element={<MedicationsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/appointments" element={<ApprovalsPage />} />
          <Route path="/documents" element={<SpecialTestsPage />} />
          <Route path="/reports" element={<ProtectedRoute><MedicationReportsPage /></ProtectedRoute>} />
          <Route path="/medication-reports/*" element={<ProtectedRoute><MedicationReportsPage /></ProtectedRoute>} />
          <Route path="/support-tickets" element={<ProtectedRoute><SupportTicketsPage /></ProtectedRoute>} />
          <Route path="/settings/*" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

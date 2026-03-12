import { useState, useEffect } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, AppBar, Toolbar, IconButton, Avatar, Button, Divider, Badge,
} from '@mui/material';
import {
  Warning, People, Assessment, Notifications, AccountCircle, Logout, ArrowBack,
} from '@mui/icons-material';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { getAdminData, logout } from '../utils/auth';
import MedicationAlerts from './MedicationAlerts';
import PatientAdherenceList from './PatientAdherenceList';
import PatientMonthlyReport from './PatientMonthlyReport';
import MedicationOverview from './MedicationOverview';

const DRAWER_WIDTH = 260;

const MedicationReportsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const adminData = getAdminData();
  const [selectedMenu, setSelectedMenu] = useState('alerts');

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Auto redirect to alerts if at root path
    if (currentPath === '/medication-reports' || currentPath === '/medication-reports/') {
      navigate('/medication-reports/alerts', { replace: true });
      return;
    }
    
    // Update selected menu based on path
    if (currentPath.includes('/alerts')) setSelectedMenu('alerts');
    else if (currentPath.includes('/patients')) setSelectedMenu('patients');
    else if (currentPath.includes('/overview')) setSelectedMenu('overview');
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      logout();
      navigate('/');
    }
  };

  const handleMenuClick = (menuValue) => {
    setSelectedMenu(menuValue);
    if (menuValue === 'alerts') navigate('/medication-reports/alerts');
    else if (menuValue === 'patients') navigate('/medication-reports/patients');
    else if (menuValue === 'overview') navigate('/medication-reports/overview');
  };

  const menuItems = [
    { icon: <Warning />, label: 'แจ้งเตือนเร่งด่วน', value: 'alerts' },
    { icon: <People />, label: 'รายการผู้ป่วย', value: 'patients' },
    { icon: <Assessment />, label: 'ภาพรวมรายงาน', value: 'overview' },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f7fa' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#1e293b',
            color: '#fff',
            borderRight: 'none',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap');`}</style>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 22, fontFamily: '"IBM Plex Sans Thai"', lineHeight: 1.2 }}>
            EyeMate
          </Typography>
          <Typography sx={{ color: '#60a5fa', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', mt: 0.25 }}>
            Medication Reports
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        <Box sx={{ px: 2, py: 2 }}>
          <Button
            fullWidth
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{
              color: '#94a3b8',
              textTransform: 'none',
              justifyContent: 'flex-start',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' },
            }}
          >
            กลับไป Dashboard
          </Button>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        <List sx={{ px: 2, py: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.value} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selectedMenu === item.value}
                onClick={() => handleMenuClick(item.value)}
                sx={{
                  borderRadius: 2,
                  color: selectedMenu === item.value ? '#fff' : '#94a3b8',
                  bgcolor: selectedMenu === item.value ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                    borderLeft: '3px solid #6366f1',
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#6366f1' }}>
              {adminData?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {adminData?.username}
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                System Admin
              </Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            size="small"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              color: '#94a3b8',
              fontSize: 12,
              textTransform: 'none',
              justifyContent: 'flex-start',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            ออกจากระบบ
          </Button>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: '#fff',
            color: '#1e293b',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment sx={{ color: '#6366f1', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>
                รายงานการใช้ยา
              </Typography>
            </Box>

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton>
                <Badge badgeContent={0} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              <IconButton>
                <AccountCircle />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<MedicationAlerts />} />
            <Route path="alerts" element={<MedicationAlerts />} />
            <Route path="patients" element={<PatientAdherenceList />} />
            <Route path="patient/:patientId" element={<PatientMonthlyReport />} />
            <Route path="overview" element={<MedicationOverview />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default MedicationReportsPage;
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography,
  IconButton, Avatar, Divider,
} from '@mui/material';
import {
  Settings as SettingsIcon, Person, Notifications, Palette, Security,
  Help, Build, ArrowBack, Logout,
} from '@mui/icons-material';

// Import Settings Components
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';
import DisplaySettings from './DisplaySettings';
import SecuritySettings from './SecuritySettings';
import FAQManagement from './FAQManagement';
import SystemSettings from './SystemSettings';

const DRAWER_WIDTH = 280;

const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState('profile');

  // Get admin data
  const getAdminData = () => {
    const adminDataStr = localStorage.getItem('adminData');
    return adminDataStr ? JSON.parse(adminDataStr) : null;
  };

  const adminData = getAdminData();

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminData');
  };

  // Update selected menu based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/profile')) setSelectedMenu('profile');
    else if (path.includes('/notifications')) setSelectedMenu('notifications');
    else if (path.includes('/display')) setSelectedMenu('display');
    else if (path.includes('/security')) setSelectedMenu('security');
    else if (path.includes('/faqs')) setSelectedMenu('faqs');
    else if (path.includes('/system')) setSelectedMenu('system');
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      logout();
      navigate('/');
    }
  };

  const handleMenuClick = (menuValue) => {
    setSelectedMenu(menuValue);
    navigate(`/settings/${menuValue}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const settingsMenuItems = [
    { icon: <Person />, label: 'ข้อมูลโปรไฟล์', value: 'profile' },
    { icon: <Notifications />, label: 'การแจ้งเตือน', value: 'notifications' },
    { icon: <Palette />, label: 'การแสดงผล', value: 'display' },
    { icon: <Security />, label: 'ความปลอดภัย', value: 'security' },
    { icon: <Help />, label: 'จัดการ FAQs', value: 'faqs' },
    { icon: <Build />, label: 'ระบบ', value: 'system' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#1e293b',
            color: 'white',
            borderRight: 'none',
          },
        }}
      >
        {/* Logo Section */}
        <Box sx={{ p: 3 }}>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap');`}</style>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 22, fontFamily: '"IBM Plex Sans Thai"', lineHeight: 1.2 }}>
            EyeMate
          </Typography>
          <Typography sx={{ color: '#60a5fa', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', mt: 0.25 }}>
            Admin Dashboard
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Back to Dashboard Button */}
        <Box sx={{ px: 2, pt: 2 }}>
          <ListItem
            component="div"
            onClick={handleBackToDashboard}
            sx={{
              borderRadius: 2,
              mb: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#94a3b8', minWidth: 40 }}>
              <ArrowBack />
            </ListItemIcon>
            <ListItemText
              primary="กลับหน้าหลัก"
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 500,
                color: '#94a3b8',
              }}
            />
          </ListItem>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />

        {/* Settings Menu */}
        <List sx={{ px: 2, flexGrow: 1 }}>
          <Typography
            sx={{
              px: 2,
              py: 1,
              fontSize: 12,
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            ตั้งค่า
          </Typography>

          {settingsMenuItems.map((item) => (
            <ListItem
              component="div"
              key={item.value}
              onClick={() => handleMenuClick(item.value)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1.5,
                px: 2,
                cursor: 'pointer',
                bgcolor:
                  selectedMenu === item.value
                    ? 'rgba(99, 102, 241, 0.12)'
                    : 'transparent',
                borderLeft:
                  selectedMenu === item.value
                    ? '3px solid #6366f1'
                    : '3px solid transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor:
                    selectedMenu === item.value
                      ? 'rgba(99, 102, 241, 0.15)'
                      : 'rgba(255,255,255,0.05)',
                  transform: 'translateX(4px)',
                },
                boxShadow:
                  selectedMenu === item.value
                    ? '0 2px 8px rgba(99, 102, 241, 0.2)'
                    : 'none',
              }}
            >
              <ListItemIcon
                sx={{
                  color: selectedMenu === item.value ? '#818cf8' : '#94a3b8',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: selectedMenu === item.value ? 600 : 500,
                  color: selectedMenu === item.value ? 'white' : '#cbd5e1',
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* User Info */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            bgcolor: 'rgba(0,0,0,0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#6366f1',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {adminData?.username?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'white',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {adminData?.username || 'Admin'}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                ผู้ดูแลระบบ
              </Typography>
            </Box>
          </Box>

          <ListItem
            component="div"
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText
              primary="ออกจากระบบ"
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 500,
                color: '#ef4444',
              }}
            />
          </ListItem>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Bar */}
        <Box
          sx={{
            bgcolor: 'white',
            borderBottom: '1px solid #e2e8f0',
            px: 4,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <SettingsIcon sx={{ color: '#6366f1', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            ตั้งค่าระบบ
          </Typography>
        </Box>

        {/* Content Area */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/settings/profile" replace />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/notifications" element={<NotificationSettings />} />
            <Route path="/display" element={<DisplaySettings />} />
            <Route path="/security" element={<SecuritySettings />} />
            <Route path="/faqs" element={<FAQManagement />} />
            <Route path="/system" element={<SystemSettings />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsPage;
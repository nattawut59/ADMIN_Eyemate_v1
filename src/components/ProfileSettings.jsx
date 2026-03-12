import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, TextField, Button, Alert, Snackbar,
  Grid, Avatar, Divider,
} from '@mui/material';
import { Save, Lock } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const ProfileSettings = () => {
  // Get admin data from localStorage
  const getAdminData = () => {
    const adminDataStr = localStorage.getItem('adminData');
    return adminDataStr ? JSON.parse(adminDataStr) : null;
  };

  const adminData = getAdminData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form
  const [profileData, setProfileData] = useState({
    username: '',
    phone: '',
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (adminData) {
      setProfileData({
        username: adminData.username || '',
        phone: adminData.phone || '',
      });
    }
  }, []);

  const handleProfileChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${API_BASE_URL}/admin/profile`,
        {
          phone: profileData.phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess('อัปเดตข้อมูลสำเร็จ');
        
        // Update local storage
        const updatedAdminData = { ...adminData, phone: profileData.phone };
        localStorage.setItem('adminData', JSON.stringify(updatedAdminData));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'ไม่สามารถอัปเดตข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('รหัสผ่านใหม่ไม่ตรงกัน');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${API_BASE_URL}/admin/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess('เปลี่ยนรหัสผ่านสำเร็จ');
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Alerts */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      {/* Profile Information */}
      <Card sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          ข้อมูลโปรไฟล์
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#6366f1',
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {profileData.username?.charAt(0).toUpperCase() || 'A'}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
              {profileData.username || 'Admin'}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#64748b' }}>
              ผู้ดูแลระบบ
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ชื่อผู้ใช้"
              value={profileData.username}
              disabled
              helperText="ไม่สามารถแก้ไขได้"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="เบอร์โทรศัพท์"
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              placeholder="0812345678"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleUpdateProfile}
            disabled={loading}
            sx={{
              bgcolor: '#6366f1',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#4f46e5',
                boxShadow: 'none',
              },
            }}
          >
            บันทึกข้อมูล
          </Button>
        </Box>
      </Card>

      {/* Change Password */}
      <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Lock sx={{ color: '#ef4444' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            เปลี่ยนรหัสผ่าน
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="password"
              label="รหัสผ่านปัจจุบัน"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="password"
              label="รหัสผ่านใหม่"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              helperText="อย่างน้อย 6 ตัวอักษร"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="password"
              label="ยืนยันรหัสผ่านใหม่"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<Lock />}
            onClick={handleChangePassword}
            disabled={loading}
            sx={{
              bgcolor: '#ef4444',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#dc2626',
                boxShadow: 'none',
              },
            }}
          >
            เปลี่ยนรหัสผ่าน
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default ProfileSettings;
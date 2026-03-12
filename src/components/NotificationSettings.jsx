import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Switch, FormControlLabel, Button, Alert, Snackbar,
  Divider, List, ListItem, ListItemText, ListItemSecondaryAction,
} from '@mui/material';
import { Save, Notifications } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/api';
const NotificationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState({
    allNotifications: true,
    newPatients: true,
    appointments: true,
    changeRequests: true,
    systemAlerts: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/admin/notification-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (err) {
      console.error('Error loading notification settings:', err);
    }
  };

  const handleToggle = (field) => {
    setSettings({ ...settings, [field]: !settings[field] });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${API_BASE_URL}/admin/notification-settings`,
        settings,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess('บันทึกการตั้งค่าสำเร็จ');
      }
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError(err.response?.data?.message || 'ไม่สามารถบันทึกการตั้งค่าได้');
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

      {/* Notification Settings */}
      <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Notifications sx={{ color: '#6366f1' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            การแจ้งเตือน
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 14, color: '#64748b', mb: 3 }}>
          กำหนดประเภทการแจ้งเตือนที่ต้องการรับ
        </Typography>

        <List>
          {/* All Notifications */}
          <ListItem sx={{ bgcolor: '#f8fafc', borderRadius: 2, mb: 2 }}>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                  เปิดการแจ้งเตือนทั้งหมด
                </Typography>
              }
              secondary={
                <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                  เปิด/ปิดการแจ้งเตือนทั้งหมดในคลิกเดียว
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.allNotifications}
                onChange={() => handleToggle('allNotifications')}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>

          <Divider sx={{ my: 2 }} />

          {/* New Patients */}
          <ListItem sx={{ py: 2 }}>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                  🏥 ผู้ป่วยใหม่
                </Typography>
              }
              secondary={
                <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                  แจ้งเตือนเมื่อมีผู้ป่วยลงทะเบียนใหม่
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.newPatients}
                onChange={() => handleToggle('newPatients')}
                disabled={!settings.allNotifications}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <Divider sx={{ my: 1 }} />

          {/* Appointments */}
          <ListItem sx={{ py: 2 }}>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                  📅 นัดหมาย
                </Typography>
              }
              secondary={
                <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                  แจ้งเตือนเมื่อมีการสร้างหรือแก้ไขนัดหมาย
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.appointments}
                onChange={() => handleToggle('appointments')}
                disabled={!settings.allNotifications}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <Divider sx={{ my: 1 }} />

          {/* Change Requests */}
          <ListItem sx={{ py: 2 }}>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                  ⚠️ คำขอเลื่อนนัด
                </Typography>
              }
              secondary={
                <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                  แจ้งเตือนเมื่อมีคำขอเลื่อนนัดหมายใหม่
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.changeRequests}
                onChange={() => handleToggle('changeRequests')}
                disabled={!settings.allNotifications}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <Divider sx={{ my: 1 }} />

          {/* System Alerts */}
          <ListItem sx={{ py: 2 }}>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                  🔔 แจ้งเตือนระบบ
                </Typography>
              }
              secondary={
                <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                  แจ้งเตือนเกี่ยวกับสถานะระบบและการอัปเดต
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.systemAlerts}
                onChange={() => handleToggle('systemAlerts')}
                disabled={!settings.allNotifications}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
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
            บันทึกการตั้งค่า
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default NotificationSettings;
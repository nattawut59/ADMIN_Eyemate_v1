import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, Alert, Snackbar, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Save, Palette } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/api';

const timezones = [
  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (GMT+8)' },
  { value: 'Asia/Manila', label: 'Manila (GMT+8)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
];

const DisplaySettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timezone, setTimezone] = useState('Asia/Bangkok');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(`${API_BASE_URL}/admin/display-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setTimezone(response.data.data.timezone || 'Asia/Bangkok');
      }
    } catch (err) {
      console.error('Error loading display settings:', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.put(
        `${API_BASE_URL}/admin/display-settings`,
        { timezone },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess('บันทึกการตั้งค่าสำเร็จ');
      }
    } catch (err) {
      console.error('Error saving display settings:', err);
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

      {/* Display Settings */}
      <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Palette sx={{ color: '#6366f1' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            การแสดงผล
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 14, color: '#64748b', mb: 4 }}>
          กำหนดการแสดงผลและรูปแบบของระบบ
        </Typography>

        {/* Timezone */}
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>โซนเวลา</InputLabel>
          <Select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            label="โซนเวลา"
          >
            {timezones.map((tz) => (
              <MenuItem key={tz.value} value={tz.value}>
                {tz.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Current Time Preview */}
        <Box
          sx={{
            p: 3,
            bgcolor: '#f8fafc',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            mb: 4,
          }}
        >
          <Typography sx={{ fontSize: 13, color: '#64748b', mb: 1, fontWeight: 600 }}>
            เวลาปัจจุบัน:
          </Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
            {new Date().toLocaleString('th-TH', {
              timeZone: timezone,
              dateStyle: 'full',
              timeStyle: 'medium',
            })}
          </Typography>
        </Box>

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
      </Card>
    </Box>
  );
};

export default DisplaySettings;
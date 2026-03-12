import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';
import { saveAuthData } from '../utils/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.password) {
      setError('กรุณากรอก Username และ Password');
      return;
    }
    setLoading(true);
    try {
      const response = await adminLogin(formData.username, formData.password);
      if (response.success) {
        saveAuthData(response.data.token, response.data.admin);
        navigate('/dashboard');
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } catch (err) {
      setError(err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f0f4f8', fontFamily: '"Sarabun", sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      {/* Left — Branding */}
      <Box sx={{
        flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #1e3a5f 0%, #0f2440 60%, #0a1628 100%)',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', bgcolor: '#2563eb', opacity: 0.08, filter: 'blur(100px)', top: '-10%', left: '-10%' }} />
        <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', bgcolor: '#0ea5e9', opacity: 0.06, filter: 'blur(80px)', bottom: '10%', right: '5%' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', p: 6 }}>
          {/* Logo */}
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 22, fontFamily: '"IBM Plex Sans Thai"', lineHeight: 1.2 }}>EyeMate</Typography>
            <Typography sx={{ color: '#60a5fa', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', mt: 0.25 }}>Admin Portal</Typography>
          </Box>

          {/* Center */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 440 }}>
            <Typography sx={{ color: '#bfdbfe', fontSize: 12, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', mb: 2 }}>
              ระบบจัดการโรงพยาบาล
            </Typography>
            <Typography sx={{ color: '#fff', fontSize: 40, fontWeight: 700, lineHeight: 1.2, mb: 3, fontFamily: '"IBM Plex Sans Thai"' }}>
              ดูแลผู้ป่วยต้อหิน<br />
              <Box component="span" sx={{ color: '#60a5fa' }}>อย่างมืออาชีพ</Box>
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: 15, lineHeight: 2, mb: 6 }}>
              ระบบบริหารจัดการสำหรับบุคลากรทางการแพทย์<br />
              ติดตามการรักษา จัดการนัดหมาย และดูรายงานได้ทันที
            </Typography>

            {/* Tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['จัดการผู้ป่วย', 'นัดหมายแพทย์', 'รายงานยา', 'Support Tickets', 'อนุมัติคำขอ'].map((tag) => (
                <Box key={tag} sx={{ px: 1.5, py: 0.5, borderRadius: 10, border: '1px solid rgba(96,165,250,0.25)', bgcolor: 'rgba(96,165,250,0.08)' }}>
                  <Typography sx={{ color: '#93c5fd', fontSize: 12, fontWeight: 500 }}>{tag}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Typography sx={{ color: '#1e3a5f', fontSize: 12 }}>© 2025 EyeMate · สงวนลิขสิทธิ์</Typography>
        </Box>
      </Box>

      {/* Right — Login */}
      <Box sx={{
        width: { xs: '100%', md: 500 }, flexShrink: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        bgcolor: '#fff', px: { xs: 3, sm: 6 }, py: 6, position: 'relative',
      }}>
        {/* Online badge */}
        <Box sx={{ position: 'absolute', top: 24, right: 24, display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: 10, bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e', animation: 'pulse 2s infinite' }} />
          <Typography sx={{ fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>ระบบออนไลน์</Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 360, animation: 'fadeUp 0.5s ease' }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', mb: 5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 20, color: '#1e293b', fontFamily: '"IBM Plex Sans Thai"' }}>EyeMate</Typography>
            <Typography sx={{ fontSize: 11, color: '#3b82f6', letterSpacing: 1.5, textTransform: 'uppercase' }}>Admin Portal</Typography>
          </Box>

          <Box sx={{ mb: 5 }}>
            <Typography sx={{ fontSize: 26, fontWeight: 700, color: '#0f172a', mb: 0.75, fontFamily: '"IBM Plex Sans Thai"' }}>เข้าสู่ระบบ</Typography>
            <Typography sx={{ fontSize: 14, color: '#64748b' }}>สำหรับผู้ดูแลระบบและบุคลากรทางการแพทย์</Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2, fontSize: 13 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 1 }}>Username</Typography>
              <TextField name="username" value={formData.username} onChange={handleChange}
                disabled={loading} placeholder="กรอก username ของคุณ" fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2, fontSize: 14, bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#94a3b8' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: 1.5 },
                    '&.Mui-focused': { bgcolor: '#fff' },
                  },
                  '& input': { py: 1.5, px: 1.75, color: '#0f172a' },
                  '& input::placeholder': { color: '#94a3b8', fontSize: 13 },
                }} />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 1 }}>Password</Typography>
              <TextField name="password" type={showPassword ? 'text' : 'password'}
                value={formData.password} onChange={handleChange}
                disabled={loading} placeholder="กรอก password ของคุณ" fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small"
                        sx={{ color: '#94a3b8', '&:hover': { color: '#64748b' }, mr: 0.25 }}>
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2, fontSize: 14, bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#94a3b8' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: 1.5 },
                    '&.Mui-focused': { bgcolor: '#fff' },
                  },
                  '& input': { py: 1.5, px: 1.75, color: '#0f172a' },
                  '& input::placeholder': { color: '#94a3b8', fontSize: 13 },
                }} />
            </Box>

            <Button type="submit" fullWidth disabled={loading}
              sx={{
                py: 1.6, mt: 0.5, borderRadius: 2, textTransform: 'none',
                fontSize: 15, fontWeight: 600, fontFamily: '"IBM Plex Sans Thai"',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff', boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
                transition: 'all 0.2s',
                '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)', boxShadow: '0 6px 24px rgba(37,99,235,0.4)', transform: 'translateY(-1px)' },
                '&:active': { transform: 'translateY(0)' },
                '&.Mui-disabled': { background: '#e2e8f0', color: '#94a3b8', boxShadow: 'none' },
              }}>
              {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'เข้าสู่ระบบ'}
            </Button>
          </Box>

          {/* Security info */}
          <Box sx={{ mt: 5, pt: 4, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              { icon: '🔒', text: 'ข้อมูลเข้ารหัสตามมาตรฐาน HIPAA' },
              { icon: '🏥', text: 'ใช้งานได้เฉพาะบุคลากรที่ได้รับอนุญาต' },
            ].map((item) => (
              <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Typography sx={{ fontSize: 14 }}>{item.icon}</Typography>
                <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>{item.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
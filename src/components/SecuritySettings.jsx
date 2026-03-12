import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Security, Delete, Refresh, Computer, Smartphone } from '@mui/icons-material';
import axios from 'axios';

 const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/api';
const SecuritySettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loginHistory, setLoginHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');

      // Load login history
      const historyResponse = await axios.get(`${API_BASE_URL}/admin/login-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (historyResponse.data.success) {
        setLoginHistory(historyResponse.data.data);
      }

      // Load active sessions
      const sessionsResponse = await axios.get(`${API_BASE_URL}/admin/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sessionsResponse.data.success) {
        setSessions(sessionsResponse.data.data);
      }
    } catch (err) {
      console.error('Error loading security data:', err);
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(
        `${API_BASE_URL}/admin/sessions/${sessionToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess('ลบ Session สำเร็จ');
        loadData();
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError(err.response?.data?.message || 'ไม่สามารถลบ Session ได้');
    } finally {
      setOpenDialog(false);
      setSessionToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
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

      {/* Active Sessions */}
      <Card sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Security sx={{ color: '#6366f1' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Sessions ที่กำลังใช้งาน
            </Typography>
          </Box>
          <IconButton onClick={loadData} disabled={loading}>
            <Refresh />
          </IconButton>
        </Box>

        <Typography sx={{ fontSize: 14, color: '#64748b', mb: 3 }}>
          แสดงรายการอุปกรณ์ที่เข้าสู่ระบบอยู่
        </Typography>

        {sessions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>
              ไม่มี Session ที่กำลังใช้งาน
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>อุปกรณ์</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>IP Address</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>เข้าสู่ระบบเมื่อ</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>สถานะ</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13, width: 100 }}>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.session_id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {session.device_info?.includes('Mobile') ? (
                          <Smartphone sx={{ fontSize: 20, color: '#64748b' }} />
                        ) : (
                          <Computer sx={{ fontSize: 20, color: '#64748b' }} />
                        )}
                        <Typography sx={{ fontSize: 13 }}>
                          {session.device_info || 'Unknown Device'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, fontFamily: 'monospace' }}>
                        {session.ip_address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                        {formatDate(session.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={session.is_active ? 'Active' : 'Expired'}
                        size="small"
                        sx={{
                          bgcolor: session.is_active ? '#dcfce7' : '#fee2e2',
                          color: session.is_active ? '#16a34a' : '#dc2626',
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSessionToDelete(session.session_id);
                          setOpenDialog(true);
                        }}
                        sx={{ color: '#ef4444' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Login History */}
      <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          📜 ประวัติการเข้าสู่ระบบ
        </Typography>

        <Typography sx={{ fontSize: 14, color: '#64748b', mb: 3 }}>
          แสดง 10 ครั้งล่าสุด
        </Typography>

        {loginHistory.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>
              ไม่มีประวัติการเข้าสู่ระบบ
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>วันเวลา</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>IP Address</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>อุปกรณ์</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>สถานะ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loginHistory.slice(0, 10).map((log) => (
                  <TableRow key={log.log_id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, color: '#1e293b' }}>
                        {formatDate(log.action_time)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, fontFamily: 'monospace' }}>
                        {log.ip_address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                        {log.user_agent?.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.status === 'success' ? 'สำเร็จ' : 'ล้มเหลว'}
                        size="small"
                        sx={{
                          bgcolor: log.status === 'success' ? '#dcfce7' : '#fee2e2',
                          color: log.status === 'success' ? '#16a34a' : '#dc2626',
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Delete Session Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>ยืนยันการลบ Session</DialogTitle>
        <DialogContent>
          <Typography>คุณต้องการลบ Session นี้หรือไม่?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleDeleteSession} color="error" variant="contained">
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;
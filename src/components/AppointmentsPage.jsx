import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, TextField, InputAdornment,
  Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton,
  AppBar, Toolbar, Badge, Menu, MenuItem, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, Tabs, Tab, Divider, Avatar, Tooltip, Pagination,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, Medication,
  CalendarMonth, Assessment, Settings, Notifications, Search, Add,
  FileDownload, Refresh, AccountCircle, Logout, CheckCircle,
  SupportAgent as SupportTicketsIcon, Close, ArrowBack, Visibility,
  Edit, Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAdminData, logout } from '../utils/auth';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const DRAWER_WIDTH = 260;

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState('appointments');
  const [tabValue, setTabValue] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [formData, setFormData] = useState({
    patient_id: '', doctor_id: '', appointment_date: '',
    appointment_time: '', appointment_type: '', appointment_location: '', notes: '',
  });
  const [editData, setEditData] = useState({
    appointment_date: '', appointment_time: '', appointment_type: '',
    appointment_location: '', notes: '', appointment_status: '',
  });
  const [cancelReason, setCancelReason] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const data = getAdminData();
    if (!data) navigate('/');
    else { setAdminData(data); loadData(); }
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const statsRes = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, { headers });
      if (statsRes.data.success) setStats(statsRes.data.data);

      const apptRes = await axios.get(`${API_BASE_URL}/api/appointments?page=1&limit=10`, { headers });
      if (apptRes.data.success) {
        setAppointments(apptRes.data.data || []);
        const total = apptRes.data.pagination?.total || apptRes.data.total || 0;
        setTotalCount(total);
        setTotalPages(Math.ceil(total / 10));
      }

      const today = new Date().toISOString().split('T')[0];
      const todayRes = await axios.get(
        `${API_BASE_URL}/api/appointments?date_from=${today}&date_to=${today}&limit=50`, { headers }
      );
      if (todayRes.data.success) setTodayAppointments(todayRes.data.data || []);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      let url = `${API_BASE_URL}/api/appointments?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (tabValue === 1) {
        url += `&date_from=${today}&date_to=${today}`;
      } else {
        if (dateFrom) url += `&date_from=${dateFrom}`;
        if (dateTo) url += `&date_to=${dateTo}`;
      }
      const res = await axios.get(url, { headers });
      if (res.data.success) {
        const data = res.data.data || [];
        const total = res.data.pagination?.total || res.data.total || 0;
        if (tabValue === 1) {
          setTodayAppointments(data);
        } else {
          setAppointments(data);
          setTotalCount(total);
          setTotalPages(Math.ceil(total / 10));
        }
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, tabValue, dateFrom, dateTo]);

  useEffect(() => {
    if (adminData) loadAppointments();
  }, [page, search, statusFilter, tabValue, dateFrom, dateTo, adminData]);

  const loadPatientsAndDoctors = async () => {
    try {
      const [pRes, dRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/users?role=patient&limit=100`, { headers }),
        axios.get(`${API_BASE_URL}/api/users?role=doctor&limit=100`, { headers }),
      ]);
      if (pRes.data.success) {
        const pData = pRes.data.data?.users || [];
        setPatients(Array.isArray(pData) ? pData : []);
      }
      if (dRes.data.success) {
        const dData = dRes.data.data?.users || [];
        setDoctors(Array.isArray(dData) ? dData : []);
      }
    } catch (err) {
      console.error('Error loading patients/doctors:', err);
    }
  };

  const handleOpenCreate = () => {
    loadPatientsAndDoctors();
    setOpenCreateDialog(true);
    setFormError('');
    setFormData({ patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', appointment_type: '', appointment_location: '', notes: '' });
  };

  const handleCreate = async () => {
    if (!formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
      setFormError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/appointments`, formData, { headers });
      if (res.data.success) {
        setOpenCreateDialog(false);
        setPage(1);
        await loadAppointments();
        const statsRes = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, { headers });
        if (statsRes.data.success) setStats(statsRes.data.data);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างนัดหมาย');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenEdit = (appt) => {
    setSelectedAppt(appt);
    setEditData({
      appointment_date: appt.appointment_date?.split('T')[0] || '',
      appointment_time: appt.appointment_time?.slice(0, 5) || '',
      appointment_type: appt.appointment_type || '',
      appointment_location: appt.appointment_location || '',
      notes: appt.notes || '',
      appointment_status: appt.appointment_status || '',
    });
    setFormError('');
    setOpenDetailDialog(false);
    setOpenEditDialog(true);
  };

  const handleEdit = async () => {
    setFormLoading(true);
    setFormError('');
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/appointments/${selectedAppt.appointment_id}`,
        editData, { headers }
      );
      if (res.data.success) {
        setOpenEditDialog(false);
        await loadAppointments();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขนัดหมาย');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenCancel = (appt) => {
    setSelectedAppt(appt);
    setCancelReason('');
    setFormError('');
    setOpenDetailDialog(false);
    setOpenCancelDialog(true);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setFormError('กรุณาระบุเหตุผลในการยกเลิก');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/appointments/${selectedAppt.appointment_id}`,
        { data: { cancellation_reason: cancelReason }, headers }
      );
      if (res.data.success) {
        setOpenCancelDialog(false);
        await loadAppointments();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการยกเลิกนัดหมาย');
    } finally {
      setFormLoading(false);
    }
  };

  const handleMenuClick = (menuValue) => {
    setSelectedMenu(menuValue);
    const routes = {
      dashboard: '/dashboard', users: '/users', appointments: '/appointments',
      medications: '/medications', documents: '/documents', reports: '/medication-reports/alerts',
      approvals: '/approvals', 'support-tickets': '/support-tickets', settings: '/settings',
    };
    if (routes[menuValue] && menuValue !== 'appointments') navigate(routes[menuValue]);
  };

  const getStatusChip = (status) => {
    const map = {
      scheduled: { label: 'นัดหมาย', color: '#dbeafe', textColor: '#1d4ed8' },
      completed: { label: 'เสร็จสิ้น', color: '#dcfce7', textColor: '#16a34a' },
      cancelled: { label: 'ยกเลิก', color: '#fee2e2', textColor: '#dc2626' },
      rescheduled: { label: 'เลื่อนนัด', color: '#fef3c7', textColor: '#d97706' },
    };
    const s = map[status] || { label: status || '-', color: '#f1f5f9', textColor: '#64748b' };
    return <Chip label={s.label} size="small" sx={{ bgcolor: s.color, color: s.textColor, fontWeight: 600, fontSize: 11, height: 22 }} />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const menuItems = [
    { icon: <DashboardIcon />, label: 'Dashboard', value: 'dashboard' },
    { icon: <People />, label: 'จัดการผู้ใช้งาน', value: 'users' },
    { icon: <Medication />, label: 'ยา', value: 'medications' },
    { icon: <CalendarMonth />, label: 'นัดหมาย', value: 'appointments' },
    { icon: <FileDownload />, label: 'ไฟล์/เอกสาร', value: 'documents' },
    { icon: <Assessment />, label: 'รายงาน', value: 'reports' },
    { icon: <CheckCircle />, label: 'อนุมัติคำขอ', value: 'approvals', badge: stats?.pendingChangeRequests, alert: true },
    { icon: <SupportTicketsIcon />, label: 'Support Tickets', value: 'support-tickets' },
    { icon: <Settings />, label: 'ตั้งค่าระบบ', value: 'settings' },
  ];

  const displayedAppointments = tabValue === 1 ? todayAppointments : appointments;

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f7fa' }}>
      <Drawer variant="permanent" sx={{
        width: DRAWER_WIDTH, flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: '#1e293b', color: '#fff', borderRight: 'none', display: 'flex', flexDirection: 'column' },
      }}>
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
        <List sx={{ px: 2, py: 2, flex: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.value} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton selected={selectedMenu === item.value} onClick={() => handleMenuClick(item.value)} sx={{
                borderRadius: 2, color: selectedMenu === item.value ? '#fff' : '#94a3b8',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                '&.Mui-selected': { bgcolor: 'rgba(99, 102, 241, 0.15)', borderLeft: '3px solid #6366f1', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' } },
              }}>
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
                {item.badge > 0 && (
                  <Chip label={item.badge} size="small" sx={{ height: 20, fontSize: 11, bgcolor: item.alert ? '#ef4444' : 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600 }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#6366f1' }}>{adminData?.username?.charAt(0).toUpperCase()}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{adminData?.username}</Typography>
              <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>System Admin</Typography>
            </Box>
          </Box>
          <Button fullWidth size="small" startIcon={<Logout />}
            onClick={() => { if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) logout(); }}
            sx={{ color: '#94a3b8', fontSize: 12, textTransform: 'none', justifyContent: 'flex-start', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
            ออกจากระบบ
          </Button>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0', color: '#1e293b' }}>
          <Toolbar>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}><ArrowBack /></IconButton>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>นัดหมาย</Typography>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="รีเฟรช"><IconButton onClick={loadData}><Refresh /></IconButton></Tooltip>
              <IconButton>
                <Badge badgeContent={stats?.pendingChangeRequests || 0} color="error"><Notifications /></Badge>
              </IconButton>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}><AccountCircle /></IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { navigate('/settings'); setAnchorEl(null); }}>
                  <Settings sx={{ mr: 1, fontSize: 20 }} /> ตั้งค่า
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) logout(); }}>
                  <Logout sx={{ mr: 1, fontSize: 20 }} /> ออกจากระบบ
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
            {[
              { label: 'นัดหมายวันนี้', value: stats?.todayAppointments ?? '-', color: '#f59e0b' },
              { label: 'รอดำเนินการ', value: stats?.pendingAppointments ?? '-', color: '#ef4444' },
              { label: 'นัดหมายทั้งหมด', value: totalCount || '-', color: '#6366f1' },
            ].map((card) => (
              <Card key={card.label} sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 13, color: '#64748b', mb: 1 }}>{card.label}</Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</Typography>
              </Card>
            ))}
          </Box>

          <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Tabs value={tabValue} onChange={(_, v) => { setTabValue(v); setPage(1); }} sx={{ '& .MuiTab-root': { fontSize: 13, fontWeight: 600, textTransform: 'none' } }}>
                  <Tab label="นัดหมายทั้งหมด" />
                  <Tab label={`วันนี้ (${todayAppointments.length})`} />
                </Tabs>
                <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}
                  sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5' } }}>
                  สร้างนัดหมาย
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField size="small" placeholder="ค้นหาชื่อผู้ป่วย/แพทย์" value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }}
                  sx={{ width: 220 }} />
                <FormControl size="small" sx={{ width: 130 }}>
                  <InputLabel sx={{ fontSize: 13 }}>สถานะ</InputLabel>
                  <Select value={statusFilter} label="สถานะ" onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} sx={{ fontSize: 13 }}>
                    <MenuItem value="">ทั้งหมด</MenuItem>
                    <MenuItem value="scheduled">นัดหมาย</MenuItem>
                    <MenuItem value="completed">เสร็จสิ้น</MenuItem>
                    <MenuItem value="cancelled">ยกเลิก</MenuItem>
                    <MenuItem value="rescheduled">เลื่อนนัด</MenuItem>
                  </Select>
                </FormControl>
                {tabValue === 0 && (
                  <>
                    <TextField size="small" label="จากวันที่" type="date" InputLabelProps={{ shrink: true }}
                      value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} sx={{ width: 155 }} />
                    <TextField size="small" label="ถึงวันที่" type="date" InputLabelProps={{ shrink: true }}
                      value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} sx={{ width: 155 }} />
                    {(dateFrom || dateTo) && (
                      <Button size="small" onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
                        sx={{ textTransform: 'none', color: '#64748b' }}>ล้างวันที่</Button>
                    )}
                  </>
                )}
                <IconButton onClick={loadAppointments} size="small"><Refresh sx={{ fontSize: 18 }} /></IconButton>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    {['รหัสนัดหมาย', 'ผู้ป่วย', 'แพทย์', 'วันที่', 'เวลา', 'สถานะ', 'จัดการ'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={28} /></TableCell></TableRow>
                  ) : displayedAppointments.length === 0 ? (
                    <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>ไม่มีข้อมูลนัดหมาย</TableCell></TableRow>
                  ) : (
                    displayedAppointments.map((appt) => (
                      <TableRow key={appt.appointment_id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{appt.appointment_id}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{appt.patient_name || appt.patient_id}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{appt.doctor_name || appt.doctor_id}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{formatDate(appt.appointment_date)}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{appt.appointment_time?.slice(0, 5) || '-'}</TableCell>
                        <TableCell>{getStatusChip(appt.appointment_status)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="ดูรายละเอียด">
                            <IconButton onClick={() => { setSelectedAppt(appt); setOpenDetailDialog(true); }} sx={{ color: '#6366f1' }}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="แก้ไข">
                            <span>
                              <IconButton onClick={() => handleOpenEdit(appt)} sx={{ color: '#0284c7' }}
                                disabled={appt.appointment_status === 'cancelled'}>
                                <Edit />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="ยกเลิกนัดหมาย">
                            <span>
                              <IconButton onClick={() => handleOpenCancel(appt)} sx={{ color: '#ef4444' }}
                                disabled={appt.appointment_status === 'cancelled'}>
                                <Cancel />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {tabValue === 0 && totalPages > 1 && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                  แสดง {appointments.length} จาก {totalCount} รายการ
                </Typography>
                <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" showFirstButton showLastButton />
              </Box>
            )}
          </Card>
        </Box>
      </Box>

      {/* Detail Dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          รายละเอียดนัดหมาย
          <IconButton onClick={() => setOpenDetailDialog(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedAppt && (
            <Box>
              {[
                { label: 'รหัสนัดหมาย', value: selectedAppt.appointment_id },
                { label: 'ผู้ป่วย', value: selectedAppt.patient_name || selectedAppt.patient_id },
                { label: 'แพทย์', value: selectedAppt.doctor_name || selectedAppt.doctor_id },
                { label: 'วันที่', value: formatDate(selectedAppt.appointment_date) },
                { label: 'เวลา', value: selectedAppt.appointment_time?.slice(0, 5) || '-' },
                { label: 'ประเภท', value: selectedAppt.appointment_type || '-' },
                { label: 'สถานที่', value: selectedAppt.appointment_location || '-' },
                { label: 'หมายเหตุ', value: selectedAppt.notes || '-' },
              ].map(({ label, value }) => (
                <Box key={label}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 1, py: 1.5 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>{label}</Typography>
                    <Typography sx={{ fontSize: 14 }}>{value}</Typography>
                  </Box>
                  <Divider />
                </Box>
              ))}
              <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 1, py: 1.5, alignItems: 'center' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>สถานะ</Typography>
                <Box>{getStatusChip(selectedAppt.appointment_status)}</Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpenDetailDialog(false)} sx={{ textTransform: 'none' }}>ปิด</Button>
          {selectedAppt?.appointment_status !== 'cancelled' && (
            <>
              <Button variant="outlined" startIcon={<Edit />} onClick={() => handleOpenEdit(selectedAppt)}
                sx={{ textTransform: 'none', borderColor: '#0284c7', color: '#0284c7' }}>แก้ไข</Button>
              <Button variant="outlined" startIcon={<Cancel />} onClick={() => handleOpenCancel(selectedAppt)}
                sx={{ textTransform: 'none', borderColor: '#ef4444', color: '#ef4444' }}>ยกเลิกนัด</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          แก้ไขนัดหมาย
          <IconButton onClick={() => setOpenEditDialog(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth size="small" label="วันที่นัดหมาย" type="date" InputLabelProps={{ shrink: true }}
                value={editData.appointment_date} onChange={(e) => setEditData(f => ({ ...f, appointment_date: e.target.value }))} />
              <TextField fullWidth size="small" label="เวลา" type="time" InputLabelProps={{ shrink: true }}
                value={editData.appointment_time} onChange={(e) => setEditData(f => ({ ...f, appointment_time: e.target.value }))} />
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel>สถานะ</InputLabel>
              <Select value={editData.appointment_status} label="สถานะ" onChange={(e) => setEditData(f => ({ ...f, appointment_status: e.target.value }))}>
                <MenuItem value="scheduled">นัดหมาย</MenuItem>
                <MenuItem value="completed">เสร็จสิ้น</MenuItem>
                <MenuItem value="rescheduled">เลื่อนนัด</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>ประเภทนัดหมาย</InputLabel>
              <Select value={editData.appointment_type} label="ประเภทนัดหมาย" onChange={(e) => setEditData(f => ({ ...f, appointment_type: e.target.value }))}>
                <MenuItem value="">-</MenuItem>
                <MenuItem value="follow_up">ติดตามอาการ</MenuItem>
                <MenuItem value="consultation">ปรึกษาแพทย์</MenuItem>
                <MenuItem value="treatment">รักษา</MenuItem>
                <MenuItem value="check_up">ตรวจสุขภาพ</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth size="small" label="สถานที่" value={editData.appointment_location}
              onChange={(e) => setEditData(f => ({ ...f, appointment_location: e.target.value }))} />
            <TextField fullWidth size="small" label="หมายเหตุ" multiline rows={3} value={editData.notes}
              onChange={(e) => setEditData(f => ({ ...f, notes: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpenEditDialog(false)} sx={{ textTransform: 'none' }}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleEdit} disabled={formLoading}
            sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5' } }}>
            {formLoading ? <CircularProgress size={20} color="inherit" /> : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          ยกเลิกนัดหมาย
          <IconButton onClick={() => setOpenCancelDialog(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Alert severity="warning" sx={{ mb: 2 }}>
            นัดหมาย <strong>{selectedAppt?.appointment_id}</strong> ของ <strong>{selectedAppt?.patient_name}</strong>
          </Alert>
          <TextField fullWidth label="เหตุผลในการยกเลิก *" multiline rows={3} value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)} placeholder="กรุณาระบุเหตุผล..." />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpenCancelDialog(false)} sx={{ textTransform: 'none' }}>ปิด</Button>
          <Button variant="contained" color="error" onClick={handleCancel} disabled={formLoading}
            sx={{ textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}>
            {formLoading ? <CircularProgress size={20} color="inherit" /> : 'ยืนยันยกเลิก'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          สร้างนัดหมายใหม่
          <IconButton onClick={() => setOpenCreateDialog(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>ผู้ป่วย *</InputLabel>
              <Select value={formData.patient_id} label="ผู้ป่วย *" onChange={(e) => setFormData(f => ({ ...f, patient_id: e.target.value }))}>
                {patients.map(p => (
                  <MenuItem key={p.user_id} value={p.user_id}>
                    {p.full_name || p.username} {p.profile_number ? `(${p.profile_number})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>แพทย์ *</InputLabel>
              <Select value={formData.doctor_id} label="แพทย์ *" onChange={(e) => setFormData(f => ({ ...f, doctor_id: e.target.value }))}>
                {doctors.map(d => (
                  <MenuItem key={d.user_id} value={d.user_id}>
                    {d.full_name || d.username} {d.profile_number ? `(${d.profile_number})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth size="small" label="วันที่นัดหมาย *" type="date" InputLabelProps={{ shrink: true }}
                value={formData.appointment_date} onChange={(e) => setFormData(f => ({ ...f, appointment_date: e.target.value }))} />
              <TextField fullWidth size="small" label="เวลา *" type="time" InputLabelProps={{ shrink: true }}
                value={formData.appointment_time} onChange={(e) => setFormData(f => ({ ...f, appointment_time: e.target.value }))} />
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel>ประเภทนัดหมาย</InputLabel>
              <Select value={formData.appointment_type} label="ประเภทนัดหมาย" onChange={(e) => setFormData(f => ({ ...f, appointment_type: e.target.value }))}>
                <MenuItem value="">-</MenuItem>
                <MenuItem value="follow_up">ติดตามอาการ</MenuItem>
                <MenuItem value="consultation">ปรึกษาแพทย์</MenuItem>
                <MenuItem value="treatment">รักษา</MenuItem>
                <MenuItem value="check_up">ตรวจสุขภาพ</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth size="small" label="สถานที่" value={formData.appointment_location}
              onChange={(e) => setFormData(f => ({ ...f, appointment_location: e.target.value }))} />
            <TextField fullWidth size="small" label="หมายเหตุ" multiline rows={3} value={formData.notes}
              onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpenCreateDialog(false)} sx={{ textTransform: 'none' }}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleCreate} disabled={formLoading}
            sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5' } }}>
            {formLoading ? <CircularProgress size={20} color="inherit" /> : 'สร้างนัดหมาย'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentsPage;
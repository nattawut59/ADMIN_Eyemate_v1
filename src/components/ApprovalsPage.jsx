import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton,
  AppBar, Toolbar, Badge, Menu, MenuItem, CircularProgress, Alert, Divider,
  Avatar, InputAdornment, Tabs, Tab, Paper, Snackbar, Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, Medication, CalendarMonth,
  Assessment, Settings, Notifications, Search, CheckCircle, Cancel, Visibility,
  Refresh, AccountCircle, Logout, FiberManualRecord,
  FileDownload, AccessTime, CalendarToday, Close, Check, ArrowBack,
  SupportAgent as SupportTicketsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAdminData, logout } from '../utils/auth';
import { getDashboardStats } from '../services/api';
import api from '../services/api';

const DRAWER_WIDTH = 260;

const ApprovalsPage = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState(null);
  const [changeRequests, setChangeRequests] = useState([]);
  const [changeRequestStats, setChangeRequestStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState('approvals');
  const [tabValue, setTabValue] = useState(0);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const data = getAdminData();
    setAdminData(data);
    loadDashboardStats();
    loadChangeRequests();
    loadStatistics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadChangeRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue, filterType]);

  const loadDashboardStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.success) setStats(response.data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  const loadChangeRequests = async () => {
    setLoading(true);
    setError('');
    try {
      let status = '';
      if (tabValue === 0) status = 'pending';
      else if (tabValue === 1) status = 'approved';
      else if (tabValue === 2) status = 'rejected';

      const params = {
        page: 1,
        limit: 100,
        ...(status && { status }),
        ...(filterType !== 'all' && { request_type: filterType }),
      };

      const response = await api.get('/api/appointments/change-requests', { params });
      if (response.data.success) setChangeRequests(response.data.data);
    } catch (err) {
      console.error('Error loading change requests:', err);
      setError('ไม่สามารถโหลดข้อมูลคำขอได้');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await api.get('/api/appointments/change-requests/statistics/overview');
      if (response.data.success) setChangeRequestStats(response.data.data);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const handleViewDetail = async (requestId) => {
    try {
      const response = await api.get(`/api/appointments/change-requests/${requestId}`);
      if (response.data.success) {
        setSelectedRequest(response.data.data);
        setDetailDialogOpen(true);
      }
    } catch (err) {
      setError('ไม่สามารถโหลดรายละเอียดได้');
    }
  };

  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setRejectDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    setError('');
    try {
      const response = await api.post(
        `/api/appointments/change-requests/${selectedRequest.request_id}/approve`,
        { admin_notes: adminNotes || undefined }
      );
      if (response.data.success) {
        setSuccess('อนุมัติคำขอเรียบร้อยแล้ว');
        setApproveDialogOpen(false);
        setAdminNotes('');
        loadChangeRequests();
        loadStatistics();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถอนุมัติคำขอได้');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !adminNotes.trim()) {
      setError('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      const response = await api.post(
        `/api/appointments/change-requests/${selectedRequest.request_id}/reject`,
        { admin_notes: adminNotes }
      );
      if (response.data.success) {
        setSuccess('ปฏิเสธคำขอเรียบร้อยแล้ว');
        setRejectDialogOpen(false);
        setAdminNotes('');
        loadChangeRequests();
        loadStatistics();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถปฏิเสธคำขอได้');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMenuClick = (menuValue) => {
    setSelectedMenu(menuValue);
    const routes = {
      dashboard: '/dashboard',
      users: '/users',
      medications: '/medications',
      appointments: '/appointments',
      documents: '/documents',
      reports: '/medication-reports/alerts',
      'support-tickets': '/support-tickets',
      settings: '/settings',
    };
    if (routes[menuValue]) navigate(routes[menuValue]);
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (t) => (!t ? '-' : t.substring(0, 5));

  const formatDateTime = (dt) => {
    if (!dt) return '-';
    return new Date(dt).toLocaleString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusChip = (status) => {
    const config = {
      pending: { label: 'รอดำเนินการ', color: '#f59e0b', bgcolor: '#fef3c7' },
      approved: { label: 'อนุมัติแล้ว', color: '#16a34a', bgcolor: '#dcfce7' },
      rejected: { label: 'ปฏิเสธแล้ว', color: '#dc2626', bgcolor: '#fee2e2' },
    };
    const c = config[status] || config.pending;
    return (
      <Chip icon={<FiberManualRecord sx={{ fontSize: 8 }} />} label={c.label} size="small"
        sx={{ height: 24, fontSize: 12, fontWeight: 600, bgcolor: c.bgcolor, color: c.color, '& .MuiChip-icon': { color: 'inherit' } }} />
    );
  };

  const getTypeChip = (type) => {
    const config = {
      reschedule: { label: 'เลื่อนนัด', color: '#0284c7', bgcolor: '#e0f2fe' },
      cancel: { label: 'ยกเลิกนัด', color: '#dc2626', bgcolor: '#fee2e2' },
    };
    const c = config[type] || config.reschedule;
    return <Chip label={c.label} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: c.bgcolor, color: c.color }} />;
  };

  const filteredRequests = changeRequests.filter((r) => {
    const s = searchTerm.toLowerCase();
    return r.patient_name?.toLowerCase().includes(s) || r.request_id?.toLowerCase().includes(s) || r.patient_hn?.toLowerCase().includes(s);
  });

  const pendingCount = changeRequestStats?.by_status?.find((s) => s.request_status === 'pending')?.count || 0;
  const approvedCount = changeRequestStats?.by_status?.find((s) => s.request_status === 'approved')?.count || 0;
  const rejectedCount = changeRequestStats?.by_status?.find((s) => s.request_status === 'rejected')?.count || 0;
  const totalCount = changeRequestStats?.by_status?.reduce((sum, s) => sum + s.count, 0) || 0;

  // ✅ Sidebar ครบเหมือนหน้าอื่น
  const menuItems = [
    { icon: <DashboardIcon />, label: 'Dashboard', value: 'dashboard' },
    { icon: <People />, label: 'จัดการผู้ใช้งาน', value: 'users' },
    { icon: <Medication />, label: 'ยา', value: 'medications' },
    { icon: <CalendarMonth />, label: 'นัดหมาย', value: 'appointments' },
    { icon: <FileDownload />, label: 'ไฟล์/เอกสาร', value: 'documents' },
    { icon: <Assessment />, label: 'รายงาน', value: 'reports' },
    { icon: <CheckCircle />, label: 'อนุมัติคำขอ', value: 'approvals', badge: pendingCount, alert: true },
    { icon: <SupportTicketsIcon />, label: 'Support Tickets', value: 'support-tickets' },
    { icon: <Settings />, label: 'ตั้งค่าระบบ', value: 'settings' },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Sidebar */}
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
                  <Chip label={item.badge} size="small"
                    sx={{ height: 20, fontSize: 11, bgcolor: item.alert ? '#ef4444' : 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600 }} />
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

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#fff', color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>
          <Toolbar>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}><ArrowBack /></IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>อนุมัติคำขอเลื่อนนัดหมาย</Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField size="small" placeholder="ค้นหาชื่อผู้ป่วย, HN, Request ID..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 300, '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', fontSize: 14, '& fieldset': { borderColor: '#e2e8f0' } } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20, color: '#64748b' }} /></InputAdornment> }} />
              <Tooltip title="รีเฟรช">
                <IconButton onClick={() => { loadChangeRequests(); loadStatistics(); }}><Refresh /></IconButton>
              </Tooltip>
              <IconButton>
                <Badge badgeContent={pendingCount} color="error"><Notifications /></Badge>
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

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
            {[
              { icon: <AccessTime />, value: pendingCount, label: 'รอดำเนินการ', iconColor: '#f59e0b', iconBg: '#fef3c7' },
              { icon: <CheckCircle />, value: approvedCount, label: 'อนุมัติแล้ว', iconColor: '#16a34a', iconBg: '#dcfce7' },
              { icon: <Cancel />, value: rejectedCount, label: 'ปฏิเสธแล้ว', iconColor: '#dc2626', iconBg: '#fee2e2' },
              { icon: <CalendarToday />, value: totalCount, label: 'ทั้งหมด', iconColor: '#0284c7', iconBg: '#e0f2fe' },
            ].map((card) => (
              <Card key={card.label} sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: card.iconBg, color: card.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{card.value}</Typography>
                    <Typography sx={{ fontSize: 13, color: '#64748b' }}>{card.label}</Typography>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>

          {/* Table Card */}
          <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <Box sx={{ borderBottom: '1px solid #e2e8f0' }}>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}
                sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 14 } }}>
                <Tab label={`รอดำเนินการ (${pendingCount})`} />
                <Tab label={`อนุมัติแล้ว (${approvedCount})`} />
                <Tab label={`ปฏิเสธแล้ว (${rejectedCount})`} />
                <Tab label={`ทั้งหมด (${totalCount})`} />
              </Tabs>
            </Box>

            <Box sx={{ p: 2, display: 'flex', gap: 1, borderBottom: '1px solid #e2e8f0' }}>
              {['all', 'reschedule', 'cancel'].map((type) => (
                <Button key={type} size="small"
                  variant={filterType === type ? 'contained' : 'outlined'}
                  onClick={() => setFilterType(type)}
                  sx={{ textTransform: 'none', ...(filterType === type && { bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }) }}>
                  {type === 'all' ? 'ทั้งหมด' : type === 'reschedule' ? 'ขอเลื่อนนัด' : 'ขอยกเลิกนัด'}
                </Button>
              ))}
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : filteredRequests.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography sx={{ color: '#64748b' }}>ไม่พบข้อมูลคำขอ</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      {['รหัสคำขอ', 'ผู้ป่วย', 'ประเภท', 'วันเวลาเดิม', 'ขอเลื่อนเป็น', 'เหตุผล', 'สถานะ', 'สร้างเมื่อ', 'จัดการ'].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.request_id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{request.request_id}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{request.patient_name}</Typography>
                          <Typography sx={{ fontSize: 11, color: '#64748b' }}>HN: {request.patient_hn}</Typography>
                        </TableCell>
                        <TableCell>{getTypeChip(request.request_type)}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 12 }}>{formatDate(request.original_date)}</Typography>
                          <Typography sx={{ fontSize: 11, color: '#64748b' }}>{formatTime(request.original_time)}</Typography>
                        </TableCell>
                        <TableCell>
                          {request.request_type === 'reschedule' ? (
                            <>
                              <Typography sx={{ fontSize: 12 }}>{formatDate(request.requested_new_date)}</Typography>
                              <Typography sx={{ fontSize: 11, color: '#64748b' }}>{formatTime(request.requested_new_time)}</Typography>
                            </>
                          ) : <Typography sx={{ fontSize: 12, color: '#64748b' }}>-</Typography>}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {request.reason}
                          </Typography>
                        </TableCell>
                        <TableCell>{getStatusChip(request.request_status)}</TableCell>
                        <TableCell sx={{ fontSize: 12, color: '#64748b' }}>{formatDateTime(request.created_at)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="ดูรายละเอียด">
                              <IconButton size="small" onClick={() => handleViewDetail(request.request_id)}>
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {request.request_status === 'pending' && (
                              <>
                                <Tooltip title="อนุมัติ">
                                  <IconButton size="small" color="success" onClick={() => handleApproveClick(request)}>
                                    <CheckCircle fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="ปฏิเสธ">
                                  <IconButton size="small" color="error" onClick={() => handleRejectClick(request)}>
                                    <Cancel fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Box>
      </Box>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>รายละเอียดคำขอ</Typography>
          <IconButton size="small" onClick={() => setDetailDialogOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedRequest && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper sx={{ p: 2, bgcolor: '#f8fafc' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>รหัสคำขอ</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{selectedRequest.request_id}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>ประเภท</Typography>
                    {getTypeChip(selectedRequest.request_type)}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>สถานะ</Typography>
                    {getStatusChip(selectedRequest.request_status)}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>สร้างเมื่อ</Typography>
                    <Typography sx={{ fontSize: 14 }}>{formatDateTime(selectedRequest.created_at)}</Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: '#f8fafc' }}>
                <Typography sx={{ fontWeight: 700, mb: 2 }}>ข้อมูลผู้ป่วย</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>ชื่อ-นามสกุล</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{selectedRequest.patient_name}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>HN</Typography>
                    <Typography sx={{ fontSize: 14 }}>{selectedRequest.patient_hn}</Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: '#fff3cd' }}>
                <Typography sx={{ fontWeight: 700, mb: 2, color: '#856404' }}>รายละเอียดคำขอ</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>วันเวลาเดิม</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{formatDate(selectedRequest.original_date)}</Typography>
                    <Typography sx={{ fontSize: 14 }}>{formatTime(selectedRequest.original_time)}</Typography>
                  </Box>
                  {selectedRequest.request_type === 'reschedule' && (
                    <Box>
                      <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>ขอเลื่อนเป็น</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#0284c7' }}>{formatDate(selectedRequest.requested_new_date)}</Typography>
                      <Typography sx={{ fontSize: 14, color: '#0284c7' }}>{formatTime(selectedRequest.requested_new_time)}</Typography>
                    </Box>
                  )}
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>เหตุผล</Typography>
                    <Typography sx={{ fontSize: 14 }}>{selectedRequest.reason}</Typography>
                  </Box>
                </Box>
              </Paper>

              {selectedRequest.request_status !== 'pending' && (
                <Paper sx={{ p: 2, bgcolor: '#f8fafc' }}>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>ข้อมูลการดำเนินการ</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>ดำเนินการโดย</Typography>
                      <Typography sx={{ fontSize: 14 }}>{selectedRequest.action_by_name || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>เมื่อ</Typography>
                      <Typography sx={{ fontSize: 14 }}>{formatDateTime(selectedRequest.action_date)}</Typography>
                    </Box>
                    {selectedRequest.admin_notes && (
                      <Box sx={{ gridColumn: '1 / -1' }}>
                        <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>หมายเหตุ</Typography>
                        <Typography sx={{ fontSize: 14 }}>{selectedRequest.admin_notes}</Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0', gap: 1 }}>
          {selectedRequest?.request_status === 'pending' && (
            <>
              <Button variant="contained" color="success" startIcon={<Check />}
                onClick={() => { setDetailDialogOpen(false); handleApproveClick(selectedRequest); }}
                sx={{ textTransform: 'none' }}>อนุมัติ</Button>
              <Button variant="outlined" color="error" startIcon={<Close />}
                onClick={() => { setDetailDialogOpen(false); handleRejectClick(selectedRequest); }}
                sx={{ textTransform: 'none' }}>ปฏิเสธ</Button>
            </>
          )}
          <Button onClick={() => setDetailDialogOpen(false)} sx={{ textTransform: 'none' }}>ปิด</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ color: '#16a34a' }} />
          <Typography sx={{ fontWeight: 700 }}>ยืนยันการอนุมัติ</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedRequest && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 13 }}>
                  <strong>ผู้ป่วย:</strong> {selectedRequest.patient_name}<br />
                  <strong>ประเภท:</strong> {selectedRequest.request_type === 'reschedule' ? 'เลื่อนนัด' : 'ยกเลิกนัด'}
                  {selectedRequest.request_type === 'reschedule' && (
                    <><br /><strong>เลื่อนเป็น:</strong> {formatDate(selectedRequest.requested_new_date)} {formatTime(selectedRequest.requested_new_time)}</>
                  )}
                </Typography>
              </Alert>
              <TextField fullWidth multiline rows={3} label="หมายเหตุ (ไม่บังคับ)"
                placeholder="ระบุหมายเหตุเพิ่มเติม..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setApproveDialogOpen(false)} disabled={actionLoading} sx={{ textTransform: 'none' }}>ยกเลิก</Button>
          <Button variant="contained" color="success" onClick={handleApprove} disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : <Check />} sx={{ textTransform: 'none' }}>
            {actionLoading ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Cancel sx={{ color: '#dc2626' }} />
          <Typography sx={{ fontWeight: 700 }}>ยืนยันการปฏิเสธ</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedRequest && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 13 }}>
                  <strong>ผู้ป่วย:</strong> {selectedRequest.patient_name}<br />
                  <strong>ประเภท:</strong> {selectedRequest.request_type === 'reschedule' ? 'เลื่อนนัด' : 'ยกเลิกนัด'}
                </Typography>
              </Alert>
              <TextField fullWidth required multiline rows={4} label="เหตุผลในการปฏิเสธ *"
                placeholder="กรุณาระบุเหตุผลในการปฏิเสธ (บังคับ)" value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                error={!adminNotes.trim()} helperText={!adminNotes.trim() ? 'กรุณาระบุเหตุผล' : ''} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={actionLoading} sx={{ textTransform: 'none' }}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={handleReject}
            disabled={actionLoading || !adminNotes.trim()}
            startIcon={actionLoading ? <CircularProgress size={16} /> : <Close />} sx={{ textTransform: 'none' }}>
            {actionLoading ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ApprovalsPage;
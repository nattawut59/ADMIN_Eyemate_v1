import React, { useEffect, useState } from 'react';
import { Box,Typography,Card,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Chip,Avatar,IconButton,Button,TextField,InputAdornment,Drawer,List,ListItem,
  ListItemIcon,ListItemText, ListItemButton,AppBar,Toolbar,Badge,Menu,MenuItem,CircularProgress,Alert,Divider,LinearProgress, Paper, Popover } from '@mui/material';
import { Dashboard as DashboardIcon,People,LocalHospital,Medication,CalendarMonth,Assessment,Settings,Notifications,Search,MoreVert,CheckCircle,Warning,Error as ErrorIcon,
  TrendingUp,TrendingDown,ArrowForward,Add,FilterList,FileDownload,Refresh,AccountCircle,Logout,FiberManualRecord,Help as HelpIcon, SupportAgent as SupportTicketsIcon,
  NotificationsNone, Circle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAdminData, logout } from '../utils/auth';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const DRAWER_WIDTH = 260;

const DashboardPage = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');

  // Notification state
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    const data = getAdminData();
    if (!data) {
      navigate('/');
    } else {
      setAdminData(data);
      loadDashboardData();
    }
  }, [navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');

      const statsResponse = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsResponse.data.success) setStats(statsResponse.data.data);

      const activitiesResponse = await axios.get(`${API_BASE_URL}/api/dashboard/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (activitiesResponse.data.success) setActivities(activitiesResponse.data.data);

      const tasksResponse = await axios.get(`${API_BASE_URL}/api/dashboard/pending-tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tasksResponse.data.success) setPendingTasks(tasksResponse.data.data);

      const patientsResponse = await axios.get(`${API_BASE_URL}/api/dashboard/recent-patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (patientsResponse.data.success) setRecentPatients(patientsResponse.data.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  // ===== NOTIFICATION FUNCTIONS =====
  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const token = localStorage.getItem('adminToken');

      // ดึง pending change requests
      const [changeReqRes, alertsRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/appointments/change-requests?status=pending&limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/admin/medication-reports/alerts`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      const notifList = [];

      // Change requests → notifications
      if (changeReqRes.status === 'fulfilled' && changeReqRes.value.data.success) {
        const requests = changeReqRes.value.data.data || [];
        requests.slice(0, 5).forEach((r) => {
          notifList.push({
            id: r.request_id,
            type: 'approval',
            icon: '📅',
            title: r.request_type === 'reschedule' ? 'ขอเลื่อนนัดหมาย' : 'ขอยกเลิกนัดหมาย',
            desc: `${r.patient_name} — รอการอนุมัติ`,
            time: r.created_at,
            action: () => { navigate('/approvals'); setNotifAnchorEl(null); },
            color: '#f59e0b',
            bgcolor: '#fef3c7',
          });
        });
      }

      // Medication alerts → notifications
      if (alertsRes.status === 'fulfilled' && alertsRes.value.data.success) {
        const alerts = alertsRes.value.data.data || [];
        alerts.slice(0, 3).forEach((a) => {
          notifList.push({
            id: `alert-${a.patient_id}`,
            type: 'medication',
            icon: '💊',
            title: 'แจ้งเตือนการใช้ยา',
            desc: `${a.patient_name} — adherence ต่ำกว่าเกณฑ์`,
            time: new Date().toISOString(),
            action: () => { navigate('/medication-reports/alerts'); setNotifAnchorEl(null); },
            color: '#dc2626',
            bgcolor: '#fee2e2',
          });
        });
      }

      setNotifications(notifList);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleNotifOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
    loadNotifications();
  };

  const handleNotifClose = () => setNotifAnchorEl(null);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชม.ที่แล้ว`;
    return `${diffDays} วันที่แล้ว`;
  };

  const notifCount = stats?.pendingChangeRequests || 0;

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) logout();
  };

  const handleMenuClick = (menuValue) => {
    setSelectedMenu(menuValue);
    const routes = {
      users: '/users', medications: '/medications', appointments: '/appointments',
      documents: '/documents', reports: '/medication-reports/alerts',
      approvals: '/approvals', 'support-tickets': '/support-tickets', settings: '/settings',
    };
    if (routes[menuValue]) navigate(routes[menuValue]);
  };

  const menuItems = [
    { icon: <DashboardIcon />, label: 'Dashboard', value: 'dashboard' },
    { icon: <People />, label: 'จัดการผู้ใช้งาน', value: 'users', badge: (stats?.totalPatients || 0) + (stats?.totalDoctors || 0) },
    { icon: <Medication />, label: 'ยา', value: 'medications', badge: stats?.totalMedications },
    { icon: <CalendarMonth />, label: 'นัดหมาย', value: 'appointments' },
    { icon: <FileDownload />, label: 'ไฟล์/เอกสาร', value: 'documents' },
    { icon: <Assessment />, label: 'รายงาน', value: 'reports' },
    { icon: <CheckCircle />, label: 'อนุมัติคำขอ', value: 'approvals', badge: stats?.pendingChangeRequests, alert: true },
    { icon: <SupportTicketsIcon />, label: 'Support Tickets', value: 'support-tickets' },
    { icon: <Settings />, label: 'ตั้งค่าระบบ', value: 'settings' },
  ];

  const statCards = stats ? [
    { title: 'ผู้ป่วยทั้งหมด', value: stats.totalPatients, change: '+12.5%', trend: 'up', color: '#2563eb', icon: <People /> },
    { title: 'นัดหมายวันนี้', value: stats.todayAppointments, change: '+8.2%', trend: 'up', color: '#f59e0b', icon: <CalendarMonth /> },
    { title: 'รอดำเนินการ', value: stats.pendingAppointments + stats.pendingChangeRequests, change: '-3.1%', trend: 'down', color: '#ef4444', icon: <Warning /> },
    { title: 'แพทย์ออนไลน์', value: stats.totalDoctors, change: '100%', trend: 'up', color: '#10b981', icon: <LocalHospital /> },
  ] : [];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Sidebar */}
      <Drawer variant="permanent" sx={{
        width: DRAWER_WIDTH, flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: '#1e293b', color: '#fff', borderRight: 'none' },
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
        <List sx={{ px: 2, py: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.value} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton selected={selectedMenu === item.value} onClick={() => handleMenuClick(item.value)}
                sx={{ borderRadius: 2, color: selectedMenu === item.value ? '#fff' : '#94a3b8',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                  '&.Mui-selected': { bgcolor: 'rgba(99, 102, 241, 0.15)', borderLeft: '3px solid #6366f1', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' } } }}>
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
        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#6366f1' }}>{adminData?.username?.charAt(0).toUpperCase()}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{adminData?.username}</Typography>
              <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>System Admin</Typography>
            </Box>
          </Box>
          <Button fullWidth size="small" startIcon={<Logout />} onClick={handleLogout}
            sx={{ color: '#94a3b8', fontSize: 12, textTransform: 'none', justifyContent: 'flex-start', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
            ออกจากระบบ
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#fff', color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>Dashboard Overview</Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField size="small" placeholder="ค้นหา..."
                sx={{ width: 300, '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', fontSize: 14, '& fieldset': { borderColor: '#e2e8f0' } } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20, color: '#64748b' }} /></InputAdornment> }} />
              <IconButton onClick={loadDashboardData}><Refresh /></IconButton>

              {/* ✅ Notification Bell */}
              <IconButton onClick={handleNotifOpen}>
                <Badge badgeContent={notifCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              <IconButton onClick={handleMenuOpen}><AccountCircle /></IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
                  <Settings sx={{ mr: 1, fontSize: 20 }} /> ตั้งค่า
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}><Logout sx={{ mr: 1, fontSize: 20 }} /> ออกจากระบบ</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* ✅ Notification Popover */}
        <Popover
          open={Boolean(notifAnchorEl)}
          anchorEl={notifAnchorEl}
          onClose={handleNotifClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { width: 380, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' } }}
        >
          {/* Header */}
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>การแจ้งเตือน</Typography>
              {notifCount > 0 && (
                <Typography sx={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>{notifCount} รายการรอดำเนินการ</Typography>
              )}
            </Box>
            <IconButton size="small" onClick={() => { loadNotifications(); }}><Refresh fontSize="small" /></IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notifLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <NotificationsNone sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                <Typography sx={{ fontSize: 14, color: '#64748b' }}>ไม่มีการแจ้งเตือน</Typography>
              </Box>
            ) : (
              notifications.map((notif, idx) => (
                <Box key={notif.id}>
                  <Box onClick={notif.action} sx={{ px: 2.5, py: 1.5, display: 'flex', gap: 1.5, alignItems: 'flex-start', cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.15s' }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: notif.bgcolor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {notif.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.25 }}>{notif.title}</Typography>
                      <Typography sx={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.desc}</Typography>
                      <Typography sx={{ fontSize: 11, color: '#94a3b8', mt: 0.25 }}>{formatTimeAgo(notif.time)}</Typography>
                    </Box>
                    <Circle sx={{ fontSize: 8, color: notif.color, mt: 0.5, flexShrink: 0 }} />
                  </Box>
                  {idx < notifications.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 1 }}>
            <Button size="small" fullWidth onClick={() => { navigate('/approvals'); handleNotifClose(); }}
              sx={{ textTransform: 'none', fontSize: 13, color: '#6366f1', fontWeight: 600 }}>
              ดูคำขออนุมัติทั้งหมด
            </Button>
            <Button size="small" fullWidth onClick={() => { navigate('/medication-reports/alerts'); handleNotifClose(); }}
              sx={{ textTransform: 'none', fontSize: 13, color: '#6366f1', fontWeight: 600 }}>
              ดูแจ้งเตือนยา
            </Button>
          </Box>
        </Popover>

        {error && <Alert severity="error" onClose={() => setError('')} sx={{ m: 2 }}>{error}</Alert>}

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>
          ) : (
            <>
              {/* Stats Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                {statCards.map((card, index) => (
                  <Card key={index} sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${card.color}15`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {card.icon}
                      </Box>
                      <Chip icon={card.trend === 'up' ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
                        label={card.change} size="small"
                        sx={{ height: 24, fontSize: 11, fontWeight: 600, bgcolor: card.trend === 'up' ? '#dcfce7' : '#fee2e2', color: card.trend === 'up' ? '#16a34a' : '#dc2626', '& .MuiChip-icon': { color: 'inherit' } }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{card.value?.toLocaleString()}</Typography>
                    <Typography sx={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{card.title}</Typography>
                  </Card>
                ))}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Pending Tasks */}
                  <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 16 }}>รายการรอดำเนินการ</Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      {pendingTasks.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', color: '#64748b', py: 3 }}>ไม่มีรายการที่รอดำเนินการ</Typography>
                      ) : (
                        pendingTasks.map((task) => (
                          <Box key={task.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, mb: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', '&:hover': { bgcolor: '#f1f5f9' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#64748b' }} />
                              <Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.25 }}>{task.title}</Typography>
                                <Typography sx={{ fontSize: 12, color: '#64748b' }}>มี {task.count} รายการ</Typography>
                              </Box>
                            </Box>
                            <Chip label={task.count} size="small" sx={{ bgcolor: task.priority === 'high' ? '#fee2e2' : '#fef3c7', color: task.priority === 'high' ? '#dc2626' : '#d97706', fontWeight: 700, fontSize: 13 }} />
                          </Box>
                        ))
                      )}
                    </Box>
                  </Card>

                  {/* Recent Patients */}
                  <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 16 }}>ผู้ป่วยล่าสุด</Typography>
                    </Box>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {['รหัสผู้ป่วย', 'ชื่อ-นามสกุล', 'สถานะ', 'IOP', 'เข้าพบล่าสุด'].map((h) => (
                              <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentPatients.length === 0 ? (
                            <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: '#64748b' }}>ไม่มีข้อมูลผู้ป่วย</TableCell></TableRow>
                          ) : (
                            recentPatients.map((patient) => (
                              <TableRow key={patient.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{patient.hn || patient.id}</TableCell>
                                <TableCell sx={{ fontSize: 13 }}>{patient.name}</TableCell>
                                <TableCell>
                                  <Chip icon={<FiberManualRecord sx={{ fontSize: 8 }} />} label={patient.status === 'active' ? 'ปกติ' : 'เฝ้าระวัง'} size="small"
                                    sx={{ height: 22, fontSize: 11, bgcolor: patient.status === 'active' ? '#dcfce7' : '#fef3c7', color: patient.status === 'active' ? '#16a34a' : '#d97706', '& .MuiChip-icon': { color: 'inherit' } }} />
                                </TableCell>
                                <TableCell>
                                  <Chip label={`${patient.iop} mmHg`} size="small"
                                    sx={{ height: 22, fontSize: 11, bgcolor: patient.iop > 21 ? '#fee2e2' : '#e0f2fe', color: patient.iop > 21 ? '#dc2626' : '#0284c7', fontWeight: 600 }} />
                                </TableCell>
                                <TableCell sx={{ fontSize: 13, color: '#64748b' }}>{patient.lastVisit}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </Box>

                {/* Right Column */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none', p: 2.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>กิจกรรมล่าสุด</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {activities.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', color: '#64748b', py: 2 }}>ไม่มีกิจกรรม</Typography>
                      ) : (
                        activities.slice(0, 5).map((activity, index) => (
                          <Box key={index} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: activity.type === 'new_patient' ? '#e0f2fe' : '#fef3c7', color: activity.type === 'new_patient' ? '#0284c7' : '#d97706', fontSize: 16 }}>
                              {activity.text.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontSize: 12, color: '#1e293b', fontWeight: 500, lineHeight: 1.4 }}>{activity.text}</Typography>
                              <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>{formatTimeAgo(activity.time)}</Typography>
                            </Box>
                          </Box>
                        ))
                      )}
                    </Box>
                  </Card>

                  <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none', p: 2.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>Quick Actions</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button fullWidth variant="contained" startIcon={<Add />} onClick={() => navigate('/users?tab=patients&action=add')}
                        sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5' } }}>
                        เพิ่มผู้ป่วยใหม่
                      </Button>
                      <Button fullWidth variant="outlined" startIcon={<CalendarMonth />} onClick={() => navigate('/appointments?action=create')}
                        sx={{ borderColor: '#e2e8f0', color: '#475569', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' } }}>
                        สร้างนัดหมาย
                      </Button>
                      <Button fullWidth variant="outlined" startIcon={<Assessment />} onClick={() => navigate('/medication-reports/alerts')}
                        sx={{ borderColor: '#e2e8f0', color: '#475569', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' } }}>
                        สร้างรายงาน
                      </Button>
                    </Box>
                  </Card>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
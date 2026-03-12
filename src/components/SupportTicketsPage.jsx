import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Tooltip,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import {
  Search,
  Refresh,
  AssignmentInd,
  ArrowForward,
  AssignmentTurnedIn,
  HourglassEmpty,
  CheckCircle,
  Cancel,
  FiberManualRecord,
  ErrorOutline,
  ArrowBack,
  Dashboard as DashboardIcon,
  People,
  Medication,
  Assessment,
  Settings,
  SupportAgent as SupportTicketsIcon,
  Logout,
  Notifications,
  AccountCircle,
  FileDownload,
  CalendarMonth, 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAdminData, logout } from '../utils/auth';
import { getAllTickets, assignTicket } from '../services/ticketService';
import { 
  getStatusLabel, 
  getStatusColor, 
  getPriorityLabel, 
  getPriorityColor,
  getCategoryLabel,
  formatTimeAgo,
  getCategoryIcon,
} from '../utils/ticketHelpers';
import TicketDetailDialog from './TicketDetailDialog';

const DRAWER_WIDTH = 260;

const SupportTicketsPage = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('support-tickets');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  
  // Dialog state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const data = getAdminData();
    if (!data) {
      navigate('/');
    } else {
      setAdminData(data);
    }
  }, [navigate]);

  useEffect(() => {
    loadTickets();
  }, [selectedTab, filterStatus, filterPriority, filterCategory, pagination.currentPage]);

  const loadTickets = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
      };

      // Tab filters
      if (selectedTab === 'unassigned') {
        params.assigned_to = 'unassigned';
      } else if (selectedTab === 'my_tickets') {
        const adminData = JSON.parse(localStorage.getItem('adminData'));
        params.assigned_to = adminData?.userId || adminData?.user_id;
      } else if (selectedTab === 'resolved') {
        params.status = 'resolved';
      } else if (selectedTab === 'closed') {
        params.status = 'closed';
      }

      // Additional filters
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (filterCategory) params.category = filterCategory;
      if (searchQuery) params.search = searchQuery;

      const response = await getAllTickets(params);
      
      if (response.success) {
        setTickets(response.data.tickets);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      setPagination({ ...pagination, currentPage: 1 });
      loadTickets();
    }
  };

  const handleAssignTicket = async (ticketId) => {
    try {
      const response = await assignTicket(ticketId);
      
      if (response.success) {
        setSuccess('รับเคสสำเร็จ');
        loadTickets();
      }
    } catch (err) {
      console.error('Error assigning ticket:', err);
      setError(err.response?.data?.message || 'ไม่สามารถรับเคสได้');
    }
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTicket(null);
    loadTickets();
  };

  const handleMenuClick = (menuValue) => {
    setSelectedMenu(menuValue);
    
    if (menuValue === 'dashboard') {
      navigate('/dashboard');
    } else if (menuValue === 'users') {
      navigate('/users');
    } else if (menuValue === 'medications') {
      navigate('/medications');
    } else if (menuValue === 'appointments') {
      navigate('/appointments');
    } else if (menuValue === 'documents') {
      navigate('/documents');
    } else if (menuValue === 'reports') {
      navigate('/medication-reports/alerts');
    } else if (menuValue === 'approvals') {
      navigate('/approvals');
    } else if (menuValue === 'settings') {
      navigate('/settings');
    }
  };

  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      logout();
      navigate('/');
    }
  };

  const menuItems = [
    { icon: <DashboardIcon />, label: 'Dashboard', value: 'dashboard' },
    { icon: <People />, label: 'จัดการผู้ใช้งาน', value: 'users' },
    { icon: <Medication />, label: 'ยา', value: 'medications' },
    { icon: <CalendarMonth />, label: 'นัดหมาย', value: 'appointments' },
    { icon: <FileDownload />, label: 'ไฟล์/เอกสาร', value: 'documents' },
    { icon: <Assessment />, label: 'รายงาน', value: 'reports' },
    { icon: <CheckCircle />, label: 'อนุมัติคำขอ', value: 'approvals' },
    { icon: <SupportTicketsIcon />, label: 'Support Tickets', value: 'support-tickets' },
    { icon: <Settings />, label: 'ตั้งค่าระบบ', value: 'settings' },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f7fa' }}>
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
            color: '#fff',
            borderRight: 'none',
          },
        }}
      >
        {/* Logo */}
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

        {/* Menu Items */}
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
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                    borderLeft: '3px solid #6366f1',
                    '&:hover': {
                      bgcolor: 'rgba(99, 102, 241, 0.2)',
                    },
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

        {/* User Info */}
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

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
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
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>
              Support Tickets
            </Typography>
            
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Refresh */}
              <IconButton onClick={loadTickets} disabled={loading}>
                <Refresh />
              </IconButton>

              {/* Notifications */}
              <IconButton>
                <Badge badgeContent={5} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              {/* Profile */}
              <IconButton>
                <AccountCircle />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
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

          {/* Main Card */}
          <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            {/* Tabs */}
            <Tabs 
              value={selectedTab} 
              onChange={handleTabChange}
              sx={{ 
                borderBottom: '1px solid #e2e8f0',
                px: 2,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  minHeight: 56,
                },
              }}
            >
              <Tab 
                icon={<AssignmentTurnedIn />} 
                iconPosition="start"
                label="ทั้งหมด" 
                value="all" 
              />
              <Tab 
                icon={<HourglassEmpty />}
                iconPosition="start"
                label="ยังไม่มีคนรับ" 
                value="unassigned"
              />
              <Tab 
                icon={<AssignmentInd />} 
                iconPosition="start"
                label="เคสของฉัน" 
                value="my_tickets" 
              />
              <Tab 
                icon={<CheckCircle />} 
                iconPosition="start"
                label="แก้ไขแล้ว" 
                value="resolved" 
              />
              <Tab 
                icon={<Cancel />} 
                iconPosition="start"
                label="ปิดแล้ว" 
                value="closed" 
              />
            </Tabs>

            {/* Filters */}
            <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0' }}>
              {/* Search */}
              <TextField
                size="small"
                placeholder="ค้นหาเลข ticket, หัวเรื่อง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 20, color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">สถานะทั้งหมด</MenuItem>
                  <MenuItem value="open">เปิดใหม่</MenuItem>
                  <MenuItem value="in_progress">กำลังดำเนินการ</MenuItem>
                  <MenuItem value="waiting_user">รอผู้ใช้ตอบกลับ</MenuItem>
                  <MenuItem value="resolved">แก้ไขแล้ว</MenuItem>
                  <MenuItem value="closed">ปิดเคส</MenuItem>
                </Select>
              </FormControl>

              {/* Priority Filter */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">ความสำคัญทั้งหมด</MenuItem>
                  <MenuItem value="urgent">เร่งด่วน</MenuItem>
                  <MenuItem value="high">สูง</MenuItem>
                  <MenuItem value="medium">ปานกลาง</MenuItem>
                  <MenuItem value="low">ต่ำ</MenuItem>
                </Select>
              </FormControl>

              {/* Category Filter */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">หมวดหมู่ทั้งหมด</MenuItem>
                  <MenuItem value="technical">ปัญหาทางเทคนิค</MenuItem>
                  <MenuItem value="account">บัญชีผู้ใช้</MenuItem>
                  <MenuItem value="appointment">นัดหมาย</MenuItem>
                  <MenuItem value="medication">ยา</MenuItem>
                  <MenuItem value="billing">ค่าใช้จ่าย</MenuItem>
                  <MenuItem value="other">อื่นๆ</MenuItem>
                </Select>
              </FormControl>

              {/* Clear Filters */}
              {(filterStatus || filterPriority || filterCategory || searchQuery) && (
                <Button
                  size="small"
                  onClick={() => {
                    setFilterStatus('');
                    setFilterPriority('');
                    setFilterCategory('');
                    setSearchQuery('');
                    loadTickets();
                  }}
                  sx={{ textTransform: 'none', fontSize: 13 }}
                >
                  ล้างตัวกรอง
                </Button>
              )}

              <Box sx={{ ml: 'auto' }}>
                <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                  แสดง {tickets.length} จาก {pagination.totalItems} รายการ
                </Typography>
              </Box>
            </Box>

            {/* Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
              </Box>
            ) : tickets.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <ErrorOutline sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
                <Typography sx={{ fontSize: 16, color: '#64748b', mb: 1, fontWeight: 600 }}>
                  ไม่พบ tickets
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>
                  ลองเปลี่ยนตัวกรองหรือค้นหาใหม่
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: '#64748b', width: 80 }}>
                        #
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: '#64748b', minWidth: 200 }}>
                        รหัส / หัวเรื่อง
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>
                        ชื่อ-นามสกุล
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>
                        ประเภท
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>
                        ความสำคัญ
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>
                        สถานะ
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>
                        ผู้รับผิดชอบ
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>
                        เวลา
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: '#64748b', width: 120 }}>
                        จัดการ
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.map((ticket, index) => {
                      const statusColor = getStatusColor(ticket.status);
                      const priorityColor = getPriorityColor(ticket.priority);
                      
                      return (
                        <TableRow 
                          key={ticket.ticket_id}
                          sx={{ '&:hover': { bgcolor: '#f8fafc' } }}
                        >
                          {/* # */}
                          <TableCell>
                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                              {(pagination.currentPage - 1) * pagination.itemsPerPage + index + 1}
                            </Typography>
                          </TableCell>

                          {/* รหัส / หัวเรื่อง */}
                          <TableCell>
                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2563eb', mb: 0.5 }}>
                                {ticket.ticket_id}
                              </Typography>
                              <Typography 
                                sx={{ 
                                  fontSize: 13, 
                                  fontWeight: 600,
                                  color: '#1e293b',
                                }}
                              >
                                {ticket.subject}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* ชื่อ-นามสกุล */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: '#e0f2fe', color: '#0284c7' }}>
                                {ticket.user_fullname?.charAt(0) || ticket.user_username?.charAt(0) || '?'}
                              </Avatar>
                              <Typography sx={{ fontSize: 13 }}>
                                {ticket.user_fullname || ticket.user_username}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* ประเภท */}
                          <TableCell>
                            <Chip
                              label={getCategoryLabel(ticket.category)}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: 12,
                                fontWeight: 600,
                                bgcolor: '#f1f5f9',
                                color: '#475569',
                              }}
                            />
                          </TableCell>

                          {/* ความสำคัญ */}
                          <TableCell>
                            <Chip
                              icon={<FiberManualRecord sx={{ fontSize: 8 }} />}
                              label={getPriorityLabel(ticket.priority)}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: 12,
                                fontWeight: 600,
                                bgcolor: priorityColor.bg,
                                color: priorityColor.color,
                                '& .MuiChip-icon': { color: 'inherit' },
                              }}
                            />
                          </TableCell>

                          {/* สถานะ */}
                          <TableCell>
                            <Chip
                              label={getStatusLabel(ticket.status)}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: 12,
                                fontWeight: 600,
                                bgcolor: statusColor.bg,
                                color: statusColor.color,
                              }}
                            />
                          </TableCell>

                          {/* ผู้รับผิดชอบ */}
                          <TableCell>
                            {ticket.assigned_to ? (
                              <Typography sx={{ fontSize: 13 }}>
                                {ticket.assigned_admin_username || ticket.assigned_to}
                              </Typography>
                            ) : (
                              <Button
                                size="small"
                                onClick={() => handleAssignTicket(ticket.ticket_id)}
                                sx={{
                                  textTransform: 'none',
                                  fontSize: 12,
                                  color: '#6366f1',
                                }}
                              >
                                รับเคส
                              </Button>
                            )}
                          </TableCell>

                          {/* เวลา */}
                          <TableCell>
                            <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                              {formatTimeAgo(ticket.created_at)}
                            </Typography>
                          </TableCell>

                          {/* จัดการ */}
                          <TableCell>
                            <IconButton 
                              size="small"
                              onClick={() => handleViewDetails(ticket)}
                            >
                              <ArrowForward fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {!loading && tickets.length > 0 && (
              <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                  หน้า {pagination.currentPage} จาก {pagination.totalPages} • 1-{pagination.itemsPerPage} จาก {pagination.totalItems} รายการ
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    disabled={pagination.currentPage === 1}
                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                    sx={{ textTransform: 'none', fontSize: 13 }}
                  >
                    ← ก่อนหน้า
                  </Button>
                  <Button
                    size="small"
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                    sx={{ textTransform: 'none', fontSize: 13 }}
                  >
                    ถัดไป →
                  </Button>
                </Box>
              </Box>
            )}
          </Card>
        </Box>
      </Box>

      {/* Ticket Detail Dialog */}
      {openDialog && selectedTicket && (
        <TicketDetailDialog
          open={openDialog}
          ticketId={selectedTicket.ticket_id}
          onClose={handleCloseDialog}
        />
      )}
    </Box>
  );
};

export default SupportTicketsPage;
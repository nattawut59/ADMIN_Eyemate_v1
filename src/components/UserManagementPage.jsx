import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  AppBar,
  Toolbar,
  Badge,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  Medication,
  CalendarMonth,
  Assessment,
  Settings,
  Notifications,
  Search,
  Add,
  FilterList,
  FileDownload,
  Refresh,
  AccountCircle,
  Logout,
  CheckCircle,
  ArrowBack,
  LocalHospital,
  SupportAgent as SupportTicketsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAdminData, logout } from '../utils/auth';
import { getDashboardStats } from '../services/api';
import { getAllUsers, deleteUser, updateUserStatus } from '../services/userService';
import UserListTable from './UserListTable';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';
import UserDetailDialog from './UserDetailDialog';

const DRAWER_WIDTH = 260;

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState('users');
  const [anchorEl, setAnchorEl] = useState(null);
  
  // User Management States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTab, setCurrentTab] = useState(0); // 0=All, 1=Patients, 2=Doctors
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);

  // Dialog States
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const data = getAdminData();
    if (!data) {
      navigate('/');
    } else {
      setAdminData(data);
      loadDashboardStats();
    }
  }, [navigate]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, searchQuery, page, limit]);

  const loadDashboardStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const roleMap = ['', 'patient', 'doctor'];
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        role: roleMap[currentTab] || undefined,
      };

      const response = await getAllUsers(params);
      
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      logout();
    }
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
    } else if (menuValue === 'support-tickets') {
      navigate('/support-tickets');
    } else if (menuValue === 'settings') {
      navigate('/settings');
    }
  };

  const handleCreateUser = () => {
    setOpenCreateDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenEditDialog(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setOpenDetailDialog(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      const response = await deleteUser(selectedUser.user_id);
      
      if (response.success) {
        setSuccess('ลบผู้ใช้สำเร็จ');
        setDeleteConfirmOpen(false);
        setSelectedUser(null);
        loadUsers();
      }
    } catch (err) {
      setError(err.message || 'ไม่สามารถลบผู้ใช้ได้');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await updateUserStatus(userId, newStatus);
      
      if (response.success) {
        setSuccess('เปลี่ยนสถานะสำเร็จ');
        loadUsers();
      }
    } catch (err) {
      setError(err.message || 'ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const handleRefresh = () => {
    loadUsers();
    loadDashboardStats();
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
                {item.badge > 0 && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 11,
                      bgcolor: item.alert ? '#ef4444' : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  />
                )}
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
            <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>
              จัดการผู้ใช้งาน
            </Typography>
            
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Search */}
              <TextField
                size="small"
                placeholder="ค้นหา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: 300,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                    fontSize: 14,
                    '& fieldset': { borderColor: '#e2e8f0' },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 20, color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Refresh */}
              <IconButton onClick={handleRefresh}>
                <Refresh />
              </IconButton>

              {/* Notifications */}
              <IconButton>
                <Badge badgeContent={5} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              {/* Profile Menu */}
              <IconButton onClick={handleMenuOpen}>
                <AccountCircle />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>
                  <Settings sx={{ mr: 1, fontSize: 20 }} />
                  ตั้งค่า
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1, fontSize: 20 }} />
                  ออกจากระบบ
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tabs 
                  value={currentTab} 
                  onChange={(e, newValue) => setCurrentTab(newValue)}
                  sx={{
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 14 },
                  }}
                >
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        ทั้งหมด
                        {pagination && (
                          <Chip label={pagination.totalItems} size="small" sx={{ height: 20, fontSize: 11 }} />
                        )}
                      </Box>
                    }
                  />
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People sx={{ fontSize: 18 }} />
                        ผู้ป่วย
                      </Box>
                    }
                  />
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalHospital sx={{ fontSize: 18 }} />
                        แพทย์
                      </Box>
                    }
                  />
                </Tabs>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterList />}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#e2e8f0',
                    color: '#475569',
                    '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
                  }}
                >
                  กรอง
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownload />}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#e2e8f0',
                    color: '#475569',
                    '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
                  }}
                >
                  Export
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={handleCreateUser}
                  sx={{
                    bgcolor: '#6366f1',
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#4f46e5' },
                  }}
                >
                  เพิ่มผู้ใช้ใหม่
                </Button>
              </Box>
            </Box>

            {/* User Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : users.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 5 }}>
                <Typography sx={{ color: '#64748b' }}>
                  ไม่พบข้อมูลผู้ใช้
                </Typography>
              </Box>
            ) : (
              <UserListTable
                users={users}
                pagination={pagination}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                onViewDetail={handleViewUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteClick}
                onStatusChange={handleStatusChange}
              />
            )}
          </Card>
        </Box>
      </Box>

      {/* Dialogs */}
      <CreateUserDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSuccess={() => {
          setOpenCreateDialog(false);
          setSuccess('สร้างผู้ใช้สำเร็จ');
          loadUsers();
        }}
      />

      <EditUserDialog
        open={openEditDialog}
        user={selectedUser}
        onClose={() => {
          setOpenEditDialog(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setOpenEditDialog(false);
          setSuccess('แก้ไขข้อมูลสำเร็จ');
          setSelectedUser(null);
          loadUsers();
        }}
      />

      <UserDetailDialog
        open={openDetailDialog}
        user={selectedUser}
        onClose={() => {
          setOpenDetailDialog(false);
          setSelectedUser(null);
        }}
        onEdit={() => {
          setOpenDetailDialog(false);
          setOpenEditDialog(true);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <Typography>
            คุณต้องการลบผู้ใช้ <strong>{selectedUser?.full_name || selectedUser?.username}</strong> ใช่หรือไม่?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            การลบจะเปลี่ยนสถานะเป็น Inactive แทนการลบจริง
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            ยืนยันการลบ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagementPage;
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Button, TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem, Pagination, Alert, CircularProgress,
  Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, AppBar, Toolbar,
  Badge, Menu, MenuItem as MenuItemMUI, Divider, Snackbar, Tooltip, Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, LocalHospital, Medication, CalendarMonth, Assessment,
  Settings, Notifications, Search, Add, Edit, Delete, FilterList, FileDownload, Refresh,
  AccountCircle, Logout, Close, Save, MoreVert, Visibility, Warning, CheckCircle, ArrowBack,SupportAgent as SupportTicketsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAdminData, logout } from '../utils/auth';
import { getDashboardStats } from '../services/api';
import {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from '../services/api';

const DRAWER_WIDTH = 260;

const MedicationsPage = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState(null);
  
  // States for medicines
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination & Filter
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    medication_id: '',
    name: '',
    generic_name: '',
    category: '',
    form: '',
    strength: '',
    manufacturer: '',
    description: '',
    dosage_instructions: '',
    side_effects: '',
    contraindications: '',
    interactions: '',
    image_url: '',
    status: 'active'
  });
  
  const [selectedMenu, setSelectedMenu] = useState('medications');
  const [anchorEl, setAnchorEl] = useState(null);

  // Categories and Status options
  const categories = ['ED', 'NED', 'Other'];
  const statuses = [
    { value: 'active', label: 'ใช้งาน', color: '#16a34a' },
    { value: 'discontinued', label: 'หยุดจำหน่าย', color: '#dc2626' },
    { value: 'unavailable', label: 'ไม่พร้อมใช้งาน', color: '#f59e0b' }
  ];

  useEffect(() => {
    const data = getAdminData();
    if (!data) {
      navigate('/');
    } else {
      setAdminData(data);
      loadDashboardStats();
      loadMedicines();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, page, searchTerm, filterCategory, filterStatus]);

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

  // Load medicines from API
  const loadMedicines = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(filterCategory && { category: filterCategory }),
        ...(filterStatus && { status: filterStatus })
      };
      
      const response = await getAllMedicines(params);
      
      if (response.success) {
        setMedicines(response.data.medicines);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
      } else {
        setError(response.message || 'ไม่สามารถโหลดข้อมูลยาได้');
      }
    } catch (err) {
      console.error('Error loading medicines:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  // Handle filter
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'category') {
      setFilterCategory(value);
    } else if (filterType === 'status') {
      setFilterStatus(value);
    }
    setPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterStatus('');
    setPage(1);
  };

  // Handle form input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      medication_id: '',
      name: '',
      generic_name: '',
      category: '',
      form: '',
      strength: '',
      manufacturer: '',
      description: '',
      dosage_instructions: '',
      side_effects: '',
      contraindications: '',
      interactions: '',
      image_url: '',
      status: 'active'
    });
  };

  // Open Add Dialog
  const handleOpenAddDialog = () => {
    resetForm();
    setOpenAddDialog(true);
  };

  // Open Edit Dialog
  const handleOpenEditDialog = async (medicine) => {
    try {
      const response = await getMedicineById(medicine.medication_id);
      if (response.success) {
        setFormData(response.data);
        setSelectedMedicine(response.data);
        setOpenEditDialog(true);
      }
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลยาได้');
    }
  };

  // Open View Dialog
  const handleOpenViewDialog = async (medicine) => {
    try {
      const response = await getMedicineById(medicine.medication_id);
      if (response.success) {
        setSelectedMedicine(response.data);
        setOpenViewDialog(true);
      }
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลยาได้');
    }
  };

  // Open Delete Dialog
  const handleOpenDeleteDialog = (medicine) => {
    setSelectedMedicine(medicine);
    setOpenDeleteDialog(true);
  };

  // Handle Add Medicine
  const handleAddMedicine = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!formData.medication_id || !formData.name) {
        setError('กรุณากรอก medication_id และชื่อยา');
        setLoading(false);
        return;
      }
      
      const response = await createMedicine(formData);
      
      if (response.success) {
        setSuccess('เพิ่มยาสำเร็จ');
        setOpenAddDialog(false);
        resetForm();
        loadMedicines();
      } else {
        setError(response.message || 'ไม่สามารถเพิ่มยาได้');
      }
    } catch (err) {
      console.error('Error adding medicine:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มยา');
    } finally {
      setLoading(false);
    }
  };

  // Handle Update Medicine
  const handleUpdateMedicine = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await updateMedicine(selectedMedicine.medication_id, formData);
      
      if (response.success) {
        setSuccess('แก้ไขข้อมูลยาสำเร็จ');
        setOpenEditDialog(false);
        loadMedicines();
      } else {
        setError(response.message || 'ไม่สามารถแก้ไขข้อมูลยาได้');
      }
    } catch (err) {
      console.error('Error updating medicine:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Medicine
  const handleDeleteMedicine = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await deleteMedicine(selectedMedicine.medication_id);
      
      if (response.success) {
        setSuccess('ลบยาสำเร็จ');
        setOpenDeleteDialog(false);
        loadMedicines();
      } else {
        setError(response.message || 'ไม่สามารถลบยาได้');
      }
    } catch (err) {
      console.error('Error deleting medicine:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบยา');
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

const handleExport = async () => {
  try {
    const response = await getAllMedicines({ page: 1, limit: 9999 });
    const allMedicines = response.data.medicines;

    const headers = ['รหัสยา', 'ชื่อยา', 'ชื่อสามัญ', 'หมวดหมู่', 'รูปแบบ', 'ความแรง', 'ผู้ผลิต', 'สถานะ'];
    const rows = allMedicines.map(m => [
      m.medication_id,
      m.name,
      m.generic_name || '',
      m.category || '',
      m.form || '',
      m.strength || '',
      m.manufacturer || '',
      statuses.find(s => s.value === m.status)?.label || m.status,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medications_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    setError('ไม่สามารถ export ข้อมูลได้');
  }
};


  const handleMenuClick = (menuValue) => {
    setSelectedMenu(menuValue);
    
    if (menuValue === 'dashboard') {
      navigate('/dashboard');
    } else if (menuValue === 'users') {
      navigate('/users');
    } else if (menuValue === 'appointments') {
      navigate('/appointments');
    } else if (menuValue === 'support-tickets') {
      navigate('/support-tickets');
    } else if (menuValue === 'documents') {
      navigate('/documents');
    } else if (menuValue === 'reports') {
      navigate('/reports');
    } else if (menuValue === 'approvals') {
      navigate('/approvals');
    } else if (menuValue === 'settings') {
      navigate('/settings');
    }
  };

  const menuItems = [
  { icon: <DashboardIcon />, label: 'Dashboard', value: 'dashboard' },
  { icon: <People />, label: 'จัดการผู้ใช้งาน', value: 'users' },
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
              จัดการยา
            </Typography>
            
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Refresh */}
              <Tooltip title="รีเฟรช">
                <IconButton onClick={loadMedicines}>
                  <Refresh />
                </IconButton>
              </Tooltip>

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
                <MenuItemMUI onClick={handleMenuClose}>
                  <Settings sx={{ mr: 1, fontSize: 20 }} />
                  ตั้งค่า
                </MenuItemMUI>
                <Divider />
                <MenuItemMUI onClick={handleLogout}>
                  <Logout sx={{ mr: 1, fontSize: 20 }} />
                  ออกจากระบบ
                </MenuItemMUI>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          {/* Filter & Actions Bar */}
          <Card sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search */}
              <TextField
                size="small"
                placeholder="ค้นหายา (ชื่อยา หรือชื่อสามัญ)"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{
                  width: 300,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                    fontSize: 14,
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

              {/* Category Filter */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>หมวดหมู่</InputLabel>
                <Select
                  value={filterCategory}
                  label="หมวดหมู่"
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <MenuItemMUI value="">ทั้งหมด</MenuItemMUI>
                  {categories.map((cat) => (
                    <MenuItemMUI key={cat} value={cat}>{cat}</MenuItemMUI>
                  ))}
                </Select>
              </FormControl>

              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>สถานะ</InputLabel>
                <Select
                  value={filterStatus}
                  label="สถานะ"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItemMUI value="">ทั้งหมด</MenuItemMUI>
                  {statuses.map((status) => (
                    <MenuItemMUI key={status.value} value={status.value}>
                      {status.label}
                    </MenuItemMUI>
                  ))}
                </Select>
              </FormControl>

              {/* Reset Filters */}
              {(searchTerm || filterCategory || filterStatus) && (
                <Button
                  size="small"
                  onClick={handleResetFilters}
                  sx={{ textTransform: 'none' }}
                >
                  ล้างตัวกรอง
                </Button>
              )}

              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                {/* Export */}
                <Button
                  variant="outlined"
                  startIcon={<FileDownload />}
                  onClick={handleExport} 
                  sx={{
                    textTransform: 'none',
                    borderColor: '#e2e8f0',
                    color: '#475569',
                  }}
                >
                  Export
                </Button>

                {/* Add Medicine */}
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleOpenAddDialog}
                  sx={{
                    bgcolor: '#6366f1',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#4f46e5' },
                  }}
                >
                  เพิ่มยาใหม่
                </Button>
              </Box>
            </Box>

            {/* Results Info */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                แสดง {medicines.length} รายการ จากทั้งหมด {totalItems} รายการ
              </Typography>
            </Box>
          </Card>

          {/* Medicines Table */}
          <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : medicines.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 5 }}>
                <Typography sx={{ color: '#64748b' }}>
                  ไม่พบข้อมูลยา
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>
                          รหัสยา
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>
                          ชื่อยา
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>
                          ชื่อสามัญ
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>
                          หมวดหมู่
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>
                          รูปแบบ
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>
                          ความแรง
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>
                          สถานะ
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }} align="right">
                          จัดการ
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {medicines.map((medicine) => {
                        const statusInfo = statuses.find(s => s.value === medicine.status);
                        return (
                          <TableRow key={medicine.medication_id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                            <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                              {medicine.medication_id}
                            </TableCell>
                            <TableCell sx={{ fontSize: 13 }}>
                              {medicine.name}
                            </TableCell>
                            <TableCell sx={{ fontSize: 13, color: '#64748b' }}>
                              {medicine.generic_name || '-'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={medicine.category || 'N/A'}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: 11,
                                  bgcolor: '#e0f2fe',
                                  color: '#0284c7',
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: 13, color: '#64748b' }}>
                              {medicine.form || '-'}
                            </TableCell>
                            <TableCell sx={{ fontSize: 13, color: '#64748b' }}>
                              {medicine.strength || '-'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={statusInfo?.label || medicine.status}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: 11,
                                  bgcolor: `${statusInfo?.color}15`,
                                  color: statusInfo?.color,
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="ดูรายละเอียด">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleOpenViewDialog(medicine)}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="แก้ไข">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleOpenEditDialog(medicine)}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="ลบ">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleOpenDeleteDialog(medicine)}
                                  sx={{ color: '#ef4444' }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              </>
            )}
          </Card>
        </Box>
      </Box>


      {/* Add Medicine Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
              เพิ่มยาใหม่
            </Typography>
            <IconButton onClick={() => setOpenAddDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Required Fields */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                required
                label="รหัสยา (Medication ID)"
                value={formData.medication_id}
                onChange={(e) => handleInputChange('medication_id', e.target.value)}
                placeholder="เช่น MS01ED0161"
                helperText="ความยาวไม่เกิน 20 ตัวอักษร"
              />
              <TextField
                required
                label="ชื่อยา"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                helperText="ความยาวไม่เกิน 50 ตัวอักษร"
              />
            </Box>

            {/* Optional Fields */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="ชื่อสามัญ"
                value={formData.generic_name}
                onChange={(e) => handleInputChange('generic_name', e.target.value)}
              />
              <FormControl>
                <InputLabel>หมวดหมู่</InputLabel>
                <Select
                  value={formData.category}
                  label="หมวดหมู่"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map((cat) => (
                    <MenuItemMUI key={cat} value={cat}>{cat}</MenuItemMUI>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="รูปแบบ (Form)"
                value={formData.form}
                onChange={(e) => handleInputChange('form', e.target.value)}
                placeholder="เช่น eye drop, tablet"
              />
              <TextField
                label="ความแรง (Strength)"
                value={formData.strength}
                onChange={(e) => handleInputChange('strength', e.target.value)}
                placeholder="เช่น 0.5%, 500mg"
              />
            </Box>

            <TextField
              label="ผู้ผลิต"
              value={formData.manufacturer}
              onChange={(e) => handleInputChange('manufacturer', e.target.value)}
            />

            <TextField
              label="คำอธิบาย"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={2}
            />

            <TextField
              label="วิธีใช้ยา"
              value={formData.dosage_instructions}
              onChange={(e) => handleInputChange('dosage_instructions', e.target.value)}
              multiline
              rows={2}
            />

            <TextField
              label="ผลข้างเคียง"
              value={formData.side_effects}
              onChange={(e) => handleInputChange('side_effects', e.target.value)}
              multiline
              rows={2}
            />

            <TextField
              label="ข้อห้ามใช้"
              value={formData.contraindications}
              onChange={(e) => handleInputChange('contraindications', e.target.value)}
              multiline
              rows={2}
            />

            <TextField
              label="ปฏิกิริยาระหว่างยา"
              value={formData.interactions}
              onChange={(e) => handleInputChange('interactions', e.target.value)}
              multiline
              rows={2}
            />

            <TextField
              label="URL รูปภาพ"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />

            <FormControl>
              <InputLabel>สถานะ</InputLabel>
              <Select
                value={formData.status}
                label="สถานะ"
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                {statuses.map((status) => (
                  <MenuItemMUI key={status.value} value={status.value}>
                    {status.label}
                  </MenuItemMUI>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenAddDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            ยกเลิก
          </Button>
          <Button 
            variant="contained"
            startIcon={<Save />}
            onClick={handleAddMedicine}
            disabled={loading || !formData.medication_id || !formData.name}
            sx={{
              bgcolor: '#6366f1',
              textTransform: 'none',
              '&:hover': { bgcolor: '#4f46e5' },
            }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Medicine Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
              แก้ไขข้อมูลยา
            </Typography>
            <IconButton onClick={() => setOpenEditDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Show medication_id (read-only) */}
            <TextField
              label="รหัสยา (Medication ID)"
              value={formData.medication_id}
              disabled
              helperText="ไม่สามารถแก้ไขรหัสยาได้"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                required
                label="ชื่อยา"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              <TextField
                label="ชื่อสามัญ"
                value={formData.generic_name}
                onChange={(e) => handleInputChange('generic_name', e.target.value)}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl>
                <InputLabel>หมวดหมู่</InputLabel>
                <Select
                  value={formData.category}
                  label="หมวดหมู่"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map((cat) => (
                    <MenuItemMUI key={cat} value={cat}>{cat}</MenuItemMUI>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="รูปแบบ (Form)"
                value={formData.form}
                onChange={(e) => handleInputChange('form', e.target.value)}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="ความแรง (Strength)"
                value={formData.strength}
                onChange={(e) => handleInputChange('strength', e.target.value)}
              />
              <TextField
                label="ผู้ผลิต"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              />
            </Box>

            <TextField
              label="คำอธิบาย"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={2}
            />

            <TextField
              label="วิธีใช้ยา"
              value={formData.dosage_instructions}
              onChange={(e) => handleInputChange('dosage_instructions', e.target.value)}
              multiline
              rows={2}
            />

            <TextField
              label="ผลข้างเคียง"
              value={formData.side_effects}
              onChange={(e) => handleInputChange('side_effects', e.target.value)}
              multiline
              rows={2}
            />

            <TextField
              label="ข้อห้ามใช้"
              value={formData.contraindications}
              onChange={(e) => handleInputChange('contraindications', e.target.value)}
              multiline
              rows={2}
            />

            <TextField
              label="ปฏิกิริยาระหว่างยา"
              value={formData.interactions}
              onChange={(e) => handleInputChange('interactions', e.target.value)}
              multiline
              rows={2}
            />

            <TextField
              label="URL รูปภาพ"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
            />

            <FormControl>
              <InputLabel>สถานะ</InputLabel>
              <Select
                value={formData.status}
                label="สถานะ"
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                {statuses.map((status) => (
                  <MenuItemMUI key={status.value} value={status.value}>
                    {status.label}
                  </MenuItemMUI>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenEditDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            ยกเลิก
          </Button>
          <Button 
            variant="contained"
            startIcon={<Save />}
            onClick={handleUpdateMedicine}
            disabled={loading || !formData.name}
            sx={{
              bgcolor: '#6366f1',
              textTransform: 'none',
              '&:hover': { bgcolor: '#4f46e5' },
            }}
          >
            บันทึกการแก้ไข
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Medicine Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
              รายละเอียดยา
            </Typography>
            <IconButton onClick={() => setOpenViewDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedMedicine && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>รหัสยา:</Typography>
                <Typography>{selectedMedicine.medication_id}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>ชื่อยา:</Typography>
                <Typography>{selectedMedicine.name}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>ชื่อสามัญ:</Typography>
                <Typography>{selectedMedicine.generic_name || '-'}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>หมวดหมู่:</Typography>
                <Typography>{selectedMedicine.category || '-'}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>รูปแบบ:</Typography>
                <Typography>{selectedMedicine.form || '-'}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>ความแรง:</Typography>
                <Typography>{selectedMedicine.strength || '-'}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>ผู้ผลิต:</Typography>
                <Typography>{selectedMedicine.manufacturer || '-'}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>คำอธิบาย:</Typography>
                <Typography>{selectedMedicine.description || '-'}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>วิธีใช้ยา:</Typography>
                <Typography>{selectedMedicine.dosage_instructions || '-'}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>ผลข้างเคียง:</Typography>
                <Typography>{selectedMedicine.side_effects || '-'}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>ข้อห้ามใช้:</Typography>
                <Typography>{selectedMedicine.contraindications || '-'}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>ปฏิกิริยาระหว่างยา:</Typography>
                <Typography>{selectedMedicine.interactions || '-'}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>สถานะ:</Typography>
                <Chip
                  label={statuses.find(s => s.value === selectedMedicine.status)?.label || selectedMedicine.status}
                  size="small"
                  sx={{
                    bgcolor: `${statuses.find(s => s.value === selectedMedicine.status)?.color}15`,
                    color: statuses.find(s => s.value === selectedMedicine.status)?.color,
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenViewDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            ปิด
          </Button>
          <Button 
            variant="contained"
            startIcon={<Edit />}
            onClick={() => {
              setOpenViewDialog(false);
              handleOpenEditDialog(selectedMedicine);
            }}
            sx={{
              bgcolor: '#6366f1',
              textTransform: 'none',
              '&:hover': { bgcolor: '#4f46e5' },
            }}
          >
            แก้ไข
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ color: '#ef4444' }} />
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
              ยืนยันการลบยา
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            คุณต้องการลบยา <strong>{selectedMedicine?.name}</strong> ({selectedMedicine?.medication_id}) หรือไม่?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            ระบบจะเปลี่ยนสถานะเป็น "discontinued" แทนการลบถาวร
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            ยกเลิก
          </Button>
          <Button 
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={handleDeleteMedicine}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            ลบยา
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Success/Error Messages */}
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

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MedicationsPage;
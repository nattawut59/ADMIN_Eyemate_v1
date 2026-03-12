import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton,
  AppBar, Toolbar, Badge, Menu, MenuItem, CircularProgress, Alert, Divider,
  Avatar, InputAdornment, Paper, Snackbar, Tooltip,
  Select, FormControl, InputLabel, FormHelperText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, Medication, CalendarMonth,
  Assessment, Settings, Notifications, Search, CheckCircle,
  Refresh, AccountCircle, Logout, FileDownload, Add, Delete,
  PictureAsPdf, CloudUpload, Close, Visibility, ArrowBack,
  Person, LocalHospital, CalendarToday, RemoveRedEye,
  SupportAgent as SupportTicketsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAdminData, logout } from '../utils/auth';
import { getDashboardStats, getPatientsList, getDoctorsList } from '../services/api';
import api from '../services/api';

const DRAWER_WIDTH = 260;

const SpecialTestsPage = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState(null);
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState('documents');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [octCount, setOctCount] = useState(0);
  const [ctvfCount, setCtvfCount] = useState(0);
  const [otherCount, setOtherCount] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  // Dialogs
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // Upload Form
  const [uploadForm, setUploadForm] = useState({
    patient_id: '',
    doctor_id: '',
    test_date: new Date().toISOString().split('T')[0],
    test_type: '',
    eye: '',
    notes: '',
    pdf_file: null,
  });
  const [uploadErrors, setUploadErrors] = useState({});

  useEffect(() => {
    const data = getAdminData();
    setAdminData(data);
    loadDashboardStats();
    loadTests();
    loadPatientsList();
    loadDoctorsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, filterType]);

  const loadDashboardStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  const loadTests = async () => {
    setLoading(true);
    setError('');

    try {
      const params = { page, limit: 10, search: searchQuery, test_type: filterType };
      const response = await api.get('/api/special-tests', { params });

      if (response.data.success) {
        setTests(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      }

      // ดึง count แยกตาม type
      const [octRes, ctvfRes, allRes] = await Promise.all([
        api.get('/api/special-tests', { params: { limit: 1, test_type: 'OCT' } }),
        api.get('/api/special-tests', { params: { limit: 1, test_type: 'CTVF' } }),
        api.get('/api/special-tests', { params: { limit: 1 } }),
      ]);
      const octTotal = octRes.data.pagination?.total || 0;
      const ctvfTotal = ctvfRes.data.pagination?.total || 0;
      const allTotal = allRes.data.pagination?.total || 0;
      setOctCount(octTotal);
      setCtvfCount(ctvfTotal);
      setOtherCount(allTotal - octTotal - ctvfTotal);

    } catch (err) {
      console.error('Error loading tests:', err);
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientsList = async () => {
    try {
      const response = await getPatientsList();
      if (response.success) {
        setPatients(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error loading patients:', err);
      setPatients([]);
    }
  };

  const loadDoctorsList = async () => {
    try {
      const response = await getDoctorsList();
      if (response.success) {
        setDoctors(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error loading doctors:', err);
      setDoctors([]);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadErrors({ ...uploadErrors, pdf_file: 'กรุณาเลือกไฟล์ PDF เท่านั้น' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadErrors({ ...uploadErrors, pdf_file: 'ขนาดไฟล์ต้องไม่เกิน 10MB' });
        return;
      }
      setUploadForm({ ...uploadForm, pdf_file: file });
      setUploadErrors({ ...uploadErrors, pdf_file: '' });
    }
  };

  const validateUploadForm = () => {
    const errors = {};
    if (!uploadForm.patient_id) errors.patient_id = 'กรุณาเลือกผู้ป่วย';
    if (!uploadForm.doctor_id) errors.doctor_id = 'กรุณาเลือกแพทย์';
    if (!uploadForm.test_date) errors.test_date = 'กรุณาเลือกวันที่ตรวจ';
    if (!uploadForm.test_type) errors.test_type = 'กรุณาเลือกประเภทการตรวจ';
    if (!uploadForm.eye) errors.eye = 'กรุณาเลือกตาที่ตรวจ';
    if (!uploadForm.pdf_file) errors.pdf_file = 'กรุณาเลือกไฟล์ PDF';
    setUploadErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpload = async () => {
    if (!validateUploadForm()) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('patient_id', uploadForm.patient_id);
      formData.append('doctor_id', uploadForm.doctor_id);
      formData.append('test_date', uploadForm.test_date);
      formData.append('test_type', uploadForm.test_type);
      formData.append('eye', uploadForm.eye);
      formData.append('notes', uploadForm.notes);
      formData.append('pdf_file', uploadForm.pdf_file);

      const response = await api.post('/api/special-tests/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setSuccess('อัปโหลดผลการตรวจสำเร็จ');
        setUploadDialogOpen(false);
        resetUploadForm();
        loadTests();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถอัปโหลดไฟล์ได้');
    } finally {
      setLoading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      patient_id: '',
      doctor_id: '',
      test_date: new Date().toISOString().split('T')[0],
      test_type: '',
      eye: '',
      notes: '',
      pdf_file: null,
    });
    setUploadErrors({});
  };

  const handleDelete = async (testId) => {
    if (!window.confirm('คุณต้องการลบผลการตรวจนี้หรือไม่?')) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.delete(`/api/special-tests/${testId}`);
      if (response.data.success) {
        setSuccess('ลบผลการตรวจสำเร็จ');
        loadTests();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถลบผลการตรวจได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (testId) => {
    try {
      const response = await api.get(`/api/special-tests/${testId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `test-${testId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('ไม่สามารถดาวน์โหลดไฟล์ได้');
    }
  };

  const handleViewDetail = (test) => {
    setSelectedTest(test);
    setDetailDialogOpen(true);
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) logout();
  };

  const handleMenuClick = (menuValue) => {
    setSelectedMenu(menuValue);
    const routes = {
      dashboard: '/dashboard', users: '/users', medications: '/medications',
      appointments: '/appointments', reports: '/reports', approvals: '/approvals',
      'support-tickets': '/support-tickets', settings: '/settings',
    };
    if (routes[menuValue]) navigate(routes[menuValue]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getTestTypeLabel = (type) => {
    const types = { OCT: 'OCT', CTVF: 'Visual Field Test', Pachymetry: 'Pachymetry', Gonioscopy: 'Gonioscopy', Other: 'อื่นๆ' };
    return types[type] || type;
  };

  const getEyeLabel = (eye) => {
    const eyes = { left: 'ตาซ้าย', right: 'ตาขวา', both: 'ทั้งสองข้าง' };
    return eyes[eye] || eye;
  };

  const getTypeChip = (type) => {
    const config = {
      OCT: { color: '#2563eb', bgcolor: '#dbeafe' },
      CTVF: { color: '#d97706', bgcolor: '#fef3c7' },
      Pachymetry: { color: '#16a34a', bgcolor: '#dcfce7' },
      Gonioscopy: { color: '#7c3aed', bgcolor: '#ede9fe' },
      Other: { color: '#6366f1', bgcolor: '#e0e7ff' },
    };
    const c = config[type] || config.Other;
    return (
      <Chip label={getTestTypeLabel(type)} size="small"
        sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: c.bgcolor, color: c.color }} />
    );
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
                sx={{
                  borderRadius: 2, color: selectedMenu === item.value ? '#fff' : '#94a3b8',
                  bgcolor: selectedMenu === item.value ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
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

        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#6366f1' }}>
              {adminData?.username?.charAt(0).toUpperCase()}
            </Avatar>
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
            <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>จัดการไฟล์/เอกสาร</Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField size="small" placeholder="ค้นหาชื่อผู้ป่วย, HN..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: 300, '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', fontSize: 14, '& fieldset': { borderColor: '#e2e8f0' } } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20, color: '#64748b' }} /></InputAdornment> }}
              />
              <Tooltip title="รีเฟรช"><IconButton onClick={loadTests}><Refresh /></IconButton></Tooltip>
              <IconButton><Badge badgeContent={0} color="error"><Notifications /></Badge></IconButton>
              <IconButton onClick={handleMenuOpen}><AccountCircle /></IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose}><Settings sx={{ mr: 1, fontSize: 20 }} />ตั้งค่า</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}><Logout sx={{ mr: 1, fontSize: 20 }} />ออกจากระบบ</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
            <Card sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#ede9fe15', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PictureAsPdf />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{total}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#64748b' }}>ไฟล์ทั้งหมด</Typography>
                </Box>
              </Box>
            </Card>
            <Card sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#dbeafe15', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RemoveRedEye />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{octCount}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#64748b' }}>OCT</Typography>
                </Box>
              </Box>
            </Card>
            <Card sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#fef3c715', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Visibility />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{ctvfCount}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#64748b' }}>Visual Field</Typography>
                </Box>
              </Box>
            </Card>
            <Card sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#dcfce715', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{otherCount}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#64748b' }}>การตรวจอื่นๆ</Typography>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Main Card */}
          <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} displayEmpty sx={{ bgcolor: '#f8fafc', fontSize: 14 }}>
                  <MenuItem value="">ประเภทการตรวจทั้งหมด</MenuItem>
                  <MenuItem value="OCT">OCT</MenuItem>
                  <MenuItem value="CTVF">Visual Field Test</MenuItem>
                  <MenuItem value="Pachymetry">Pachymetry</MenuItem>
                  <MenuItem value="Gonioscopy">Gonioscopy</MenuItem>
                  <MenuItem value="Other">อื่นๆ</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" startIcon={<Add />} onClick={() => setUploadDialogOpen(true)}
                sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5' } }}>
                อัปโหลดไฟล์
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : tests.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <PictureAsPdf sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
                <Typography sx={{ color: '#64748b', mb: 2 }}>ไม่พบผลการตรวจ</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setUploadDialogOpen(true)}
                  sx={{ bgcolor: '#6366f1', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5' } }}>
                  อัปโหลดไฟล์แรก
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>HN</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>ชื่อผู้ป่วย</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>ประเภทการตรวจ</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>ตาที่ตรวจ</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>แพทย์ผู้ตรวจ</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b' }}>วันที่ตรวจ</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#64748b', textAlign: 'right' }}>จัดการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tests.map((test) => (
                      <TableRow key={test.test_id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{test.patient_hn}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{test.patient_name}</TableCell>
                        <TableCell>{getTypeChip(test.test_type)}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{getEyeLabel(test.eye)}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{test.doctor_name}</TableCell>
                        <TableCell sx={{ fontSize: 13, color: '#64748b' }}>{formatDate(test.test_date)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <Tooltip title="ดูรายละเอียด">
                              <IconButton size="small" onClick={() => handleViewDetail(test)}><Visibility fontSize="small" /></IconButton>
                            </Tooltip>
                            <Tooltip title="ดาวน์โหลด">
                              <IconButton size="small" color="success" onClick={() => handleDownload(test.test_id)}><FileDownload fontSize="small" /></IconButton>
                            </Tooltip>
                            <Tooltip title="ลบ">
                              <IconButton size="small" color="error" onClick={() => handleDelete(test.test_id)}><Delete fontSize="small" /></IconButton>
                            </Tooltip>
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

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => { setUploadDialogOpen(false); resetUploadForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>อัปโหลดผลการตรวจใหม่</Typography>
            <IconButton size="small" onClick={() => { setUploadDialogOpen(false); resetUploadForm(); }}><Close /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth error={!!uploadErrors.patient_id}>
              <InputLabel>ผู้ป่วย *</InputLabel>
              <Select value={uploadForm.patient_id} onChange={(e) => setUploadForm({ ...uploadForm, patient_id: e.target.value })} label="ผู้ป่วย *">
                <MenuItem value="">เลือกผู้ป่วย</MenuItem>
                {patients.map((patient) => (
                  <MenuItem key={patient.patient_id} value={patient.patient_id}>
                    {patient.patient_hn} - {patient.patient_name}
                  </MenuItem>
                ))}
              </Select>
              {uploadErrors.patient_id && <FormHelperText>{uploadErrors.patient_id}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={!!uploadErrors.doctor_id}>
              <InputLabel>แพทย์ผู้ตรวจ *</InputLabel>
              <Select value={uploadForm.doctor_id} onChange={(e) => setUploadForm({ ...uploadForm, doctor_id: e.target.value })} label="แพทย์ผู้ตรวจ *">
                <MenuItem value="">เลือกแพทย์</MenuItem>
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.doctor_id} value={doctor.doctor_id}>
                    {doctor.doctor_name}
                  </MenuItem>
                ))}
              </Select>
              {uploadErrors.doctor_id && <FormHelperText>{uploadErrors.doctor_id}</FormHelperText>}
            </FormControl>

            <TextField fullWidth type="date" label="วันที่ตรวจ *" value={uploadForm.test_date}
              onChange={(e) => setUploadForm({ ...uploadForm, test_date: e.target.value })}
              InputLabelProps={{ shrink: true }} error={!!uploadErrors.test_date} helperText={uploadErrors.test_date} />

            <FormControl fullWidth error={!!uploadErrors.test_type}>
              <InputLabel>ประเภทการตรวจ *</InputLabel>
              <Select value={uploadForm.test_type} onChange={(e) => setUploadForm({ ...uploadForm, test_type: e.target.value })} label="ประเภทการตรวจ *">
                <MenuItem value="">เลือกประเภทการตรวจ</MenuItem>
                <MenuItem value="OCT">OCT</MenuItem>
                <MenuItem value="CTVF">Visual Field Test</MenuItem>
                <MenuItem value="Pachymetry">Pachymetry</MenuItem>
                <MenuItem value="Gonioscopy">Gonioscopy</MenuItem>
                <MenuItem value="Other">อื่นๆ</MenuItem>
              </Select>
              {uploadErrors.test_type && <FormHelperText>{uploadErrors.test_type}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={!!uploadErrors.eye}>
              <InputLabel>ตาที่ตรวจ *</InputLabel>
              <Select value={uploadForm.eye} onChange={(e) => setUploadForm({ ...uploadForm, eye: e.target.value })} label="ตาที่ตรวจ *">
                <MenuItem value="">เลือกตาที่ตรวจ</MenuItem>
                <MenuItem value="left">ตาซ้าย</MenuItem>
                <MenuItem value="right">ตาขวา</MenuItem>
                <MenuItem value="both">ทั้งสองข้าง</MenuItem>
              </Select>
              {uploadErrors.eye && <FormHelperText>{uploadErrors.eye}</FormHelperText>}
            </FormControl>

            <TextField fullWidth multiline rows={3} label="หมายเหตุ" value={uploadForm.notes}
              onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
              placeholder="กรอกหมายเหตุเพิ่มเติม (ถ้ามี)" />

            <Box>
              <Button fullWidth variant="outlined" component="label" startIcon={<CloudUpload />}
                sx={{ height: 100, borderStyle: 'dashed', borderWidth: 2, borderColor: uploadErrors.pdf_file ? '#ef4444' : '#cbd5e1', color: '#64748b', '&:hover': { borderColor: uploadErrors.pdf_file ? '#dc2626' : '#94a3b8', bgcolor: '#f8fafc' } }}>
                <Box sx={{ textAlign: 'center' }}>
                  <PictureAsPdf sx={{ fontSize: 32, mb: 1, color: '#94a3b8' }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    {uploadForm.pdf_file ? uploadForm.pdf_file.name : 'เลือกไฟล์ PDF (ไม่เกิน 10MB)'}
                  </Typography>
                </Box>
                <input type="file" accept="application/pdf" hidden onChange={handleFileChange} />
              </Button>
              {uploadErrors.pdf_file && <Typography sx={{ fontSize: 12, color: '#ef4444', mt: 0.5, ml: 1.5 }}>{uploadErrors.pdf_file}</Typography>}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => { setUploadDialogOpen(false); resetUploadForm(); }} disabled={loading}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleUpload} disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <CloudUpload />}
            sx={{ bgcolor: '#6366f1', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5' } }}>
            {loading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>รายละเอียดผลการตรวจ</Typography>
            <IconButton size="small" onClick={() => setDetailDialogOpen(false)}><Close /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedTest && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper sx={{ p: 2, bgcolor: '#f8fafc' }}>
                <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1.5, fontWeight: 600 }}>ข้อมูลผู้ป่วย</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Person sx={{ color: '#6366f1', fontSize: 20 }} />
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{selectedTest.patient_name}</Typography>
                    <Typography sx={{ fontSize: 12, color: '#64748b' }}>HN: {selectedTest.patient_hn}</Typography>
                  </Box>
                </Box>
              </Paper>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>ประเภทการตรวจ</Typography>
                  {getTypeChip(selectedTest.test_type)}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>ตาที่ตรวจ</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{getEyeLabel(selectedTest.eye)}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>แพทย์ผู้ตรวจ</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospital sx={{ fontSize: 16, color: '#6366f1' }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{selectedTest.doctor_name}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>วันที่ตรวจ</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: '#6366f1' }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{formatDate(selectedTest.test_date)}</Typography>
                  </Box>
                </Box>
              </Box>

              {selectedTest.notes && (
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>หมายเหตุ</Typography>
                  <Paper sx={{ p: 1.5, bgcolor: '#fef3c7', border: '1px solid #fde047' }}>
                    <Typography sx={{ fontSize: 13 }}>{selectedTest.notes}</Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button variant="contained" onClick={() => handleDownload(selectedTest?.test_id)} startIcon={<FileDownload />}
            sx={{ bgcolor: '#16a34a', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#15803d' } }}>
            ดาวน์โหลด PDF
          </Button>
          <Button onClick={() => setDetailDialogOpen(false)}>ปิด</Button>
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

export default SpecialTestsPage;
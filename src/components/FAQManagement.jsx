import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Switch, Chip, Alert, Snackbar,
} from '@mui/material';
import { Add, Edit, Delete, Help, DragIndicator } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/api';

const categories = [
  { value: 'login', label: '🔐 การเข้าใช้งานแอพ', icon: '🔐' },
  { value: 'appointment', label: '📅 การนัดหมายแพทย์', icon: '📅' },
  { value: 'medication', label: '💊 การรับประทานยา', icon: '💊' },
  { value: 'upload', label: '📸 การอัปโหลดผลตรวจ', icon: '📸' },
  { value: 'notification', label: '🔔 การตั้งค่าการแจ้งเตือน', icon: '🔔' },
  { value: 'profile', label: '👤 การเปลี่ยนข้อมูลส่วนตัว', icon: '👤' },
  { value: 'other', label: '❓ อื่นๆ', icon: '❓' },
];

const FAQManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState({
    faq_id: null,
    category: 'login',
    question: '',
    answer: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_BASE_URL}/faqs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.success) {
      // แก้ตรงนี้ - รองรับทั้ง array ตรง และ object ที่มี data
      const data = response.data.data;
      setFaqs(Array.isArray(data) ? data : data?.faqs || data?.items || []);
    }
  } catch (err) {
    console.error('Error loading FAQs:', err);
    setError('ไม่สามารถโหลดข้อมูลได้');
    setFaqs([]); // ✅ เพิ่ม fallback ป้องกัน crash
  } finally {
    setLoading(false);
  }
};

  const handleOpenDialog = (faq = null) => {
    if (faq) {
      setEditMode(true);
      setCurrentFAQ(faq);
    } else {
      setEditMode(false);
      setCurrentFAQ({
        faq_id: null,
        category: 'login',
        question: '',
        answer: '',
        is_active: true,
        display_order: faqs.length,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentFAQ({
      faq_id: null,
      category: 'login',
      question: '',
      answer: '',
      is_active: true,
      display_order: 0,
    });
  };

  const handleSave = async () => {
    // Validation
    if (!currentFAQ.question || !currentFAQ.answer) {
      setError('กรุณากรอกคำถามและคำตอบ');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      let response;

      if (editMode) {
        // Update
        response = await axios.put(
          `${API_BASE_URL}/faqs/${currentFAQ.faq_id}`,
          currentFAQ,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Create
        response = await axios.post(
          `${API_BASE_URL}/faqs`,
          currentFAQ,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      if (response.data.success) {
        setSuccess(editMode ? 'แก้ไขสำเร็จ' : 'เพิ่มสำเร็จ');
        loadFAQs();
        handleCloseDialog();
      }
    } catch (err) {
      console.error('Error saving FAQ:', err);
      setError(err.response?.data?.message || 'ไม่สามารถบันทึกได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (faqId) => {
    if (!window.confirm('คุณต้องการลบคำถามนี้หรือไม่?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`${API_BASE_URL}/faqs/${faqId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuccess('ลบสำเร็จ');
        loadFAQs();
      }
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      setError(err.response?.data?.message || 'ไม่สามารถลบได้');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (faq) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${API_BASE_URL}/faqs/${faq.faq_id}`,
        { ...faq, is_active: !faq.is_active },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        loadFAQs();
      }
    } catch (err) {
      console.error('Error toggling FAQ:', err);
      setError('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const getCategoryLabel = (value) => {
    return categories.find((c) => c.value === value)?.label || value;
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

      {/* FAQ Management */}
      <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Help sx={{ color: '#6366f1' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              จัดการ FAQs
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
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
            เพิ่มคำถาม
          </Button>
        </Box>

        <Typography sx={{ fontSize: 14, color: '#64748b', mb: 3 }}>
          จัดการคำถามที่พบบ่อยสำหรับผู้ใช้งาน
        </Typography>

        {faqs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Help sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography sx={{ fontSize: 16, color: '#64748b', mb: 1 }}>
              ยังไม่มีคำถาม
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>
              เริ่มต้นด้วยการเพิ่มคำถามแรก
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13, width: 50 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>หมวดหมู่</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>คำถาม</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>สถานะ</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13, width: 150 }}>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {faqs.map((faq, index) => (
                  <TableRow key={faq.faq_id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                    <TableCell>
                      <DragIndicator sx={{ color: '#cbd5e1', cursor: 'move' }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryLabel(faq.category)}
                        size="small"
                        sx={{
                          bgcolor: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                        {faq.question}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={faq.is_active}
                        onChange={() => handleToggleActive(faq)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(faq)}
                          sx={{ color: '#6366f1' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(faq.faq_id)}
                          sx={{ color: '#ef4444' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'แก้ไขคำถาม' : 'เพิ่มคำถามใหม่'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>หมวดหมู่</InputLabel>
              <Select
                value={currentFAQ.category}
                onChange={(e) => setCurrentFAQ({ ...currentFAQ, category: e.target.value })}
                label="หมวดหมู่"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="คำถาม"
              value={currentFAQ.question}
              onChange={(e) => setCurrentFAQ({ ...currentFAQ, question: e.target.value })}
              multiline
              rows={2}
            />

            <TextField
              fullWidth
              label="คำตอบ"
              value={currentFAQ.answer}
              onChange={(e) => setCurrentFAQ({ ...currentFAQ, answer: e.target.value })}
              multiline
              rows={4}
            />

            <FormControl fullWidth>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  แสดงบนแอพ
                </Typography>
                <Switch
                  checked={currentFAQ.is_active}
                  onChange={(e) => setCurrentFAQ({ ...currentFAQ, is_active: e.target.checked })}
                />
              </Box>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ยกเลิก</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {editMode ? 'บันทึก' : 'เพิ่ม'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FAQManagement;
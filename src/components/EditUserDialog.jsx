// src/components/EditUserDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Alert,
  Grid, CircularProgress, IconButton, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Divider,
} from '@mui/material';
import {
  Close, Save, Visibility, VisibilityOff,
} from '@mui/icons-material';
import { updateUser, getUserById } from '../services/userService';

const EditUserDialog = ({ open, user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userDetail, setUserDetail] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    phone: '',
    password: '', // optional - only if changing password
    
    // Patient fields
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact_first_name: '',
    emergency_contact_last_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    
    // Doctor fields
    department: '',
    specialty: '',
    hospital_affiliation: '',
    consultation_hours: '',
  });

  // Load user detail when dialog opens
  useEffect(() => {
    if (open && user) {
      loadUserDetail();
    }
  }, [open, user]);

  const loadUserDetail = async () => {
    try {
      const response = await getUserById(user.user_id);
      if (response.success) {
        setUserDetail(response.data);
        
        // Populate form with existing data
        const { user: userData, profile } = response.data;
        
        setFormData({
          phone: userData.phone || '',
          password: '',
          
          // Patient or Doctor profile
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          date_of_birth: profile?.date_of_birth || '',
          gender: profile?.gender || '',
          address: profile?.address || '',
          emergency_contact_first_name: profile?.emergency_contact_first_name || '',
          emergency_contact_last_name: profile?.emergency_contact_last_name || '',
          emergency_contact_phone: profile?.emergency_contact_phone || '',
          emergency_contact_relation: profile?.emergency_contact_relation || '',
          department: profile?.department || '',
          specialty: profile?.specialty || '',
          hospital_affiliation: profile?.hospital_affiliation || '',
          consultation_hours: profile?.consultation_hours || '',
        });
      }
    } catch (err) {
      console.error('Error loading user detail:', err);
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    }
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    setError('');

    // Check password length if provided
    if (formData.password && formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }

    // Check required fields based on role
    if (user.role === 'patient') {
      if (!formData.first_name || !formData.last_name) {
        setError('กรุณากรอกชื่อ-นามสกุล');
        return false;
      }
    } else if (user.role === 'doctor') {
      if (!formData.first_name || !formData.last_name) {
        setError('กรุณากรอกชื่อ-นามสกุล');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        phone: formData.phone || undefined,
      };

      // Add password if changed
      if (formData.password) {
        payload.password = formData.password;
      }

      // Add profile data based on role
      if (user.role === 'patient') {
        payload.profile = {
          patient: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            date_of_birth: formData.date_of_birth || null,
            gender: formData.gender || null,
            address: formData.address || null,
            emergency_contact_first_name: formData.emergency_contact_first_name || null,
            emergency_contact_last_name: formData.emergency_contact_last_name || null,
            emergency_contact_phone: formData.emergency_contact_phone || null,
            emergency_contact_relation: formData.emergency_contact_relation || null,
          },
        };
      } else if (user.role === 'doctor') {
        payload.profile = {
          doctor: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            department: formData.department || null,
            specialty: formData.specialty || null,
            hospital_affiliation: formData.hospital_affiliation || null,
            consultation_hours: formData.consultation_hours || null,
          },
        };
      }

      const response = await updateUser(user.user_id, payload);

      if (response.success) {
        handleClose();
        onSuccess();
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      phone: '',
      password: '',
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      address: '',
      emergency_contact_first_name: '',
      emergency_contact_last_name: '',
      emergency_contact_phone: '',
      emergency_contact_relation: '',
      department: '',
      specialty: '',
      hospital_affiliation: '',
      consultation_hours: '',
    });
    setError('');
    setShowPassword(false);
    setUserDetail(null);
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            แก้ไขข้อมูลผู้ใช้
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {user.user_id} - {user.username}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!userDetail ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ py: 2 }}>
            {/* Account Info */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              ข้อมูลบัญชี
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={user.username}
                  disabled
                  helperText="ไม่สามารถแก้ไข username ได้"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="เลขบัตรประชาชน"
                  value={user.id_card}
                  disabled
                  helperText="ไม่สามารถแก้ไขเลขบัตรได้"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="เบอร์โทรศัพท์"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  placeholder="0812345678"
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="รหัสผ่านใหม่"
                  value={formData.password}
                  onChange={handleChange('password')}
                  placeholder="เว้นว่างถ้าไม่ต้องการเปลี่ยน"
                  helperText="เว้นว่างถ้าไม่ต้องการเปลี่ยนรหัสผ่าน"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Profile Info */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              ข้อมูลส่วนตัว
            </Typography>

            <Grid container spacing={2}>
              {/* Patient Profile */}
              {user.role === 'patient' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="HN (Hospital Number)"
                      value={userDetail.profile?.patient_hn || ''}
                      disabled
                      helperText="ไม่สามารถแก้ไข HN ได้"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>เพศ</InputLabel>
                      <Select
                        value={formData.gender}
                        onChange={handleChange('gender')}
                        label="เพศ"
                      >
                        <MenuItem value="">-- เลือก --</MenuItem>
                        <MenuItem value="male">ชาย</MenuItem>
                        <MenuItem value="female">หญิง</MenuItem>
                        <MenuItem value="other">อื่นๆ</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ชื่อ"
                      value={formData.first_name}
                      onChange={handleChange('first_name')}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="นามสกุล"
                      value={formData.last_name}
                      onChange={handleChange('last_name')}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="วันเกิด"
                      value={formData.date_of_birth}
                      onChange={handleChange('date_of_birth')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="ที่อยู่"
                      value={formData.address}
                      onChange={handleChange('address')}
                      multiline
                      rows={2}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 1 }}>
                      ข้อมูลผู้ติดต่อฉุกเฉิน
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ชื่อผู้ติดต่อ"
                      value={formData.emergency_contact_first_name}
                      onChange={handleChange('emergency_contact_first_name')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="นามสกุลผู้ติดต่อ"
                      value={formData.emergency_contact_last_name}
                      onChange={handleChange('emergency_contact_last_name')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="เบอร์โทรผู้ติดต่อ"
                      value={formData.emergency_contact_phone}
                      onChange={handleChange('emergency_contact_phone')}
                      placeholder="0898765432"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ความสัมพันธ์"
                      value={formData.emergency_contact_relation}
                      onChange={handleChange('emergency_contact_relation')}
                      placeholder="เช่น ภรรยา, สามี, บุตร"
                    />
                  </Grid>
                </>
              )}

              {/* Doctor Profile */}
              {user.role === 'doctor' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="เลขใบอนุญาต"
                      value={userDetail.profile?.license_number || ''}
                      disabled
                      helperText="ไม่สามารถแก้ไขเลขใบอนุญาตได้"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="แผนก"
                      value={formData.department}
                      onChange={handleChange('department')}
                      placeholder="จักษุแพทย์"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ชื่อ"
                      value={formData.first_name}
                      onChange={handleChange('first_name')}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="นามสกุล"
                      value={formData.last_name}
                      onChange={handleChange('last_name')}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ความเชี่ยวชาญ"
                      value={formData.specialty}
                      onChange={handleChange('specialty')}
                      placeholder="ต้อหิน"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="โรงพยาบาลที่สังกัด"
                      value={formData.hospital_affiliation}
                      onChange={handleChange('hospital_affiliation')}
                      placeholder="โรงพยาบาลจุฬาลงกรณ์"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="เวลาให้คำปรึกษา"
                      value={formData.consultation_hours}
                      onChange={handleChange('consultation_hours')}
                      placeholder="จันทร์-ศุกร์ 09:00-17:00"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          ยกเลิก
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}
        >
          บันทึกการแก้ไข
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
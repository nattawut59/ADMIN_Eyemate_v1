// src/components/CreateUserDialog.jsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Alert,
  Stepper, Step, StepLabel, ToggleButtonGroup, ToggleButton,
  FormControl, InputLabel, Select, MenuItem, Grid,
  CircularProgress, IconButton, InputAdornment,
} from '@mui/material';
import {
  Close, Person, LocalHospital, ArrowBack, ArrowForward,
  Visibility, VisibilityOff,
} from '@mui/icons-material';
import { createUser } from '../services/userService';

const CreateUserDialog = ({ open, onClose, onSuccess }) => {
  // States
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    // User Info
    role: 'patient',
    id_card: '',
    username: '', // For doctor only
    password: '',
    phone: '',

    // Patient Profile
    patient_hn: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact_first_name: '',
    emergency_contact_last_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    consent_to_data_usage: 1,

    // Doctor Profile
    license_number: '',
    department: '',
    specialty: '',
    hospital_affiliation: '',
    consultation_hours: '',
  });

  const steps = ['เลือกประเภทผู้ใช้', 'ข้อมูลบัญชี', 'ข้อมูลส่วนตัว'];

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    setError('');
  };

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setFormData({
        ...formData,
        role: newRole,
      });
    }
  };

  const validateStep = () => {
    setError('');

    if (activeStep === 0) {
      if (!formData.role) {
        setError('กรุณาเลือกประเภทผู้ใช้');
        return false;
      }
    }

    if (activeStep === 1) {
      if (!formData.id_card || formData.id_card.length !== 13) {
        setError('กรุณากรอกเลขบัตรประชาชน 13 หลัก');
        return false;
      }

      if (formData.role === 'doctor' && !formData.username) {
        setError('กรุณากรอก Username สำหรับแพทย์');
        return false;
      }

      if (!formData.password || formData.password.length < 6) {
        setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        return false;
      }
    }

    if (activeStep === 2) {
      if (!formData.first_name || !formData.last_name) {
        setError('กรุณากรอกชื่อ-นามสกุล');
        return false;
      }

      if (formData.role === 'patient' && !formData.patient_hn) {
        setError('กรุณากรอก HN ของผู้ป่วย');
        return false;
      }

      if (formData.role === 'doctor' && !formData.license_number) {
        setError('กรุณากรอกเลขใบอนุญาตแพทย์');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        id_card: formData.id_card,
        password: formData.password,
        phone: formData.phone || undefined,
        role: formData.role,
      };

      // Add username for doctor
      if (formData.role === 'doctor') {
        payload.username = formData.username;
      }

      // Add profile data
      if (formData.role === 'patient') {
        payload.profile = {
          patient: {
            patient_hn: formData.patient_hn,
            first_name: formData.first_name,
            last_name: formData.last_name,
            date_of_birth: formData.date_of_birth || null,
            gender: formData.gender || null,
            address: formData.address || null,
            emergency_contact_first_name: formData.emergency_contact_first_name || null,
            emergency_contact_last_name: formData.emergency_contact_last_name || null,
            emergency_contact_phone: formData.emergency_contact_phone || null,
            emergency_contact_relation: formData.emergency_contact_relation || null,
            consent_to_data_usage: formData.consent_to_data_usage,
          },
        };
      } else if (formData.role === 'doctor') {
        payload.profile = {
          doctor: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            license_number: formData.license_number,
            department: formData.department || null,
            specialty: formData.specialty || null,
            hospital_affiliation: formData.hospital_affiliation || null,
            consultation_hours: formData.consultation_hours || null,
          },
        };
      }

      const response = await createUser(payload);

      if (response.success) {
        handleClose();
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      role: 'patient',
      id_card: '',
      username: '',
      password: '',
      phone: '',
      patient_hn: '',
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      address: '',
      emergency_contact_first_name: '',
      emergency_contact_last_name: '',
      emergency_contact_phone: '',
      emergency_contact_relation: '',
      consent_to_data_usage: 1,
      license_number: '',
      department: '',
      specialty: '',
      hospital_affiliation: '',
      consultation_hours: '',
    });
    setError('');
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          เพิ่มผู้ใช้ใหม่
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step 0: Select Role */}
        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              เลือกประเภทผู้ใช้ที่ต้องการเพิ่ม
            </Typography>

            <ToggleButtonGroup
              value={formData.role}
              exclusive
              onChange={handleRoleChange}
              sx={{ gap: 2 }}
            >
              <ToggleButton
                value="patient"
                sx={{
                  width: 200,
                  height: 150,
                  flexDirection: 'column',
                  gap: 2,
                  border: '2px solid #e2e8f0',
                  '&.Mui-selected': {
                    bgcolor: '#eff6ff',
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                  },
                }}
              >
                <Person sx={{ fontSize: 48 }} />
                <Typography sx={{ fontWeight: 600, fontSize: 16 }}>ผู้ป่วย</Typography>
                <Typography sx={{ fontSize: 12, color: '#64748b' }}>Patient</Typography>
              </ToggleButton>

              <ToggleButton
                value="doctor"
                sx={{
                  width: 200,
                  height: 150,
                  flexDirection: 'column',
                  gap: 2,
                  border: '2px solid #e2e8f0',
                  '&.Mui-selected': {
                    bgcolor: '#f0fdf4',
                    borderColor: '#10b981',
                    color: '#10b981',
                  },
                }}
              >
                <LocalHospital sx={{ fontSize: 48 }} />
                <Typography sx={{ fontWeight: 600, fontSize: 16 }}>แพทย์</Typography>
                <Typography sx={{ fontSize: 12, color: '#64748b' }}>Doctor</Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Step 1: Account Info */}
        {activeStep === 1 && (
          <Box sx={{ py: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              ข้อมูลบัญชีผู้ใช้
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="เลขบัตรประชาชน"
                  value={formData.id_card}
                  onChange={handleChange('id_card')}
                  placeholder="1234567890123"
                  inputProps={{ maxLength: 13 }}
                  helperText="13 หลัก"
                  required
                />
              </Grid>

              {formData.role === 'patient' && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ fontSize: 13 }}>
                    <strong>Username:</strong> จะใช้เลขบัตรประชาชนโดยอัตโนมัติ
                  </Alert>
                </Grid>
              )}

              {formData.role === 'doctor' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={formData.username}
                    onChange={handleChange('username')}
                    placeholder="doctor.somchai"
                    required
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="รหัสผ่าน"
                  value={formData.password}
                  onChange={handleChange('password')}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  required
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="เบอร์โทรศัพท์"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  placeholder="0812345678"
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 2: Profile Info */}
        {activeStep === 2 && (
          <Box sx={{ py: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              ข้อมูลส่วนตัว
            </Typography>

            <Grid container spacing={2}>
              {/* Patient Profile */}
              {formData.role === 'patient' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="HN (Hospital Number)"
                      value={formData.patient_hn}
                      onChange={handleChange('patient_hn')}
                      placeholder="66008275"
                      required
                      helperText="เช่น 66008275"
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
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
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
              {formData.role === 'doctor' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ชื่อ"
                      value={formData.first_name}
                      onChange={handleChange('first_name')}
                      placeholder="นพ.สมชาย"
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
                      label="เลขใบอนุญาต"
                      value={formData.license_number}
                      onChange={handleChange('license_number')}
                      placeholder="12345"
                      required
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

        {activeStep > 0 && (
          <Button onClick={handleBack} startIcon={<ArrowBack />} disabled={loading}>
            ย้อนกลับ
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForward />}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            ถัดไป
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
          >
            {loading ? <CircularProgress size={24} /> : 'สร้างผู้ใช้'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserDialog;
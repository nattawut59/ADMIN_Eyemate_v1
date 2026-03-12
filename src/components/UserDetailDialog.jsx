// src/components/UserDetailDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Chip, Avatar, Grid,
  Divider, IconButton, CircularProgress, Alert,
  Card, CardContent,
} from '@mui/material';
import {
  Close, Edit, LockReset, Block, CheckCircle,
  Person, LocalHospital, Phone, Email, CalendarToday,
  Badge, LocationOn, ContactEmergency, LocalHospitalOutlined,
  Work,
} from '@mui/icons-material';
import { getUserById, resetUserPassword } from '../services/userService';

const UserDetailDialog = ({ open, user, onClose, onEdit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userDetail, setUserDetail] = useState(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (open && user) {
      loadUserDetail();
    }
  }, [open, user]);

  const loadUserDetail = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getUserById(user.user_id);
      if (response.success) {
        setUserDetail(response.data);
      }
    } catch (err) {
      console.error('Error loading user detail:', err);
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      const response = await resetUserPassword(user.user_id, newPassword);
      if (response.success) {
        alert('รีเซ็ตรหัสผ่านสำเร็จ');
        setResetPasswordOpen(false);
        setNewPassword('');
      }
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
    }
  };

  const getRoleLabel = (role) => {
    const roleMap = {
      patient: 'ผู้ป่วย',
      doctor: 'แพทย์',
      admin: 'ผู้ดูแลระบบ',
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role) => {
    const colorMap = {
      patient: '#3b82f6',
      doctor: '#10b981',
      admin: '#8b5cf6',
    };
    return colorMap[role] || '#64748b';
  };

  const getStatusConfig = (status) => {
    const statusConfig = {
      active: {
        label: 'ใช้งาน',
        color: '#16a34a',
        bgcolor: '#dcfce7',
        icon: <CheckCircle />,
      },
      inactive: {
        label: 'ไม่ใช้งาน',
        color: '#64748b',
        bgcolor: '#f1f5f9',
        icon: <Block />,
      },
      suspended: {
        label: 'ระงับ',
        color: '#dc2626',
        bgcolor: '#fee2e2',
        icon: <Block />,
      },
    };
    return statusConfig[status] || statusConfig.inactive;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const InfoRow = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5 }}>
      <Box sx={{ color: '#64748b', mt: 0.25 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.25 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
          {value || '-'}
        </Typography>
      </Box>
    </Box>
  );

  if (!user) return null;

  const statusConfig = getStatusConfig(userDetail?.user?.status || user.status);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: getRoleColor(user.role) + '20',
              color: getRoleColor(user.role),
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {user.role === 'patient' ? (
              <Person sx={{ fontSize: 32 }} />
            ) : (
              <LocalHospital sx={{ fontSize: 32 }} />
            )}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {userDetail?.profile?.first_name} {userDetail?.profile?.last_name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip
                label={getRoleLabel(user.role)}
                size="small"
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: getRoleColor(user.role) + '15',
                  color: getRoleColor(user.role),
                }}
              />
              <Chip
                icon={statusConfig.icon}
                label={statusConfig.label}
                size="small"
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: statusConfig.bgcolor,
                  color: statusConfig.color,
                  '& .MuiChip-icon': { fontSize: 16, color: 'inherit' },
                }}
              />
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : userDetail ? (
          <Grid container spacing={3}>
            {/* Account Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    ข้อมูลบัญชี
                  </Typography>

                  <InfoRow
                    icon={<Badge />}
                    label="รหัสผู้ใช้"
                    value={userDetail.user.user_id}
                  />

                  <InfoRow
                    icon={<Person />}
                    label="Username"
                    value={userDetail.user.username}
                  />

                  <InfoRow
                    icon={<Badge />}
                    label="เลขบัตรประชาชน"
                    value={userDetail.user.id_card}
                  />

                  <InfoRow
                    icon={<Phone />}
                    label="เบอร์โทรศัพท์"
                    value={userDetail.user.phone}
                  />

                  <InfoRow
                    icon={<CalendarToday />}
                    label="วันที่สมัคร"
                    value={formatDate(userDetail.user.created_at)}
                  />

                  <InfoRow
                    icon={<CalendarToday />}
                    label="เข้าสู่ระบบล่าสุด"
                    value={formatDate(userDetail.user.last_login)}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Profile Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    {user.role === 'patient' ? 'ข้อมูลผู้ป่วย' : 'ข้อมูลแพทย์'}
                  </Typography>

                  {user.role === 'patient' && userDetail.profile && (
                    <>
                      <InfoRow
                        icon={<Badge />}
                        label="HN (Hospital Number)"
                        value={userDetail.profile.patient_hn}
                      />

                      <InfoRow
                        icon={<Person />}
                        label="เพศ"
                        value={
                          userDetail.profile.gender === 'male'
                            ? 'ชาย'
                            : userDetail.profile.gender === 'female'
                            ? 'หญิง'
                            : 'อื่นๆ'
                        }
                      />

                      <InfoRow
                        icon={<CalendarToday />}
                        label="วันเกิด"
                        value={formatDate(userDetail.profile.date_of_birth)}
                      />

                      <InfoRow
                        icon={<LocationOn />}
                        label="ที่อยู่"
                        value={userDetail.profile.address}
                      />

                      <InfoRow
                        icon={<CalendarToday />}
                        label="วันที่ลงทะเบียน"
                        value={formatDate(userDetail.profile.registration_date)}
                      />
                    </>
                  )}

                  {user.role === 'doctor' && userDetail.profile && (
                    <>
                      <InfoRow
                        icon={<Badge />}
                        label="เลขใบอนุญาต"
                        value={userDetail.profile.license_number}
                      />

                      <InfoRow
                        icon={<Work />}
                        label="แผนก"
                        value={userDetail.profile.department}
                      />

                      <InfoRow
                        icon={<LocalHospitalOutlined />}
                        label="ความเชี่ยวชาญ"
                        value={userDetail.profile.specialty}
                      />

                      <InfoRow
                        icon={<LocalHospital />}
                        label="โรงพยาบาลที่สังกัด"
                        value={userDetail.profile.hospital_affiliation}
                      />

                      <InfoRow
                        icon={<CalendarToday />}
                        label="เวลาให้คำปรึกษา"
                        value={userDetail.profile.consultation_hours}
                      />

                      <InfoRow
                        icon={<CalendarToday />}
                        label="วันที่ลงทะเบียน"
                        value={formatDate(userDetail.profile.registration_date)}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Emergency Contact (Patient only) */}
            {user.role === 'patient' && userDetail.profile && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                      <ContactEmergency sx={{ mr: 1, verticalAlign: 'middle' }} />
                      ผู้ติดต่อฉุกเฉิน
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <InfoRow
                          icon={<Person />}
                          label="ชื่อ-นามสกุล"
                          value={`${userDetail.profile.emergency_contact_first_name || ''} ${
                            userDetail.profile.emergency_contact_last_name || ''
                          }`.trim()}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <InfoRow
                          icon={<Phone />}
                          label="เบอร์โทรศัพท์"
                          value={userDetail.profile.emergency_contact_phone}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <InfoRow
                          icon={<ContactEmergency />}
                          label="ความสัมพันธ์"
                          value={userDetail.profile.emergency_contact_relation}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose}>ปิด</Button>

        <Box sx={{ flex: 1 }} />

        <Button
          variant="outlined"
          startIcon={<LockReset />}
          onClick={() => {
            const password = prompt('กรุณากรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร):');
            if (password) {
              handleResetPassword();
            }
          }}
          sx={{ textTransform: 'none' }}
        >
          รีเซ็ตรหัสผ่าน
        </Button>

        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={onEdit}
          sx={{
            bgcolor: '#f59e0b',
            '&:hover': { bgcolor: '#d97706' },
            textTransform: 'none',
          }}
        >
          แก้ไขข้อมูล
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailDialog;
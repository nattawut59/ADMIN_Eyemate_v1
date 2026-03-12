import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
} from '@mui/material';
import {
  Warning,
  Error as ErrorIcon,
  Phone,
  Email,
  Visibility,
  Refresh,
} from '@mui/icons-material';
import { getMedicationAlerts } from '../services/medicationReportService';

const MedicationAlerts = () => {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMedicationAlerts();
      if (response.success) {
        setAlerts(response.data);
      }
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            🚨 แจ้งเตือนผู้ป่วยที่ต้องติดตาม
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: 14 }}>
            ผู้ป่วยที่มีปัญหาการใช้ยาและต้องการการดูแลเร่งด่วน
          </Typography>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={loadAlerts}
          variant="outlined"
          sx={{ textTransform: 'none' }}
        >
          รีเฟรช
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        <Card sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Typography sx={{ fontSize: 13, color: '#64748b', mb: 1 }}>
            รวมทั้งหมด
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {alerts?.summary.total_alerts || 0}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#64748b', mt: 0.5 }}>
            รายการ
          </Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #fee2e2', boxShadow: 'none', bgcolor: '#fef2f2' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ErrorIcon sx={{ fontSize: 20, color: '#ef4444' }} />
            <Typography sx={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
              Critical
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626' }}>
            {alerts?.summary.critical_count || 0}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#991b1b', mt: 0.5 }}>
            ต้องดำเนินการทันที
          </Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #fef3c7', boxShadow: 'none', bgcolor: '#fffbeb' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Warning sx={{ fontSize: 20, color: '#f59e0b' }} />
            <Typography sx={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
              Warning
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#d97706' }}>
            {alerts?.summary.warning_count || 0}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#92400e', mt: 0.5 }}>
            ต้องติดตาม
          </Typography>
        </Card>
      </Box>

      {/* Critical Alerts */}
      {alerts?.alerts.critical.count > 0 && (
        <Card sx={{ mb: 3, border: '1px solid #fee2e2', boxShadow: 'none' }}>
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid #fee2e2',
              bgcolor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <ErrorIcon sx={{ color: '#ef4444' }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#dc2626' }}>
                {alerts.alerts.critical.title}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#991b1b' }}>
                {alerts.alerts.critical.description}
              </Typography>
            </Box>
            <Chip
              label={`${alerts.alerts.critical.count} รายการ`}
              sx={{
                bgcolor: '#dc2626',
                color: '#fff',
                fontWeight: 700,
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>รหัสผู้ป่วย</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ชื่อ-นามสกุล</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ยา</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ไม่หยดมา</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ครั้งล่าสุด</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.alerts.critical.patients.map((patient, index) => (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: '#fef2f2' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{patient.patient_hn}</TableCell>
                    <TableCell>{patient.patient_name}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13 }}>{patient.medication_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${patient.days_missed} วัน`}
                        size="small"
                        sx={{
                          bgcolor: '#fee2e2',
                          color: '#dc2626',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: '#64748b' }}>
                      {patient.last_missed_time}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="error">
                          <Phone fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <Email fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Warning Alerts */}
      {alerts?.alerts.warning.count > 0 && (
        <Card sx={{ border: '1px solid #fef3c7', boxShadow: 'none' }}>
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid #fef3c7',
              bgcolor: '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Warning sx={{ color: '#f59e0b' }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#d97706' }}>
                {alerts.alerts.warning.title}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#92400e' }}>
                {alerts.alerts.warning.description}
              </Typography>
            </Box>
            <Chip
              label={`${alerts.alerts.warning.count} รายการ`}
              sx={{
                bgcolor: '#d97706',
                color: '#fff',
                fontWeight: 700,
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>รหัสผู้ป่วย</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ชื่อ-นามสกุล</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ทั้งหมด</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>หยดแล้ว</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ข้าม</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Adherence</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.alerts.warning.patients.map((patient, index) => (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: '#fffbeb' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{patient.patient_hn}</TableCell>
                    <TableCell>{patient.patient_name}</TableCell>
                    <TableCell>{patient.total_scheduled}</TableCell>
                    <TableCell>{patient.taken_count}</TableCell>
                    <TableCell>{patient.skipped_count}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${patient.adherence_rate}%`}
                        size="small"
                        sx={{
                          bgcolor: patient.adherence_rate < 50 ? '#fee2e2' : '#fef3c7',
                          color: patient.adherence_rate < 50 ? '#dc2626' : '#d97706',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="warning">
                          <Phone fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* No Alerts */}
      {alerts?.summary.total_alerts === 0 && (
        <Card sx={{ p: 4, textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Typography sx={{ fontSize: 16, color: '#64748b' }}>
            ไม่มีผู้ป่วยที่ต้องติดตามในขณะนี้
          </Typography>
        </Card>
      )}
    </Box>
  );
};

export default MedicationAlerts;
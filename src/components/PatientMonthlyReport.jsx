import React, { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Alert, CircularProgress, Chip, Button,
  TextField, MenuItem, Avatar, LinearProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
} from '@mui/material';
import {
  ArrowBack, Medication, Remove, CheckCircle, Cancel, Schedule, Print, FileDownload,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientMonthlyReport } from '../services/medicationReportService';

const PatientMonthlyReport = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  useEffect(() => {
    if (patientId) loadReport();
  }, [patientId, selectedYear, selectedMonth]);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPatientMonthlyReport(patientId, selectedYear, selectedMonth);
      if (response.success) setData(response.data);
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const getAdherenceColor = (rate) => {
    if (rate >= 90) return { bg: '#dcfce7', color: '#16a34a', label: 'ดีมาก', icon: '🎉' };
    if (rate >= 80) return { bg: '#dbeafe', color: '#0284c7', label: 'ดี', icon: '✅' };
    if (rate >= 70) return { bg: '#fef3c7', color: '#d97706', label: 'ปานกลาง', icon: '⚠️' };
    return { bg: '#fee2e2', color: '#dc2626', label: 'ต่ำ', icon: '❗' };
  };

  const getStatusColor = (status) => {
    if (status === 'taken') return { bg: '#dcfce7', color: '#16a34a', label: 'หยดแล้ว', icon: <CheckCircle /> };
    if (status === 'skipped') return { bg: '#fee2e2', color: '#dc2626', label: 'ข้าม', icon: <Cancel /> };
    if (status === 'delayed') return { bg: '#fef3c7', color: '#d97706', label: 'หยดช้า', icon: <Schedule /> };
    return { bg: '#f1f5f9', color: '#64748b', label: '-', icon: <Remove /> };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>กลับ</Button>
      </Box>
    );
  }

  if (!data) return null;

  const adherenceColor = getAdherenceColor(data.overall_summary.adherence_rate);

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/medication-reports/patients')} sx={{ mb: 2, textTransform: 'none' }}>
          กลับไปรายการผู้ป่วย
        </Button>

        <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: adherenceColor.bg, color: adherenceColor.color, fontSize: 24, fontWeight: 700 }}>
                {data.patient_info.full_name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{data.patient_info.full_name}</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 14, color: '#64748b' }}>รหัส: <strong>{data.patient_info.patient_hn}</strong></Typography>
                  <Typography sx={{ fontSize: 14, color: '#64748b' }}>
                    วันเกิด: {new Date(data.patient_info.date_of_birth).toLocaleDateString('th-TH')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField select label="เดือน" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} size="small" sx={{ width: 150 }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleDateString('th-TH', { month: 'long' })}</MenuItem>
                ))}
              </TextField>
              <TextField select label="ปี" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} size="small" sx={{ width: 120 }}>
                {[2024, 2025, 2026].map((year) => (
                  <MenuItem key={year} value={year}>{year + 543}</MenuItem>
                ))}
              </TextField>
              <IconButton><Print /></IconButton>
              <IconButton><FileDownload /></IconButton>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Overall Summary - 4 cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        <Card sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Typography sx={{ fontSize: 13, color: '#64748b', mb: 1 }}>ทั้งหมด</Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>{data.overall_summary.total_scheduled}</Typography>
          <Typography sx={{ fontSize: 12, color: '#64748b' }}>ครั้ง</Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #dcfce7', boxShadow: 'none', bgcolor: '#f0fdf4' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CheckCircle sx={{ fontSize: 18, color: '#16a34a' }} />
            <Typography sx={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>หยดแล้ว</Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#16a34a', mb: 1 }}>{data.overall_summary.taken}</Typography>
          <Typography sx={{ fontSize: 12, color: '#15803d' }}>
            {data.overall_summary.total_scheduled > 0
              ? ((data.overall_summary.taken / data.overall_summary.total_scheduled) * 100).toFixed(1) : 0}% ของทั้งหมด
          </Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #fee2e2', boxShadow: 'none', bgcolor: '#fef2f2' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Cancel sx={{ fontSize: 18, color: '#dc2626' }} />
            <Typography sx={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>ข้าม</Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#dc2626', mb: 1 }}>{data.overall_summary.skipped}</Typography>
          <Typography sx={{ fontSize: 12, color: '#991b1b' }}>
            {data.overall_summary.total_scheduled > 0
              ? ((data.overall_summary.skipped / data.overall_summary.total_scheduled) * 100).toFixed(1) : 0}% ของทั้งหมด
          </Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #fef3c7', boxShadow: 'none', bgcolor: '#fffbeb' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Schedule sx={{ fontSize: 18, color: '#d97706' }} />
            <Typography sx={{ fontSize: 13, color: '#d97706', fontWeight: 600 }}>หยดช้า</Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#d97706', mb: 1 }}>{data.overall_summary.delayed}</Typography>
          <Typography sx={{ fontSize: 12, color: '#92400e' }}>
            {data.overall_summary.total_scheduled > 0
              ? ((data.overall_summary.delayed / data.overall_summary.total_scheduled) * 100).toFixed(1) : 0}% ของทั้งหมด
          </Typography>
        </Card>
      </Box>

      {/* Adherence Rate Card */}
      <Card sx={{ p: 3, mb: 3, border: `2px solid ${adherenceColor.color}`, boxShadow: 'none', bgcolor: adherenceColor.bg }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h2" sx={{ fontWeight: 700, color: adherenceColor.color }}>{adherenceColor.icon}</Typography>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: adherenceColor.color, mb: 0.5 }}>
                {data.overall_summary.adherence_rate}%
              </Typography>
              <Typography sx={{ fontSize: 14, color: adherenceColor.color, fontWeight: 600 }}>Adherence Rate</Typography>
            </Box>
          </Box>
          <Chip label={data.overall_summary.adherence_message}
            sx={{ bgcolor: '#fff', color: adherenceColor.color, fontWeight: 700, fontSize: 14, px: 2, py: 0.5, height: 'auto' }} />
        </Box>
        <LinearProgress variant="determinate" value={data.overall_summary.adherence_rate}
          sx={{ height: 12, borderRadius: 2, bgcolor: '#fff', '& .MuiLinearProgress-bar': { bgcolor: adherenceColor.color, borderRadius: 2 } }} />
      </Card>

      {/* Active Prescriptions */}
      <Card sx={{ mb: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Medication sx={{ color: '#6366f1' }} />
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>ยาที่ใช้อยู่ ({data.active_prescriptions.count} รายการ)</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            {data.active_prescriptions.medications.map((med, index) => (
              <Card key={index} sx={{ p: 2, border: '1px solid #e2e8f0', boxShadow: 'none', '&:hover': { borderColor: '#6366f1', bgcolor: '#f8fafc' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{med.medication_name}</Typography>
                  <Chip label={med.status} size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 600, fontSize: 11 }} />
                </Box>
                {med.generic_name && (
                  <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1 }}>{med.generic_name}</Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={med.eye === 'both' ? 'ทั้งสองข้าง' : med.eye === 'left' ? 'ตาซ้าย' : 'ตาขวา'} size="small" />
                  <Chip label={med.dosage || 'N/A'} size="small" />
                  <Chip label={med.frequency || 'N/A'} size="small" />
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      </Card>

      {/* Medication Details Table */}
      <Card sx={{ mb: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>รายละเอียดการใช้ยาแต่ละตัว</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ชื่อยา</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ทั้งหมด</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>หยดแล้ว</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ข้าม</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>หยดช้า</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Adherence</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.medication_details.map((med, index) => {
                const medColor = getAdherenceColor(med.adherence_rate);
                return (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{med.medication_name}</Typography>
                      {med.generic_name && <Typography sx={{ fontSize: 12, color: '#64748b' }}>{med.generic_name}</Typography>}
                    </TableCell>
                    <TableCell>{med.total_scheduled}</TableCell>
                    <TableCell><Chip label={med.taken_count} size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 600 }} /></TableCell>
                    <TableCell><Chip label={med.skipped_count} size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 600 }} /></TableCell>
                    <TableCell><Chip label={med.delayed_count} size="small" sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 600 }} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1, maxWidth: 120 }}>
                          <LinearProgress variant="determinate" value={med.adherence_rate}
                            sx={{ height: 8, borderRadius: 1, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: medColor.color, borderRadius: 1 } }} />
                        </Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: medColor.color, minWidth: 50 }}>{med.adherence_rate}%</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Trend Placeholder */}
      <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>แนวโน้ม 6 เดือนล่าสุด</Typography>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: 2 }}>
          <Typography sx={{ color: '#64748b' }}>📊 กราฟแนวโน้ม (จะเพิ่มในเวอร์ชันถัดไป)</Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default PatientMonthlyReport;
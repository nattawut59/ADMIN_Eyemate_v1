import React, { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Alert, CircularProgress, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, LinearProgress, Avatar,
  Button, TextField, MenuItem,
} from '@mui/material';
import {
  People, Medication, CheckCircle, Cancel, EmojiEvents,
  Warning as WarningIcon, Error as ErrorIcon, Refresh,
} from '@mui/icons-material';
import { getMedicationOverview } from '../services/medicationReportService';
import { useNavigate } from 'react-router-dom';

const MedicationOverview = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMedicationOverview(selectedYear, selectedMonth);
      if (response.success) setData(response.data);
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const getAdherenceColor = (rate) => {
    if (rate >= 90) return { bg: '#dcfce7', color: '#16a34a', label: 'ดีมาก' };
    if (rate >= 80) return { bg: '#dbeafe', color: '#0284c7', label: 'ดี' };
    if (rate >= 70) return { bg: '#fef3c7', color: '#d97706', label: 'ปานกลาง' };
    return { bg: '#fee2e2', color: '#dc2626', label: 'ต่ำ' };
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;

  const adherenceColor = getAdherenceColor(data?.overall_stats.average_adherence_rate || 0);

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>📊 ภาพรวมระบบรายงานการใช้ยา</Typography>
          <Typography sx={{ color: '#64748b', fontSize: 14 }}>
            สรุปสถิติและข้อมูลการใช้ยาทั้งหมด ({data?.report_period.month_name_th})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
          <Button startIcon={<Refresh />} onClick={loadData} variant="outlined" sx={{ textTransform: 'none' }}>รีเฟรช</Button>
        </Box>
      </Box>

      {/* Overall Stats - 4 cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        <Card sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <People sx={{ fontSize: 24, color: '#6366f1' }} />
            <Typography sx={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>ผู้ป่วยที่ใช้งาน</Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>{data?.overall_stats.total_patients || 0}</Typography>
          <Typography sx={{ fontSize: 12, color: '#64748b' }}>คน</Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Medication sx={{ fontSize: 24, color: '#8b5cf6' }} />
            <Typography sx={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>ยาทั้งหมด</Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>{data?.overall_stats.total_medications || 0}</Typography>
          <Typography sx={{ fontSize: 12, color: '#64748b' }}>รายการ</Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #dcfce7', boxShadow: 'none', bgcolor: '#f0fdf4' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CheckCircle sx={{ fontSize: 24, color: '#16a34a' }} />
            <Typography sx={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>หยดแล้ว</Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#16a34a', mb: 0.5 }}>{data?.overall_stats.total_taken || 0}</Typography>
          <Typography sx={{ fontSize: 12, color: '#15803d' }}>จาก {data?.overall_stats.total_scheduled || 0} ครั้ง</Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #fee2e2', boxShadow: 'none', bgcolor: '#fef2f2' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Cancel sx={{ fontSize: 24, color: '#dc2626' }} />
            <Typography sx={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>ข้าม/พลาด</Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#dc2626', mb: 0.5 }}>{data?.overall_stats.total_skipped || 0}</Typography>
          <Typography sx={{ fontSize: 12, color: '#991b1b' }}>จาก {data?.overall_stats.total_scheduled || 0} ครั้ง</Typography>
        </Card>
      </Box>

      {/* Overall Adherence Rate */}
      <Card sx={{ p: 3, mb: 3, border: `2px solid ${adherenceColor.color}`, boxShadow: 'none', bgcolor: adherenceColor.bg }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 14, color: adherenceColor.color, fontWeight: 600, mb: 0.5 }}>Adherence Rate เฉลี่ยทั้งระบบ</Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: adherenceColor.color }}>
              {data?.overall_stats.average_adherence_rate || 0}%
            </Typography>
          </Box>
          <Chip label={adherenceColor.label}
            sx={{ bgcolor: '#fff', color: adherenceColor.color, fontWeight: 700, fontSize: 16, px: 3, py: 0.5, height: 'auto' }} />
        </Box>
        <LinearProgress variant="determinate" value={data?.overall_stats.average_adherence_rate || 0}
          sx={{ height: 12, borderRadius: 2, bgcolor: '#fff', '& .MuiLinearProgress-bar': { bgcolor: adherenceColor.color, borderRadius: 2 } }} />
      </Card>

      {/* Alert Summary - 3 cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        <Card sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Typography sx={{ fontSize: 13, color: '#64748b', mb: 1, fontWeight: 600 }}>Alert ทั้งหมด</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{data?.alert_summary.total_alerts || 0}</Typography>
          <Typography sx={{ fontSize: 12, color: '#64748b', mt: 0.5 }}>รายการ</Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #fee2e2', boxShadow: 'none', bgcolor: '#fef2f2' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <ErrorIcon sx={{ fontSize: 20, color: '#ef4444' }} />
            <Typography sx={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>Critical</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626' }}>{data?.alert_summary.critical_count || 0}</Typography>
          <Typography sx={{ fontSize: 12, color: '#991b1b', mt: 0.5 }}>ต้องดำเนินการทันที</Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #fef3c7', boxShadow: 'none', bgcolor: '#fffbeb' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <WarningIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
            <Typography sx={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>Warning</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#d97706' }}>{data?.alert_summary.warning_count || 0}</Typography>
          <Typography sx={{ fontSize: 12, color: '#92400e', mt: 0.5 }}>ต้องติดตาม</Typography>
        </Card>
      </Box>

      {/* Adherence Distribution */}
      <Card sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>📈 การกระจายตัวของ Adherence Levels</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
          {[
            { key: 'excellent', label: 'ดีมาก (≥90%)', bg: '#f0fdf4', color: '#15803d', textColor: '#16a34a' },
            { key: 'good', label: 'ดี (80-90%)', bg: '#eff6ff', color: '#0369a1', textColor: '#0284c7' },
            { key: 'fair', label: 'ปานกลาง (70-80%)', bg: '#fffbeb', color: '#92400e', textColor: '#d97706' },
            { key: 'poor', label: 'ต่ำ (<70%)', bg: '#fef2f2', color: '#991b1b', textColor: '#dc2626' },
          ].map((item) => (
            <Box key={item.key} sx={{ textAlign: 'center', p: 2, bgcolor: item.bg, borderRadius: 2 }}>
              <Typography sx={{ fontSize: 12, color: item.color, mb: 1 }}>{item.label}</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: item.textColor }}>
                {data?.adherence_distribution[item.key] || 0}
              </Typography>
              <Typography sx={{ fontSize: 11, color: item.color, mt: 0.5 }}>
                {data?.overall_stats.total_patients > 0
                  ? ((data.adherence_distribution[item.key] / data.overall_stats.total_patients) * 100).toFixed(1) : 0}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Top Performers & Needs Improvement */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {/* Top 10 */}
        <Card sx={{ border: '1px solid #dcfce7', boxShadow: 'none' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #dcfce7', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <EmojiEvents sx={{ color: '#16a34a' }} />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#16a34a' }}>🏆 Top 10 ผู้ป่วยดีที่สุด</Typography>
              <Typography sx={{ fontSize: 12, color: '#15803d' }}>ผู้ป่วยที่มี Adherence Rate สูงสุด</Typography>
            </Box>
          </Box>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>ผู้ป่วย</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Adherence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.top_performers?.length > 0 ? data.top_performers.map((patient, index) => {
                  const color = getAdherenceColor(patient.adherence_rate);
                  return (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f0fdf4' } }}>
                      <TableCell>
                        <Chip label={index + 1} size="small"
                          sx={{ bgcolor: index < 3 ? '#fbbf24' : '#e5e7eb', color: index < 3 ? '#fff' : '#374151', fontWeight: 700, fontSize: 11, minWidth: 28 }} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: color.bg, color: color.color, fontSize: 12, fontWeight: 700 }}>
                            {patient.patient_name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{patient.patient_name}</Typography>
                            <Typography sx={{ fontSize: 11, color: '#64748b' }}>{patient.patient_hn}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${patient.adherence_rate}%`} size="small"
                          sx={{ bgcolor: color.bg, color: color.color, fontWeight: 700, fontSize: 12 }} />
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography sx={{ color: '#64748b', fontSize: 14 }}>ไม่มีข้อมูล</Typography>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Needs Improvement */}
        <Card sx={{ border: '1px solid #fee2e2', boxShadow: 'none' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #fee2e2', bgcolor: '#fef2f2', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WarningIcon sx={{ color: '#dc2626' }} />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#dc2626' }}>⚠️ Top 10 ผู้ป่วยต้องปรับปรุง</Typography>
              <Typography sx={{ fontSize: 12, color: '#991b1b' }}>ผู้ป่วยที่มี Adherence Rate ต่ำสุด</Typography>
            </Box>
          </Box>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>ผู้ป่วย</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Adherence</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>ข้าม</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.need_improvement?.length > 0 ? data.need_improvement.map((patient, index) => {
                  const color = getAdherenceColor(patient.adherence_rate);
                  return (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: '#fef2f2' }, cursor: 'pointer' }}
                      onClick={() => navigate(`/medication-reports/patient/${patient.patient_id}`)}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: color.bg, color: color.color, fontSize: 12, fontWeight: 700 }}>
                            {patient.patient_name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{patient.patient_name}</Typography>
                            <Typography sx={{ fontSize: 11, color: '#64748b' }}>{patient.patient_hn}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${patient.adherence_rate}%`} size="small"
                          sx={{ bgcolor: color.bg, color: color.color, fontWeight: 700, fontSize: 12 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={patient.skipped_count} size="small"
                          sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 600, fontSize: 12 }} />
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography sx={{ color: '#64748b', fontSize: 14 }}>ไม่มีข้อมูล</Typography>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Box>
  );
};

export default MedicationOverview;
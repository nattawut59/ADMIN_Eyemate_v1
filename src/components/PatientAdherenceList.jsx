import React, { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Alert, CircularProgress, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, Button,
  TextField, MenuItem, InputAdornment, Avatar, LinearProgress,
} from '@mui/material';
import { Search, FilterList, FileDownload, Visibility, TrendingUp, TrendingDown, CalendarMonth, Refresh } from '@mui/icons-material';
import { getAllPatientsAdherence } from '../services/medicationReportService';
import { useNavigate } from 'react-router-dom';

const PatientAdherenceList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  useEffect(() => { loadData(); }, [selectedYear, selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAllPatientsAdherence(selectedYear, selectedMonth);
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

  const filterPatients = () => {
    if (!data) return [];
    let patients = filterLevel !== 'all' ? (data.patients_by_level[filterLevel] || []) : data.all_patients;
    if (searchTerm) {
      patients = patients.filter(
        (p) => p.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               p.patient_hn.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return patients;
  };

  // ✅ เพิ่ม Export CSV
  const handleExportCSV = () => {
    const patients = filterPatients();
    if (!patients.length) return;

    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
    const BOM = '\uFEFF';

    const headers = ['รหัสผู้ป่วย', 'ชื่อ-นามสกุล', 'ยาที่ใช้ (ชนิด)', 'จำนวนที่กำหนด', 'หยดแล้ว', 'Adherence Rate (%)', 'ระดับ'];

    const rows = patients.map((p) => [
      p.patient_hn,
      p.patient_name,
      p.active_prescriptions,
      p.total_scheduled,
      p.taken_count,
      p.adherence_rate,
      getAdherenceColor(p.adherence_rate).label,
    ].join(','));

    const csvContent = BOM + [
      `รายงานผู้ป่วยและ Adherence Rate - ${monthName}`,
      `ส่งออกเมื่อ: ${new Date().toLocaleDateString('th-TH')}`,
      '',
      headers.join(','),
      ...rows,
      '',
      'สรุป',
      `ผู้ป่วยทั้งหมด,${data?.summary.total_patients || 0} คน`,
      `Adherence เฉลี่ย,${data?.summary.average_adherence || 0}%`,
      `ดีมาก (≥90%),${data?.summary.excellent_count || 0} คน`,
      `ดี (80-90%),${data?.summary.good_count || 0} คน`,
      `ปานกลาง (70-80%),${data?.summary.fair_count || 0} คน`,
      `ต่ำ (<70%),${data?.summary.poor_count || 0} คน`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `patient_adherence_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredPatients = filterPatients();
  const handleViewReport = (patientId) => navigate(`/medication-reports/patient/${patientId}`);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>📊 รายการผู้ป่วยและ Adherence Rate</Typography>
        <Typography sx={{ color: '#64748b', fontSize: 14 }}>ติดตามอัตราการปฏิบัติตามการใช้ยาของผู้ป่วยแต่ละคน</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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

        <TextField
          placeholder="ค้นหาชื่อหรือรหัสผู้ป่วย..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20 }} /></InputAdornment>,
          }}
        />

        <TextField select label="ระดับ" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} size="small" sx={{ width: 150 }}>
          <MenuItem value="all">ทั้งหมด</MenuItem>
          <MenuItem value="excellent">ดีมาก (≥90%)</MenuItem>
          <MenuItem value="good">ดี (80-90%)</MenuItem>
          <MenuItem value="fair">ปานกลาง (70-80%)</MenuItem>
          <MenuItem value="poor">ต่ำ (&lt;70%)</MenuItem>
        </TextField>

        <Button startIcon={<Refresh />} onClick={loadData} variant="outlined" sx={{ textTransform: 'none' }}>รีเฟรช</Button>

        {/* ✅ เพิ่ม onClick */}
        <Button
          startIcon={<FileDownload />}
          variant="outlined"
          onClick={handleExportCSV}
          disabled={filteredPatients.length === 0}
          sx={{ textTransform: 'none' }}
        >
          Export
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, mb: 3 }}>
        <Card sx={{ p: 2.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Typography sx={{ fontSize: 13, color: '#64748b', mb: 1 }}>ผู้ป่วยทั้งหมด</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{data?.summary.total_patients || 0}</Typography>
          <Typography sx={{ fontSize: 12, color: '#64748b', mt: 0.5 }}>คน</Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #dcfce7', boxShadow: 'none', bgcolor: '#f0fdf4' }}>
          <Typography sx={{ fontSize: 13, color: '#16a34a', mb: 1, fontWeight: 600 }}>ดีมาก (≥90%)</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#16a34a' }}>{data?.summary.excellent_count || 0}</Typography>
          <Typography sx={{ fontSize: 12, color: '#15803d', mt: 0.5 }}>
            {data?.summary.total_patients > 0 ? ((data.summary.excellent_count / data.summary.total_patients) * 100).toFixed(1) : 0}% ของทั้งหมด
          </Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #dbeafe', boxShadow: 'none', bgcolor: '#eff6ff' }}>
          <Typography sx={{ fontSize: 13, color: '#0284c7', mb: 1, fontWeight: 600 }}>ดี (80-90%)</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0284c7' }}>{data?.summary.good_count || 0}</Typography>
          <Typography sx={{ fontSize: 12, color: '#0369a1', mt: 0.5 }}>
            {data?.summary.total_patients > 0 ? ((data.summary.good_count / data.summary.total_patients) * 100).toFixed(1) : 0}% ของทั้งหมด
          </Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #fef3c7', boxShadow: 'none', bgcolor: '#fffbeb' }}>
          <Typography sx={{ fontSize: 13, color: '#d97706', mb: 1, fontWeight: 600 }}>ปานกลาง (70-80%)</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#d97706' }}>{data?.summary.fair_count || 0}</Typography>
          <Typography sx={{ fontSize: 12, color: '#92400e', mt: 0.5 }}>
            {data?.summary.total_patients > 0 ? ((data.summary.fair_count / data.summary.total_patients) * 100).toFixed(1) : 0}% ของทั้งหมด
          </Typography>
        </Card>

        <Card sx={{ p: 2.5, border: '1px solid #fee2e2', boxShadow: 'none', bgcolor: '#fef2f2' }}>
          <Typography sx={{ fontSize: 13, color: '#dc2626', mb: 1, fontWeight: 600 }}>ต่ำ (&lt;70%)</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626' }}>{data?.summary.poor_count || 0}</Typography>
          <Typography sx={{ fontSize: 12, color: '#991b1b', mt: 0.5 }}>
            {data?.summary.total_patients > 0 ? ((data.summary.poor_count / data.summary.total_patients) * 100).toFixed(1) : 0}% ของทั้งหมด
          </Typography>
        </Card>
      </Box>

      <Card sx={{ p: 2.5, mb: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Adherence Rate เฉลี่ย</Typography>
          <Chip label={`${data?.summary.average_adherence || 0}%`}
            sx={{ fontWeight: 700, bgcolor: getAdherenceColor(data?.summary.average_adherence || 0).bg, color: getAdherenceColor(data?.summary.average_adherence || 0).color }} />
        </Box>
        <LinearProgress variant="determinate" value={data?.summary.average_adherence || 0}
          sx={{ height: 10, borderRadius: 2, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: getAdherenceColor(data?.summary.average_adherence || 0).color, borderRadius: 2 } }} />
      </Card>

      <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>รายการผู้ป่วย ({filteredPatients.length} คน)</Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600 }}>รหัส</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ชื่อ-นามสกุล</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ยาที่ใช้</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ทั้งหมด</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>หยดแล้ว</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Adherence Rate</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ระดับ</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ color: '#64748b' }}>ไม่พบข้อมูลผู้ป่วย</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient, index) => {
                  const adherenceColor = getAdherenceColor(patient.adherence_rate);
                  return (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f8fafc' }, cursor: 'pointer' }}
                      onClick={() => handleViewReport(patient.patient_id)}>
                      <TableCell sx={{ fontWeight: 600 }}>{patient.patient_hn}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: adherenceColor.bg, color: adherenceColor.color, fontSize: 14, fontWeight: 700 }}>
                            {patient.patient_name.charAt(0)}
                          </Avatar>
                          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{patient.patient_name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${patient.active_prescriptions} ชนิด`} size="small" sx={{ bgcolor: '#f1f5f9', fontSize: 12 }} />
                      </TableCell>
                      <TableCell>{patient.total_scheduled}</TableCell>
                      <TableCell>{patient.taken_count}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress variant="determinate" value={patient.adherence_rate}
                              sx={{ height: 6, borderRadius: 1, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: adherenceColor.color, borderRadius: 1 } }} />
                          </Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: adherenceColor.color, minWidth: 45 }}>
                            {patient.adherence_rate}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={adherenceColor.label} size="small"
                          sx={{ bgcolor: adherenceColor.bg, color: adherenceColor.color, fontWeight: 600, fontSize: 12 }} />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton size="small" color="primary"
                          onClick={(e) => { e.stopPropagation(); handleViewReport(patient.patient_id); }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default PatientAdherenceList;
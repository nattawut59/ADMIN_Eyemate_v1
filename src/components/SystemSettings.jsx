import { Box, Typography, Card } from '@mui/material';
import { Build, Construction } from '@mui/icons-material';

const SystemSettings = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Card
        sx={{
          p: 6,
          border: '1px solid #e2e8f0',
          boxShadow: 'none',
          textAlign: 'center',
        }}
      >
        <Construction sx={{ fontSize: 80, color: '#cbd5e1', mb: 3 }} />
        
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
          🚧 Coming Soon
        </Typography>
        
        <Typography sx={{ fontSize: 16, color: '#64748b', mb: 4, maxWidth: 500, mx: 'auto' }}>
          ฟีเจอร์การจัดการระบบกำลังอยู่ระหว่างการพัฒนา
        </Typography>

        <Box
          sx={{
            display: 'inline-flex',
            flexDirection: 'column',
            gap: 2,
            p: 3,
            bgcolor: '#f8fafc',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
          }}
        >
          <Typography sx={{ fontSize: 14, color: '#64748b', textAlign: 'left' }}>
            ฟีเจอร์ที่จะมีในอนาคต:
          </Typography>
          <Box sx={{ textAlign: 'left' }}>
            <Typography sx={{ fontSize: 13, color: '#475569', mb: 1 }}>
              📦 • สำรองข้อมูล (Database Backup)
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#475569', mb: 1 }}>
              📋 • Audit Logs (บันทึกการใช้งาน)
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#475569' }}>
              🔑 • จัดการ API Keys
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default SystemSettings;
import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Paper,
  Grid,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Close,
  Send,
  AssignmentInd,
  Edit,
  CheckCircle,
  Person,
  Schedule,
  Category,
  Flag,
  Chat,
  Visibility,
  VisibilityOff,
  Star,
  StarBorder,
} from '@mui/icons-material';
import {
  getTicketById,
  assignTicket,
  replyToTicket,
  updateTicketStatus,
  updateTicketPriority,
} from '../services/ticketService';
import {
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  getCategoryLabel,
  formatTimeAgo,
  formatFullDate,
  getCategoryIcon,
} from '../utils/ticketHelpers';

const TicketDetailDialog = ({ open, ticketId, onClose }) => {
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Reply form
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  
  // Edit mode
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [statusComment, setStatusComment] = useState('');
  
  // Auto-scroll to bottom
  const messagesEndRef = useRef(null);
  
  // Get current admin info
  const adminData = JSON.parse(localStorage.getItem('adminData'));
  const currentAdminId = adminData?.userId || adminData?.user_id;

  useEffect(() => {
    if (open && ticketId) {
      loadTicketDetails();
    }
  }, [open, ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTicketDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getTicketById(ticketId);
      
      if (response.success) {
        setTicket(response.data.ticket);
        setMessages(response.data.messages || []);
        setHistory(response.data.history || []);
        setNewStatus(response.data.ticket.status);
        setNewPriority(response.data.ticket.priority);
      }
    } catch (err) {
      console.error('Error loading ticket details:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToSelf = async () => {
    try {
      const response = await assignTicket(ticketId);
      
      if (response.success) {
        setSuccess('รับเคสสำเร็จ');
        loadTicketDetails();
      }
    } catch (err) {
      console.error('Error assigning ticket:', err);
      setError(err.response?.data?.message || 'ไม่สามารถรับเคสได้');
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      setError('กรุณาระบุข้อความ');
      return;
    }

    setSendingReply(true);
    setError('');

    try {
      const response = await replyToTicket(ticketId, {
        message: replyMessage.trim(),
        is_internal_note: isInternalNote,
      });

      if (response.success) {
        setSuccess(isInternalNote ? 'บันทึกหมายเหตุสำเร็จ' : 'ส่งข้อความสำเร็จ');
        setReplyMessage('');
        setIsInternalNote(false);
        loadTicketDetails();
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      setError(err.response?.data?.message || 'ไม่สามารถส่งข้อความได้');
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === ticket.status) {
      setEditingStatus(false);
      return;
    }

    try {
      const response = await updateTicketStatus(ticketId, {
        status: newStatus,
        comment: statusComment.trim() || undefined,
      });

      if (response.success) {
        setSuccess('อัปเดตสถานะสำเร็จ');
        setEditingStatus(false);
        setStatusComment('');
        loadTicketDetails();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.message || 'ไม่สามารถอัปเดตสถานะได้');
    }
  };

  const handleUpdatePriority = async () => {
    if (newPriority === ticket.priority) {
      setEditingPriority(false);
      return;
    }

    try {
      const response = await updateTicketPriority(ticketId, {
        priority: newPriority,
      });

      if (response.success) {
        setSuccess('อัปเดตความสำคัญสำเร็จ');
        setEditingPriority(false);
        loadTicketDetails();
      }
    } catch (err) {
      console.error('Error updating priority:', err);
      setError(err.response?.data?.message || 'ไม่สามารถอัปเดตความสำคัญได้');
    }
  };

  if (loading) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!ticket) {
    return null;
  }

  const statusColor = getStatusColor(ticket.status);
  const priorityColor = getPriorityColor(ticket.priority);

  return (
    <>
      {/* Snackbar for errors and success */}
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

      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { height: '90vh', maxHeight: 900 }
        }}
      >
        {/* Header */}
        <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
                  {ticket.ticket_id}
                </Typography>
                <span style={{ fontSize: 18 }}>
                  {getCategoryIcon(ticket.category)}
                </span>
                <Typography sx={{ fontSize: 12, color: '#64748b' }}>
                  {getCategoryLabel(ticket.category)}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {ticket.subject}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {/* Status Chip */}
                {editingStatus ? (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        sx={{ fontSize: 13 }}
                      >
                        <MenuItem value="open">เปิดใหม่</MenuItem>
                        <MenuItem value="in_progress">กำลังดำเนินการ</MenuItem>
                        <MenuItem value="waiting_user">รอผู้ใช้ตอบกลับ</MenuItem>
                        <MenuItem value="resolved">แก้ไขแล้ว</MenuItem>
                        <MenuItem value="closed">ปิดเคส</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton size="small" color="primary" onClick={handleUpdateStatus}>
                      <CheckCircle fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => {
                      setEditingStatus(false);
                      setNewStatus(ticket.status);
                    }}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Chip
                    label={getStatusLabel(ticket.status)}
                    size="small"
                    onClick={() => setEditingStatus(true)}
                    icon={<Edit sx={{ fontSize: 14 }} />}
                    sx={{
                      height: 24,
                      fontSize: 12,
                      fontWeight: 600,
                      bgcolor: statusColor.bg,
                      color: statusColor.color,
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 },
                    }}
                  />
                )}

                {/* Priority Chip */}
                {editingPriority ? (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                      <Select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        sx={{ fontSize: 13 }}
                      >
                        <MenuItem value="low">ต่ำ</MenuItem>
                        <MenuItem value="medium">ปานกลาง</MenuItem>
                        <MenuItem value="high">สูง</MenuItem>
                        <MenuItem value="urgent">เร่งด่วน</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton size="small" color="primary" onClick={handleUpdatePriority}>
                      <CheckCircle fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => {
                      setEditingPriority(false);
                      setNewPriority(ticket.priority);
                    }}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Chip
                    label={getPriorityLabel(ticket.priority)}
                    size="small"
                    onClick={() => setEditingPriority(true)}
                    icon={<Flag sx={{ fontSize: 14 }} />}
                    sx={{
                      height: 24,
                      fontSize: 12,
                      fontWeight: 600,
                      bgcolor: priorityColor.bg,
                      color: priorityColor.color,
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 },
                    }}
                  />
                )}

                {/* Satisfaction Rating */}
                {ticket.satisfaction_rating && (
                  <Chip
                    icon={<Star sx={{ fontSize: 14, color: '#f59e0b' }} />}
                    label={`${ticket.satisfaction_rating}/5`}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: 12,
                      fontWeight: 600,
                      bgcolor: '#fef3c7',
                      color: '#d97706',
                    }}
                  />
                )}
              </Box>
            </Box>
            
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>

          {/* Status Comment Field (when editing status) */}
          {editingStatus && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="หมายเหตุการเปลี่ยนสถานะ (ไม่บังคับ)"
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                sx={{ fontSize: 13 }}
              />
            </Box>
          )}
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ p: 0, display: 'flex', height: 'calc(100% - 140px)' }}>
          {/* Left Side - Ticket Info */}
          <Box sx={{ width: 320, borderRight: '1px solid #e2e8f0', p: 2, overflowY: 'auto' }}>
            {/* User Info */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#64748b', mb: 1.5 }}>
                ผู้แจ้งปัญหา
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: '#e0f2fe', color: '#0284c7', fontSize: 16 }}>
                  {ticket.user_fullname?.charAt(0) || ticket.user_username?.charAt(0) || '?'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    {ticket.user_fullname || ticket.user_username}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#64748b' }}>
                    {ticket.user_id}
                  </Typography>
                  {ticket.user_phone && (
                    <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                      📞 {ticket.user_phone}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Ticket Details */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#64748b', mb: 1.5 }}>
                รายละเอียด
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Created At */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ fontSize: 16, color: '#64748b' }} />
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                      สร้างเมื่อ
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                      {formatFullDate(ticket.created_at)}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#64748b' }}>
                      ({formatTimeAgo(ticket.created_at)})
                    </Typography>
                  </Box>
                </Box>

                {/* Assigned To */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ fontSize: 16, color: '#64748b' }} />
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                      ผู้รับผิดชอบ
                    </Typography>
                    {ticket.assigned_to ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: '#6366f1' }}>
                          {ticket.assigned_admin_username?.charAt(0) || 'A'}
                        </Avatar>
                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                          {ticket.assigned_admin_username || ticket.assigned_to}
                        </Typography>
                      </Box>
                    ) : (
                      <Button
                        size="small"
                        startIcon={<AssignmentInd />}
                        onClick={handleAssignToSelf}
                        sx={{
                          textTransform: 'none',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#6366f1',
                          p: 0,
                          minWidth: 'auto',
                        }}
                      >
                        รับเคสนี้
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* First Response */}
                {ticket.first_response_at && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chat sx={{ fontSize: 16, color: '#64748b' }} />
                    <Box>
                      <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                        ตอบกลับครั้งแรก
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                        {formatTimeAgo(ticket.first_response_at)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Resolved At */}
                {ticket.resolved_at && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 16, color: '#16a34a' }} />
                    <Box>
                      <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                        แก้ไขเมื่อ
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                        {formatTimeAgo(ticket.resolved_at)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#64748b', mb: 1 }}>
                รายละเอียดปัญหา
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Typography sx={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {ticket.description}
                </Typography>
              </Paper>
            </Box>

            {/* Satisfaction Comment */}
            {ticket.satisfaction_comment && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#64748b', mb: 1 }}>
                    ความคิดเห็นจากผู้ใช้
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#fef3c7', border: '1px solid #fde68a', boxShadow: 'none' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        star <= ticket.satisfaction_rating ? (
                          <Star key={star} sx={{ fontSize: 16, color: '#f59e0b' }} />
                        ) : (
                          <StarBorder key={star} sx={{ fontSize: 16, color: '#d1d5db' }} />
                        )
                      ))}
                    </Box>
                    <Typography sx={{ fontSize: 12, lineHeight: 1.6 }}>
                      {ticket.satisfaction_comment}
                    </Typography>
                  </Paper>
                </Box>
              </>
            )}

            {/* History */}
            {history.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#64748b', mb: 1.5 }}>
                    ประวัติการเปลี่ยนแปลง
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {history.map((item, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          p: 1.5, 
                          bgcolor: '#f8fafc', 
                          borderRadius: 1,
                          borderLeft: '3px solid #6366f1',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
                            {getStatusLabel(item.old_status)} → {getStatusLabel(item.new_status)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 10, color: '#64748b' }}>
                          โดย {item.changed_by_username} • {formatTimeAgo(item.created_at)}
                        </Typography>
                        {item.comment && (
                          <Typography sx={{ fontSize: 11, color: '#475569', mt: 0.5 }}>
                            💬 {item.comment}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            )}
          </Box>

          {/* Right Side - Messages */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Messages Area */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
              {messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Chat sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                  <Typography sx={{ fontSize: 14, color: '#64748b' }}>
                    ยังไม่มีการสนทนา
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                    ส่งข้อความแรกเพื่อเริ่มการสนทนา
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {messages.map((msg, index) => {
                    const isAdmin = msg.sender_role === 'admin';
                    const isCurrentAdmin = msg.sender_id === currentAdminId;
                    const isInternalNote = msg.is_internal_note === 1;

                    return (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                          gap: 1,
                        }}
                      >
                        {!isAdmin && (
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#e0f2fe', color: '#0284c7', fontSize: 14 }}>
                            {msg.sender_fullname?.charAt(0) || msg.sender_username?.charAt(0) || '?'}
                          </Avatar>
                        )}
                        
                        <Box sx={{ maxWidth: '70%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                              {msg.sender_fullname || msg.sender_username}
                            </Typography>
                            <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>
                              {formatTimeAgo(msg.created_at)}
                            </Typography>
                            {isInternalNote && (
                              <Chip
                                icon={<VisibilityOff sx={{ fontSize: 10 }} />}
                                label="หมายเหตุภายใน"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: 9,
                                  bgcolor: '#fef3c7',
                                  color: '#d97706',
                                }}
                              />
                            )}
                          </Box>
                          
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor: isInternalNote 
                                ? '#fef3c7' 
                                : isAdmin 
                                  ? '#6366f1' 
                                  : '#f1f5f9',
                              color: isAdmin && !isInternalNote ? '#fff' : '#1e293b',
                              border: isInternalNote ? '1px dashed #f59e0b' : 'none',
                              boxShadow: 'none',
                              borderRadius: 2,
                            }}
                          >
                            <Typography sx={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                              {msg.message}
                            </Typography>
                          </Paper>
                        </Box>

                        {isAdmin && (
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: 14 }}>
                            {msg.sender_username?.charAt(0) || 'A'}
                          </Avatar>
                        )}
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Box>
              )}
            </Box>

            {/* Reply Form */}
            <Box sx={{ borderTop: '1px solid #e2e8f0', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {isInternalNote ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
                      <Typography sx={{ fontSize: 12 }}>
                        {isInternalNote ? 'หมายเหตุภายใน (เฉพาะแอดมิน)' : 'ส่งถึงผู้ใช้'}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder={isInternalNote ? "เขียนหมายเหตุภายใน..." : "พิมพ์ข้อความตอบกลับ..."}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  sx={{ fontSize: 13 }}
                />
                <Button
                  variant="contained"
                  endIcon={<Send />}
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim() || sendingReply}
                  sx={{
                    bgcolor: isInternalNote ? '#f59e0b' : '#6366f1',
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                    minWidth: 100,
                    '&:hover': { 
                      bgcolor: isInternalNote ? '#d97706' : '#4f46e5',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {sendingReply ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    'ส่ง'
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ borderTop: '1px solid #e2e8f0', px: 3, py: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none', fontSize: 14 }}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TicketDetailDialog;
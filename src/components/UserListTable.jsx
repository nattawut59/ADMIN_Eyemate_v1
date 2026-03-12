// src/components/UserListTable.jsx
import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Chip, Avatar, Box, Menu, MenuItem,
  Tooltip, Typography,
} from '@mui/material';
import {
  Visibility, Edit, Delete, MoreVert, Phone, Email,
  Person, LocalHospital, FiberManualRecord,
} from '@mui/icons-material';

const UserListTable = ({
  users,
  pagination,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onViewDetail,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleMenuAction = (action) => {
    if (!selectedUser) return;

    switch (action) {
      case 'view':
        onViewDetail(selectedUser);
        break;
      case 'edit':
        onEdit(selectedUser);
        break;
      case 'delete':
        onDelete(selectedUser);
        break;
      case 'activate':
        onStatusChange(selectedUser.user_id, 'active');
        break;
      case 'deactivate':
        onStatusChange(selectedUser.user_id, 'inactive');
        break;
      case 'suspend':
        onStatusChange(selectedUser.user_id, 'suspended');
        break;
      default:
        break;
    }
    handleMenuClose();
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

  const getStatusChip = (status) => {
    const statusConfig = {
      active: {
        label: 'ใช้งาน',
        color: '#16a34a',
        bgcolor: '#dcfce7',
      },
      inactive: {
        label: 'ไม่ใช้งาน',
        color: '#64748b',
        bgcolor: '#f1f5f9',
      },
      suspended: {
        label: 'ระงับ',
        color: '#dc2626',
        bgcolor: '#fee2e2',
      },
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
      <Chip
        icon={<FiberManualRecord sx={{ fontSize: 8 }} />}
        label={config.label}
        size="small"
        sx={{
          height: 24,
          fontSize: 12,
          fontWeight: 600,
          bgcolor: config.bgcolor,
          color: config.color,
          '& .MuiChip-icon': { color: 'inherit' },
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleChangePage = (event, newPage) => {
    onPageChange(newPage + 1); // Material-UI uses 0-based index
  };

  const handleChangeRowsPerPage = (event) => {
    onLimitChange(parseInt(event.target.value, 10));
    onPageChange(1);
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, color: '#64748b', width: 60 }}>
                #
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, color: '#64748b' }}>
                รหัส / ชื่อผู้ใช้
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, color: '#64748b' }}>
                ชื่อ-นามสกุล
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, color: '#64748b' }}>
                ประเภท
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, color: '#64748b' }}>
                HN / License
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, color: '#64748b' }}>
                เบอร์โทร
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, color: '#64748b' }}>
                สถานะ
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, color: '#64748b' }}>
                วันที่สมัคร
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, color: '#64748b', width: 120 }}>
                จัดการ
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow
                key={user.user_id}
                sx={{
                  '&:hover': { bgcolor: '#f8fafc' },
                  cursor: 'pointer',
                }}
                onClick={() => onViewDetail(user)}
              >
                <TableCell sx={{ fontSize: 13, color: '#64748b' }}>
                  {(page - 1) * limit + index + 1}
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: getRoleColor(user.role) + '20',
                        color: getRoleColor(user.role),
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {user.role === 'patient' ? (
                        <Person sx={{ fontSize: 20 }} />
                      ) : (
                        <LocalHospital sx={{ fontSize: 20 }} />
                      )}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
                        {user.user_id}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                        {user.username}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                    {user.full_name || '-'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={getRoleLabel(user.role)}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: 12,
                      fontWeight: 600,
                      bgcolor: getRoleColor(user.role) + '15',
                      color: getRoleColor(user.role),
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>
                    {user.profile_number || '-'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {user.phone ? (
                      <>
                        <Phone sx={{ fontSize: 14, color: '#64748b' }} />
                        <Typography sx={{ fontSize: 13 }}>{user.phone}</Typography>
                      </>
                    ) : (
                      <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>-</Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell>{getStatusChip(user.status)}</TableCell>

                <TableCell>
                  <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                    {formatDate(user.created_at)}
                  </Typography>
                </TableCell>

                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="ดูรายละเอียด">
                      <IconButton
                        size="small"
                        onClick={() => onViewDetail(user)}
                        sx={{ color: '#3b82f6' }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="แก้ไข">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(user)}
                        sx={{ color: '#f59e0b' }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="ตัวเลือกเพิ่มเติม">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user)}
                        sx={{ color: '#64748b' }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={pagination.totalItems}
          page={page - 1}
          onPageChange={handleChangePage}
          rowsPerPage={limit}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="แสดงต่อหน้า:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
          }
          sx={{
            borderTop: '1px solid #e2e8f0',
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontSize: 13,
            },
          }}
        />
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleMenuAction('view')}>
          <Visibility sx={{ mr: 1, fontSize: 20 }} />
          ดูรายละเอียด
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <Edit sx={{ mr: 1, fontSize: 20 }} />
          แก้ไขข้อมูล
        </MenuItem>
        {selectedUser?.status === 'active' ? (
          <>
            <MenuItem onClick={() => handleMenuAction('deactivate')}>
              ปิดการใช้งาน
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('suspend')}>
              ระงับการใช้งาน
            </MenuItem>
          </>
        ) : (
          <MenuItem onClick={() => handleMenuAction('activate')}>
            เปิดการใช้งาน
          </MenuItem>
        )}
        <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: '#dc2626' }}>
          <Delete sx={{ mr: 1, fontSize: 20 }} />
          ลบผู้ใช้
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserListTable;
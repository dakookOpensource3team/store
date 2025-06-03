import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ApiService from '../services/api';

export default function Coupon() {
  const [open, setOpen] = useState(false);
  const [myCoupons, setMyCoupons] = useState([]);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (open) {
      loadMyCoupons();
      loadAvailableCoupons();
    }
  }, [open]);

  const loadMyCoupons = async () => {
    try {
      if (user && user.memberId) {
        const coupons = await ApiService.getCoupons(user.memberId);
        setMyCoupons(coupons || []);
      }
    } catch (error) {
      console.error('내 쿠폰 로드 에러:', error);
      setMyCoupons([]);
    }
  };

  const loadAvailableCoupons = async () => {
    try {
      const couponDefinitions = await ApiService.getCouponDefinitions();
      setAvailableCoupons(couponDefinitions || []);
    } catch (error) {
      console.error('발급 가능한 쿠폰 로드 에러:', error);
      setAvailableCoupons([]);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getCoupon = async (couponDefinitionId) => {
    try {
      if (!user || !user.memberId) {
        setSnackbar({ 
          open: true, 
          message: '로그인이 필요합니다.', 
          severity: 'error' 
        });
        return;
      }

      await ApiService.registerCoupon(user.memberId, couponDefinitionId);
      setSnackbar({ 
        open: true, 
        message: '쿠폰이 발급되었습니다!', 
        severity: 'success' 
      });
      
      // 내 쿠폰 목록 새로고침
      loadMyCoupons();
    } catch (error) {
      console.error('쿠폰 발급 에러:', error);
      setSnackbar({ 
        open: true, 
        message: '쿠폰 발급에 실패했습니다.', 
        severity: 'error' 
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '무제한';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbar({ 
        open: true, 
        message: '쿠폰 코드가 복사되었습니다!', 
        severity: 'success' 
      });
    });
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<LocalOfferIcon />}
        onClick={handleOpen}
        sx={{
          background: 'linear-gradient(90deg, #a259e6 0%, #e0c3fc 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #9240de 0%, #d9b0fc 100%)',
          },
          borderRadius: 3,
          fontWeight: 700,
          px: 3,
          py: 1.5,
        }}
      >
        쿠폰함
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(90deg, #a259e6 0%, #e0c3fc 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalOfferIcon />
            쿠폰함
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              발급 가능한 쿠폰
            </Typography>
            {availableCoupons.length > 0 ? (
              availableCoupons.map((coupon) => (
                <Paper 
                  key={coupon.id} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    border: '1px dashed #a259e6',
                    background: 'linear-gradient(135deg, #f8f3ff 0%, #ffffff 100%)',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color="primary">
                      {coupon.name}
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => getCoupon(coupon.id)}
                      sx={{ 
                        background: 'linear-gradient(90deg, #a259e6 0%, #e0c3fc 100%)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #9240de 0%, #d9b0fc 100%)',
                        },
                      }}
                    >
                      발급받기
                    </Button>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {coupon.isRatio 
                      ? `${Math.round(coupon.ratio * 100)}% 할인` 
                      : `${coupon.fixedAmount?.toLocaleString()}원 할인`
                    }
                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                현재 발급 가능한 쿠폰이 없습니다.
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              내 쿠폰 목록
            </Typography>
            {myCoupons.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                보유한 쿠폰이 없습니다.
              </Typography>
            ) : (
              <List>
                {myCoupons.map((coupon) => (
                  <ListItem 
                    key={coupon.id}
                    sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 2, 
                      mb: 1,
                      bgcolor: coupon.isUsed ? 'grey.100' : 'white'
                    }}
                  >
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600}
                            sx={{ 
                              textDecoration: coupon.isUsed ? 'line-through' : 'none',
                              color: coupon.isUsed ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {coupon.name}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            color={coupon.isUsed ? 'text.secondary' : 'primary'} 
                            fontWeight={700}
                          >
                            {coupon.isRatio 
                              ? `${Math.round(coupon.ratio * 100)}%` 
                              : `${coupon.fixedAmount?.toLocaleString()}원`
                            }
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {coupon.isUsed ? '사용됨' : '사용 가능'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
} 
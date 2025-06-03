import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import {
  CardGiftcard as CouponIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import Toast from '../components/Toast';

export default function Coupon() {
  const [userCoupons, setUserCoupons] = useState([]);
  const [couponDefinitions, setCouponDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    name: '',
    isRatio: true,
    ratio: 0,
    fixedAmount: 0
  });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadUserCoupons(), loadCouponDefinitions()]);
  };

  const loadUserCoupons = async () => {
    try {
      if (user && user.memberId) {
        const data = await ApiService.getCoupons(user.memberId);
        setUserCoupons(data || []);
      }
    } catch (error) {
      console.error('사용자 쿠폰 로드 에러:', error);
      setError('쿠폰을 불러오는데 실패했습니다.');
    }
  };

  const loadCouponDefinitions = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCouponDefinitions();
      setCouponDefinitions(data || []);
    } catch (error) {
      console.error('쿠폰 정의 로드 에러:', error);
      setError('쿠폰 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const createWelcomeCoupon = async () => {
    try {
      setLoading(true);
      
      // 신규회원 10% 할인 쿠폰 생성
      const couponData = {
        name: '신규회원 환영 10%  할인쿠폰',
        isRatio: true,
        ratio: 0.1,
        fixedAmount: 0
      };
      
      // 먼저 동일한 이름의 쿠폰이 있는지 확인
      const existingCoupon = couponDefinitions.find(coupon => 
        coupon.name && coupon.name.includes('신규회원')
      );
      
      if (existingCoupon) {
        setToast({ 
          open: true, 
          message: '신규회원 쿠폰이 이미 존재합니다.', 
          severity: 'warning' 
        });
        return;
      }
      
      // ApiService에 createCouponDefinition 메서드가 없으므로 임시로 POST 요청
      const response = await fetch('/api/coupon-definition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couponData)
      });
      
      if (response.ok) {
        setToast({ 
          open: true, 
          message: '신규회원 10% 할인 쿠폰이 생성되었습니다! 이제 회원가입 시 자동으로 발급됩니다. 🎉', 
          severity: 'success' 
        });
        loadCouponDefinitions(); // 목록 새로고침
      } else {
        throw new Error('쿠폰 생성 실패');
      }
    } catch (error) {
      console.error('신규회원 쿠폰 생성 에러:', error);
      setToast({ 
        open: true, 
        message: '신규회원 쿠폰 생성에 실패했습니다.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCoupon = async (couponDefinitionId) => {
    try {
      if (!user || !user.memberId) {
        setToast({ open: true, message: '로그인이 필요합니다.', severity: 'error' });
        return;
      }

      await ApiService.registerCoupon(user.memberId, couponDefinitionId);
      setToast({ open: true, message: '쿠폰이 발급되었습니다!', severity: 'success' });
      loadUserCoupons();
    } catch (error) {
      console.error('쿠폰 등록 에러:', error);
      setToast({ open: true, message: '쿠폰 발급에 실패했습니다.', severity: 'error' });
    }
  };

  const handleDeleteCoupon = async (userCouponId) => {
    try {
      await ApiService.deleteCoupon(userCouponId);
      setToast({ open: true, message: '쿠폰이 삭제되었습니다.', severity: 'success' });
      loadUserCoupons();
    } catch (error) {
      console.error('쿠폰 삭제 에러:', error);
      setToast({ open: true, message: '쿠폰 삭제에 실패했습니다.', severity: 'error' });
    }
  };

  const formatCouponValue = (coupon) => {
    if (coupon.isRatio) {
      return `${Math.round(coupon.ratio * 100)}% 할인`;
    } else {
      return `${coupon.fixedAmount?.toLocaleString()}원 할인`;
    }
  };

  const formatValidUntil = (dateString) => {
    if (!dateString) {
      // 날짜가 없으면 기본적으로 3개월 후로 설정 (백엔드 로직과 동일)
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      return futureDate.toLocaleDateString('ko-KR');
    }
    
    try {
      // Instant 형태의 문자열을 Date로 변환
      let date;
      if (typeof dateString === 'string') {
        // ISO 문자열이거나 Instant 타임스탬프인 경우
        date = new Date(dateString);
      } else if (typeof dateString === 'number') {
        // 밀리초 타임스탬프인 경우
        date = new Date(dateString);
      } else {
        throw new Error('Invalid date format');
      }
      
      // 유효하지 않은 날짜인 경우 (1970년 등)
      if (isNaN(date.getTime()) || date.getFullYear() < 2020) {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 3);
        return futureDate.toLocaleDateString('ko-KR');
      }
      
      return date.toLocaleDateString('ko-KR');
    } catch (error) {
      // 파싱 에러 시 기본값 반환 (3개월 후)
      console.log('날짜 파싱 에러:', error, 'dateString:', dateString);
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      return futureDate.toLocaleDateString('ko-KR');
    }
  };

  if (loading && userCoupons.length === 0 && couponDefinitions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>쿠폰 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CouponIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight={700} color="primary.main">
            쿠폰 관리
          </Typography>
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            color="success"
            startIcon={<CelebrationIcon />}
            onClick={createWelcomeCoupon}
            disabled={loading}
            sx={{ borderRadius: 3, fontWeight: 700, mr: 2 }}
          >
            신규회원 10% 쿠폰 생성
          </Button>
        </Box>
      </Box>

      {/* 내 쿠폰 목록 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          내 쿠폰 ({userCoupons.length}개)
        </Typography>
        
        {userCoupons.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CouponIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography color="text.secondary">
              보유한 쿠폰이 없습니다.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {userCoupons.map((coupon) => (
              <Grid item xs={12} sm={6} md={4} key={coupon.id}>
                <Card 
                  sx={{ 
                    borderRadius: 3, 
                    border: '2px dashed',
                    borderColor: coupon.isUsed ? 'grey.300' : 'primary.main',
                    opacity: coupon.isUsed ? 0.6 : 1,
                    position: 'relative'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ pr: 1 }}>
                        {coupon.name}
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        sx={{ minWidth: 'auto', p: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </Box>
                    
                    <Typography variant="h5" color="primary" fontWeight={700} sx={{ mb: 1 }}>
                      {formatCouponValue(coupon)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      만료일: {formatValidUntil(coupon.expiredAt || coupon.validUntil)}
                    </Typography>
                    
                    <Chip 
                      label={coupon.isUsed ? "사용완료" : "사용가능"} 
                      color={coupon.isUsed ? "default" : "success"}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* 발급 가능한 쿠폰 목록 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          발급 가능한 쿠폰 ({couponDefinitions.length}개)
        </Typography>
        
        {couponDefinitions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              발급 가능한 쿠폰이 없습니다.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {couponDefinitions.map((coupon) => (
              <Grid item xs={12} sm={6} md={4} key={coupon.id}>
                <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.300' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                      {coupon.name}
                    </Typography>
                    
                    <Typography variant="h5" color="primary" fontWeight={700} sx={{ mb: 2 }}>
                      {formatCouponValue(coupon)}
                    </Typography>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleRegisterCoupon(coupon.id)}
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                      쿠폰 받기
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Toast 
        open={toast.open} 
        message={toast.message} 
        severity={toast.severity} 
        onClose={() => setToast({ ...toast, open: false })} 
      />
    </Container>
  );
} 
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '',
    address: '', detailedAddress: '', zipCode: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userData = {
      email: form.email,
      password: form.password,
      username: form.username,
      name: form.name,
      addressReq: {
        address: form.address,
        detailedAddress: form.detailedAddress,
        zipCode: parseInt(form.zipCode) || 0
      }
    };

    console.log('회원가입 요청 데이터:', userData);

    try {
      const response = await ApiService.register(userData);
      console.log('회원가입 응답:', response);
      
      // 회원가입 성공 후 자동 로그인 시도
      try {
        const loginResponse = await ApiService.signIn(form.username, form.password);
        console.log('자동 로그인 응답:', loginResponse);
        
        if (loginResponse && loginResponse.accessToken) {
          // 로그인 성공 후 현재 사용자 정보 조회
          try {
            const currentUser = await ApiService.getCurrentMember();
            console.log('현재 사용자 정보:', currentUser);
            
            // 사용자 정보 저장
            const userInfo = {
              memberId: currentUser.memberId,
              email: currentUser.email,
              username: currentUser.username,
              name: currentUser.name,
              isLoggedIn: true
            };
            localStorage.setItem('user', JSON.stringify(userInfo));
            
            // 신규회원 쿠폰 발급 시도 (실패해도 회원가입은 성공으로 처리)
            try {
              await handleNewMemberCoupon(currentUser.memberId);
              setSnackbar({ 
                open: true, 
                message: '🎉 회원가입이 완료되었습니다! 신규회원 10% 할인 쿠폰이 발급되었습니다!', 
                severity: 'success' 
              });
            } catch (couponError) {
              console.log('쿠폰 발급 실패 (권한 없음 또는 서버 오류):', couponError);
              setSnackbar({ 
                open: true, 
                message: '🎉 회원가입이 완료되었습니다! (쿠폰은 마이페이지에서 확인해보세요)', 
                severity: 'success' 
              });
            }
            
            // 2초 후 홈으로 이동
            setTimeout(() => {
              navigate('/');
            }, 2000);
            
          } catch (userError) {
            console.error('사용자 정보 조회 에러:', userError);
            setSnackbar({ 
              open: true, 
              message: '🎉 회원가입이 완료되었습니다! 로그인 페이지로 이동해주세요.', 
              severity: 'success' 
            });
            // 로그인 페이지로 이동
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          }
        } else {
          setSnackbar({ 
            open: true, 
            message: '🎉 회원가입이 완료되었습니다! 로그인 페이지로 이동해주세요.', 
            severity: 'success' 
          });
          // 로그인 페이지로 이동
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (loginError) {
        console.error('자동 로그인 에러:', loginError);
        setSnackbar({ 
          open: true, 
          message: '🎉 회원가입이 완료되었습니다! 로그인 페이지로 이동해주세요.', 
          severity: 'success' 
        });
        // 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
      
    } catch (error) {
      console.error('회원가입 에러:', error);
      console.error('에러 상세:', error.response?.data);
      
      let errorMessage = '회원가입 실패';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({ 
        open: true, 
        message: `❌ ${errorMessage}`, 
        severity: 'error' 
      });
    }
  };

  // 신규회원 쿠폰 발급 처리 함수
  const handleNewMemberCoupon = async (memberId) => {
    try {
      // 사용 가능한 쿠폰 정의 조회
      const couponDefinitions = await ApiService.getCouponDefinitions();
      console.log('사용 가능한 쿠폰 정의들:', couponDefinitions);
      
      // 신규회원 쿠폰 찾기
      const welcomeCoupon = couponDefinitions.find(coupon => 
        coupon.name && (
          coupon.name.includes('신규') || 
          coupon.name.includes('회원가입') || 
          coupon.name.includes('웰컴') ||
          coupon.name.includes('Welcome') ||
          (coupon.isRatio && coupon.ratio === 10)
        )
      );
      
      if (welcomeCoupon) {
        console.log('신규회원 쿠폰 발견:', welcomeCoupon);
        await ApiService.registerCoupon(memberId, welcomeCoupon.id);
        console.log('신규회원 쿠폰 발급 완료');
      } else {
        console.log('신규회원 쿠폰이 존재하지 않습니다.');
        throw new Error('신규회원 쿠폰이 존재하지 않습니다.');
      }
    } catch (error) {
      console.error('신규회원 쿠폰 발급 에러:', error);
      throw error; // 에러를 다시 던져서 상위에서 처리하도록
    }
  };

  const steps = ['기본 정보', '주소 입력'];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafd' }}>
      <Card sx={{ maxWidth: 420, width: '100%', p: 3, borderRadius: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2, textAlign: 'center', color: 'primary.main' }}>
            회원가입
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>
          {activeStep === 0 && (
            <Box component="form" autoComplete="off">
              <TextField
                label="이름" name="name" value={form.name} onChange={handleChange} fullWidth required margin="normal"
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
              />
              <TextField
                label="아이디" name="username" value={form.username} onChange={handleChange} fullWidth required margin="normal"
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
              />
              <TextField
                label="이메일" name="email" value={form.email} onChange={handleChange} fullWidth required margin="normal"
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
              />
              <TextField
                label="비밀번호" name="password" type="password" value={form.password} onChange={handleChange} fullWidth required margin="normal"
                InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment> }}
              />
              <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleNext}>
                다음
              </Button>
            </Box>
          )}
          {activeStep === 1 && (
            <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
              <TextField
                label="주소" name="address" value={form.address} onChange={handleChange} fullWidth required margin="normal"
                placeholder="예: 서울특별시 강남구 테헤란로"
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationCityIcon /></InputAdornment> }}
              />
              <TextField
                label="상세주소" name="detailedAddress" value={form.detailedAddress} onChange={handleChange} fullWidth required margin="normal"
                placeholder="예: 123호, 456동 789호"
              />
              <TextField
                label="우편번호" name="zipCode" value={form.zipCode} onChange={handleChange} fullWidth required margin="normal"
                type="number"
                placeholder="예: 12345"
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button onClick={handleBack}>이전</Button>
                <Button variant="contained" color="primary" type="submit">회원가입</Button>
              </Box>
            </Box>
          )}
        </CardContent>
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Card>
    </Box>
  );
} 
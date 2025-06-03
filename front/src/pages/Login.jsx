import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import ApiService from '../services/api';
import InputAdornment from '@mui/material/InputAdornment';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';

// 관리자 계정 정보
const ADMIN_EMAIL = 'admin@openshop.kr';
const ADMIN_PASSWORD = 'admin123';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    // initKakao(); // Removed
  }, []);

  const handleSubmit = async (e) => {
    console.log('Login handleSubmit function called');
    e.preventDefault();
    
    try {
      // ApiService.signIn 호출 (username 사용)
      const response = await ApiService.signIn(username, password);
      
      // JWT 토큰에서 사용자 정보 추출
      let userRole = 'user';
      let successMessage = '로그인되었습니다.';

      if (username === ADMIN_EMAIL && response) { // 관리자 이메일이고 로그인 성공 시
        userRole = 'admin';
        successMessage = '관리자로 로그인되었습니다. 모든 권한이 부여됩니다.';
      }

      // 로그인 성공 후 사용자 프로필 정보 가져오기
      try {
        const memberInfo = await ApiService.getCurrentMember();
        console.log('사용자 정보:', memberInfo);
        
        localStorage.setItem('user', JSON.stringify({
          memberId: memberInfo.memberId,
          username: memberInfo.username,
          name: memberInfo.name,
          email: memberInfo.email,
          role: memberInfo.role,
          isLoggedIn: true
        }));
      } catch (profileError) {
        console.warn('프로필 정보 가져오기 실패:', profileError);
        // 프로필 가져오기 실패 시 임시 정보 사용
        localStorage.setItem('user', JSON.stringify({
          username: username,
          name: userRole === 'admin' ? '관리자' : '사용자',
          role: userRole,
          isLoggedIn: true
        }));
      }

      setSnackbar({
        open: true,
        message: successMessage,
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/');
      }, userRole === 'admin' ? 1500 : 1000);

    } catch (error) {
      console.error('로그인 실패:', error);
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      // ApiService.signIn에서 throw한 에러 객체(error.data)에 서버 메시지가 있을 수 있음
      if (error && error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error && error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ marginTop: 10, display: 'flex', justifyContent: 'center', background: '#f9f9f9', minHeight: '80vh', pb: 8 }}>
      <Card sx={{ maxWidth: 400, width: '100%', p: 2, borderRadius: 4, boxShadow: '0 4px 32px 0 rgba(162,89,230,0.10)' }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3, textAlign: 'center', color: 'primary.main', letterSpacing: 1 }}>
            로그인
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="아이디(사용자명)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
              margin="normal"
              sx={{ borderRadius: 2, background: '#faf7fd' }}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
            />
            <TextField
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              margin="normal"
              sx={{ borderRadius: 2, background: '#faf7fd' }}
              InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment> }}
            />
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ mt: 2, py: 1.5, fontWeight: 700, borderRadius: 3 }}>
              로그인
            </Button>
          </form>
          
          <Typography variant="body2" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
            회원이 아니신가요?{' '}
            <Button
              onClick={() => navigate('/register')}
              sx={{ textTransform: 'none', textDecoration: 'underline' }}
              variant="text"
            >
              회원가입
            </Button>
          </Typography>
          
          <Typography variant="body2" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
            관리자 계정을 만드시겠습니까?{' '}
            <Button
              onClick={() => navigate('/admin-register')}
              sx={{ textTransform: 'none', textDecoration: 'underline', fontSize: '0.875rem' }}
              variant="text"
              color="warning"
            >
              관리자 가입
            </Button>
          </Typography>
        </CardContent>
      </Card>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 
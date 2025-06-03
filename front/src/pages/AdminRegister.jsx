import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    detailedAddress: '',
    zipCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await ApiService.registerAdmin(formData);
      setSuccess('관리자 계정이 성공적으로 생성되었습니다!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('관리자 가입 에러:', error);
      setError(error.response?.data?.message || '관리자 가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 12, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          🔐 관리자 계정 생성
        </Typography>
        
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          쿠폰 정의 관리 권한을 가진 관리자 계정을 생성합니다.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="이름"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="이메일"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="비밀번호"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="전화번호"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="주소"
            name="address"
            value={formData.address}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="상세주소"
            name="detailedAddress"
            value={formData.detailedAddress}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="우편번호"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            margin="normal"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff5252, #ff9800)',
              }
            }}
          >
            {loading ? '생성 중...' : '관리자 계정 생성'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/login')}
            sx={{ mt: 1 }}
          >
            로그인 페이지로 돌아가기
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 
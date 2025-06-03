import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  Select,
  MenuItem,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const banks = [
  '신한은행', '국민은행', '하나은행', '우리은행', '농협은행',
  'SC제일은행', '씨티은행', '기업은행', '수협은행', '대구은행',
  '부산은행', '경남은행', '광주은행', '전북은행', '제주은행',
  '카카오뱅크', '토스뱅크', 'K뱅크'
];

const PaymentMethodSelector = ({ onSelect }) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
  });

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    // 무통장 입금 선택 시에도 바로 처리하지 않고 대기
  };

  const handleCardInfoChange = (field, value) => {
    // 카드번호 자동 포맷팅
    if (field === 'cardNumber') {
      value = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1-');
    }
    // 유효기간 자동 포맷팅
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/');
    }
    // CVV는 숫자만
    if (field === 'cvv') {
      value = value.replace(/\D/g, '');
    }
    setCardInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleCardPayment = () => {
    if (!selectedBank) {
      alert('💳 카드 발급 은행을 선택해주세요.');
      return;
    }
    
    if (!cardInfo.cardNumber || !cardInfo.expiryDate || !cardInfo.cvv || !cardInfo.cardHolder) {
      alert('💳 카드 정보를 모두 입력해주세요.');
      return;
    }

    onSelect({
      method: 'CARD',
      bank: selectedBank,
      cardInfo: cardInfo
    });
  };

  const handleBankTransferConfirm = () => {
    // 무통장 입금 확인 시 처리
    onSelect({ method: 'CASH' });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        💳 결제 방법 선택
      </Typography>
      
      <FormControl component="fieldset" fullWidth>
        <RadioGroup value={selectedMethod} onChange={(e) => handleMethodSelect(e.target.value)}>
          
          {/* 신용카드 결제 */}
          <Paper 
            elevation={selectedMethod === 'CARD' ? 3 : 1}
            sx={{ 
              mb: 2, 
              border: selectedMethod === 'CARD' ? '2px solid #a259e6' : '1px solid #e0e0e0',
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 3 }}>
              <FormControlLabel
                value="CARD"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CreditCardIcon sx={{ mr: 1.5, color: '#a259e6', fontSize: 28 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        신용카드 결제
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        모든 카드사 결제 가능
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              
              {selectedMethod === 'CARD' && (
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #f0f0f0' }}>
                  <Grid container spacing={3}>
                    {/* 은행 선택 */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#666' }}>
                        🏦 카드 발급 은행
                      </Typography>
                      <Select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        fullWidth
                        displayEmpty
                        sx={{ 
                          bgcolor: 'white',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      >
                        <MenuItem value="" disabled>
                          <Typography color="text.secondary">은행을 선택해주세요</Typography>
                        </MenuItem>
                        {banks.map((bank) => (
                          <MenuItem key={bank} value={bank}>
                            {bank}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>

                    {/* 카드 정보 */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#666' }}>
                        💳 카드 정보
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="카드번호"
                        placeholder="1234-5678-9012-3456"
                        value={cardInfo.cardNumber}
                        onChange={(e) => handleCardInfoChange('cardNumber', e.target.value)}
                        inputProps={{ maxLength: 19 }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="유효기간"
                        placeholder="MM/YY"
                        value={cardInfo.expiryDate}
                        onChange={(e) => handleCardInfoChange('expiryDate', e.target.value)}
                        inputProps={{ maxLength: 5 }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="CVV"
                        placeholder="123"
                        type="password"
                        value={cardInfo.cvv}
                        onChange={(e) => handleCardInfoChange('cvv', e.target.value)}
                        inputProps={{ maxLength: 4 }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="카드 소유자명"
                        placeholder="홍길동"
                        value={cardInfo.cardHolder}
                        onChange={(e) => handleCardInfoChange('cardHolder', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    {/* 카드 결제 버튼 */}
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleCardPayment}
                        fullWidth
                        size="large"
                        sx={{ 
                          mt: 2, 
                          py: 1.5, 
                          fontWeight: 700,
                          borderRadius: 2,
                          background: 'linear-gradient(45deg, #a259e6, #6366f1)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #9333ea, #4f46e5)',
                          }
                        }}
                      >
                        💳 카드 결제 진행
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </Paper>

          {/* 무통장 입금 */}
          <Paper 
            elevation={selectedMethod === 'CASH' ? 3 : 1}
            sx={{ 
              mb: 2, 
              border: selectedMethod === 'CASH' ? '2px solid #2193b0' : '1px solid #e0e0e0',
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 3 }}>
              <FormControlLabel
                value="CASH"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalanceIcon sx={{ mr: 1.5, color: '#2193b0', fontSize: 28 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        무통장 입금
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        24시간 내 입금 완료 시 주문 확정
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              
              {selectedMethod === 'CASH' && (
                <Box>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mt: 3, 
                      borderRadius: 2,
                      '& .MuiAlert-message': { width: '100%' }
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      🏦 입금 계좌 정보
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>은행:</strong> 농협은행
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>계좌번호:</strong> 123-456-789012
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>예금주:</strong> (주)STORE
                      </Typography>
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        ⚠️ 주문 후 24시간 내 입금하지 않으면 주문이 자동 취소됩니다.
                      </Typography>
                    </Box>
                  </Alert>
                  
                  <Button
                    variant="contained"
                    onClick={handleBankTransferConfirm}
                    fullWidth
                    size="large"
                    sx={{ 
                      mt: 3, 
                      py: 1.5, 
                      fontWeight: 700,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #2193b0, #6dd5ed)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      }
                    }}
                  >
                    🏦 무통장 입금 선택
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default PaymentMethodSelector; 
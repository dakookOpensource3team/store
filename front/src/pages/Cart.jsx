import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import PaymentIcon from '@mui/icons-material/Payment';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { Paper, CircularProgress } from '@mui/material';
import ApiService from '../services/api.js';

function mapCartItem(raw) {
  console.log('Cart.jsx mapCartItem 원본 데이터:', raw);
  const mapped = {
    cartId: raw.id || raw.cartId,
    title: raw.productName || raw.title || 'Unknown Product',
    price: raw.price?.amount || raw.price || 0,
    image: raw.imageUrl || raw.image || (raw.images && raw.images.length > 0 ? raw.images[0] : '/placeholder-image.jpg'),
    quantity: raw.quantity || 1,
    productId: raw.productId || raw.id,
  };
  console.log('Cart.jsx mapCartItem 매핑된 데이터:', mapped);
  return mapped;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchCart = async () => {
    if (user && user.memberId) {
      setLoading(true);
      try {
        const data = await ApiService.getCart(user.memberId);
        console.log('장바구니 API 응답:', data);
        const mapped = (data || []).map(mapCartItem);
        setCartItems(mapped);
        console.log('프론트에서 사용하는 cartItems:', mapped);
      } catch (e) {
        setToast({ open: true, message: '장바구니를 불러오지 못했습니다.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, []);

  const handleChangeQuantity = async (cartId, quantity) => {
    if (quantity > 0) {
      try {
        await ApiService.updateCartItem(cartId, quantity);
        setToast({ open: true, message: '✅ 수량이 변경되었습니다.', severity: 'info' });
        fetchCart();
      } catch (e) {
        setToast({ open: true, message: '❌ 수량 변경 실패', severity: 'error' });
      }
    }
  };

  const handleRemove = async (cartId) => {
    try {
      await ApiService.removeFromCart(cartId);
      setToast({ open: true, message: '🗑️ 장바구니에서 삭제되었습니다.', severity: 'warning' });
      fetchCart();
    } catch (e) {
      setToast({ open: true, message: '❌ 삭제 실패', severity: 'error' });
    }
  };

  const handleCartCheckout = () => {
    if (cartItems.length === 0) {
      setToast({ open: true, message: '⚠️ 장바구니가 비어있습니다.', severity: 'warning' });
      return;
    }
    
    // 장바구니 아이템을 체크아웃에 필요한 형식으로 변환
    const checkoutItems = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      // 추가 필요 시 다른 데이터도 포함
    }));
    
    navigate('/checkout', { 
      state: { 
        items: checkoutItems,
        isDirectCheckout: false,
        cartItems: cartItems // 원본 장바구니 데이터도 전달
      } 
    });
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <Box sx={{ marginTop: 10, maxWidth: 800, mx: 'auto', p: { xs: 1, sm: 3 }, background: '#f9f9f9', minHeight: '80vh', pb: 8 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 4, textAlign: 'center', color: 'primary.main', letterSpacing: 1 }}>
          장바구니
        </Typography>
        {cartItems.length > 0 && (
          <Box sx={{ mb: 4 }}>
            {/* 총 합계 정보 */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: '#f8f9ff', mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: 'primary.main' }}>
                🛒 주문 요약
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  상품 금액 ({cartItems.length}개)
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {total.toLocaleString()}원
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  배송비
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {total >= 50000 ? '무료' : '3,000원'}
                </Typography>
              </Box>
              
              <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={700}>
                    총 결제 금액
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight={700}>
                    {(total + (total >= 50000 ? 0 : 3000)).toLocaleString()}원
                  </Typography>
                </Box>
                {total < 50000 && (
                  <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                    💡 {(50000 - total).toLocaleString()}원 더 구매하시면 무료배송!
                  </Typography>
                )}
              </Box>
            </Paper>
            
            {/* 결제하기 버튼 */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={<PaymentIcon />}
              onClick={handleCartCheckout}
              sx={{ 
                py: 2, 
                borderRadius: 3, 
                fontWeight: 700, 
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #a259e6, #6366f1)',
                boxShadow: '0 4px 16px rgba(162, 89, 230, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #9333ea, #4f46e5)',
                  boxShadow: '0 6px 20px rgba(162, 89, 230, 0.4)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              💳 결제하기 ({(total + (total >= 50000 ? 0 : 3000)).toLocaleString()}원)
            </Button>
          </Box>
        )}
        <Grid container spacing={3}>
          {loading ? (
            <Grid item xs={12} sx={{ textAlign: 'center', mt: 8 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" color="text.secondary">장바구니를 불러오는 중...</Typography>
            </Grid>
          ) : cartItems.length === 0 ? (
            <Grid item xs={12} sx={{ textAlign: 'center', mt: 8 }}>
              <Box sx={{ 
                p: 6, 
                bgcolor: 'white', 
                borderRadius: 4, 
                boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                border: '1px solid #f0f0f0'
              }}>
                <ShoppingCartOutlinedIcon sx={{ 
                  fontSize: 100, 
                  color: 'primary.light', 
                  mb: 3,
                  opacity: 0.7
                }} />
                <Typography variant="h4" color="text.primary" sx={{ mb: 2, fontWeight: 700 }}>
                  장바구니가 비어 있어요
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                  원하는 상품을 장바구니에 담아보세요!<br/>
                  다양한 상품들이 여러분을 기다리고 있어요 🛍️✨
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/products')} 
                  sx={{ 
                    borderRadius: 3, 
                    fontWeight: 700, 
                    px: 5, 
                    py: 2,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #a259e6, #6366f1)',
                    boxShadow: '0 4px 16px rgba(162, 89, 230, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #9333ea, #4f46e5)',
                      boxShadow: '0 6px 20px rgba(162, 89, 230, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  🛒 쇼핑하러 가기
                </Button>
              </Box>
            </Grid>
          ) : (
            cartItems.map((item) => (
              <Grid item xs={12} key={item.cartId}>
                <Card sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 2.5, 
                  borderRadius: 3, 
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
                  mb: 1,
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <CardMedia
                    component="img"
                    image={item.image}
                    alt={item.title}
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      objectFit: 'cover', 
                      borderRadius: 2, 
                      mr: 3, 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: '1px solid #f0f0f0'
                    }}
                  />
                  <CardContent sx={{ flex: 1, p: 0 }}>
                    <Typography variant="h6" fontWeight={700} noWrap sx={{ mb: 1, color: '#333' }}>
                      {item.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      단가: {item.price?.toLocaleString()}원
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleChangeQuantity(item.cartId, item.quantity - 1)}
                        sx={{ 
                          bgcolor: 'primary.light', 
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.main' },
                          width: 32,
                          height: 32
                        }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          minWidth: 40, 
                          textAlign: 'center', 
                          fontWeight: 700, 
                          bgcolor: '#f8f9fa',
                          borderRadius: 1,
                          py: 0.5,
                          px: 1
                        }}
                      >
                        {item.quantity}
                      </Typography>
                      
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleChangeQuantity(item.cartId, item.quantity + 1)}
                        sx={{ 
                          bgcolor: 'primary.light', 
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.main' },
                          width: 32,
                          height: 32
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="h6" color="primary" fontWeight={700}>
                      총 {(item.price * item.quantity)?.toLocaleString()}원
                    </Typography>
                  </CardContent>
                  
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemove(item.cartId)} 
                    sx={{ 
                      ml: 2,
                      bgcolor: 'error.light',
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'error.main',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </>
  );
} 
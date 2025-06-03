import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Toast from '../components/Toast';
import ApiService from '../services/api';

function mapCartItem(raw) {
  console.log('Order.jsx mapCartItem 원본 데이터:', raw);
  const mapped = {
    cartId: raw.id || raw.cartId,
    title: raw.productName || raw.title || 'Unknown Product',
    price: raw.price?.amount || raw.price || 0,
    image: raw.imageUrl || raw.image || (raw.images && raw.images.length > 0 ? raw.images[0] : '/placeholder-image.jpg'),
    quantity: raw.quantity || 1,
    productId: raw.productId || raw.id, // productId 추가
  };
  console.log('Order.jsx mapCartItem 매핑된 데이터:', mapped);
  return mapped;
}

export default function Order() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [items, setItems] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    async function loadItems() {
      const stateItems = location.state?.items || [];
      console.log('Order.jsx location.state.items:', stateItems);
      
      if (stateItems.length === 0) {
        console.log('Order.jsx: 주문 상품이 없습니다.');
        return;
      }
      
      // 바로구매 등으로 넘어온 경우 productId, quantity만 있을 수 있음
      if (stateItems.length > 0 && stateItems[0].productId && !stateItems[0].title) {
        console.log('Order.jsx: 바로구매 상품 정보 로딩 중...');
        try {
          // 상품 상세 정보 불러오기
          const loaded = await Promise.all(stateItems.map(async (item) => {
            console.log('Order.jsx: 상품 정보 요청:', item.productId);
            const product = await ApiService.getProductById(item.productId);
            console.log('Order.jsx: 받은 상품 정보:', product);
            return mapCartItem({ 
              ...product, 
              quantity: item.quantity,
              id: product.id,
              productId: item.productId 
            });
          }));
          setItems(loaded);
          console.log('Order.jsx loaded items:', loaded);
        } catch (error) {
          console.error('Order.jsx: 상품 정보 로딩 실패:', error);
          setToast({ open: true, message: '상품 정보를 불러오는데 실패했습니다.', severity: 'error' });
        }
      } else {
        console.log('Order.jsx: 장바구니 상품 매핑 중...');
        // 이미 매핑된 데이터라면 그대로 사용
        const mapped = stateItems.map(mapCartItem);
        setItems(mapped);
        console.log('Order.jsx mapped items:', mapped);
      }
    }
    loadItems();
    // eslint-disable-next-line
  }, [location.state]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = async () => {
    if (!user || !user.memberId) {
      setToast({ open: true, message: '로그인이 필요합니다.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      // 백엔드 PlaceOrderRequest 구조에 맞게 데이터 구성
      const orderData = {
        orderLines: items.map(item => ({
          productId: item.productId || item.id,
          amount: (item.price || 0) * (item.quantity || 1), // 총 금액
          price: item.price || 0, // 단가
          quantity: item.quantity || 1
        })),
        shippingInfo: {
          address: {
            city: user.city || '서울시',
            guGun: user.guGun || '강남구', 
            dong: user.dong || '역삼동',
            bunji: user.bunji || '123-45',
            address: user.address || '기본 주소',
            addressDetail: user.addressDetail || '',
            zipcode: user.zipcode || '00000'
          },
          receiver: {
            name: user.name || '주문자',
            phoneNumber: user.phone || '010-0000-0000'
          }
        },
        orderer: {
          memberId: user.memberId,
          name: user.name || '주문자',
          phoneNumber: user.phone || '010-0000-0000',
          email: user.email || 'user@example.com'
        },
        paymentInfo: 'CARD', // enum 값
        coupons: []
      };
      
      console.log('Order.jsx: 주문 요청 데이터:', orderData);
      await ApiService.createOrder(orderData);
      setOrderSuccess(true);
      setToast({ open: true, message: '주문이 완료되었습니다!', severity: 'success' });
      
      // 주문 완료 후 장바구니 비우기 (장바구니에서 온 경우)
      if (location.state?.isDirectCheckout === false && user.memberId) {
        try {
          await ApiService.clearCart(user.memberId);
          console.log('Order.jsx: 장바구니 비우기 완료');
        } catch (clearError) {
          console.warn('Order.jsx: 장바구니 비우기 실패:', clearError);
        }
      }
    } catch (e) {
      console.error('Order.jsx: 주문 실패:', e);
      setToast({ open: true, message: e.message || '주문 실패', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            주문이 완료되었습니다!
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>메인으로</Button>
          <Button variant="outlined" sx={{ ml: 2 }} onClick={() => navigate('/orders')}>주문내역 보기</Button>
        </Paper>
        <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 4, textAlign: 'center', color: 'primary.main' }}>
        주문/결제
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          {items.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                주문할 상품이 없습니다.
              </Typography>
            </Grid>
          ) : (
            items.map((item, index) => (
              <Grid item xs={12} md={6} key={item.cartId || item.id || index}>
                <Card sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 3 }}>
                  <CardMedia
                    component="img"
                    image={item.image || '/placeholder-image.jpg'}
                    alt={item.title || 'Product Image'}
                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 2, mr: 2 }}
                    onError={(e) => { 
                      console.log('Order.jsx: 이미지 로드 실패:', item.image);
                      e.target.src = '/placeholder-image.jpg'; 
                    }}
                  />
                  <CardContent sx={{ flex: 1, p: 0 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ mb: 0.5 }}>
                      {item.title || 'Unknown Product'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.price?.toLocaleString() || '0'}원 × {item.quantity || 1}개
                    </Typography>
                    <Typography variant="body1" color="primary" fontWeight={700}>
                      {((item.price || 0) * (item.quantity || 1))?.toLocaleString()}원
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Typography variant="h6" fontWeight={700}>
            총 합계: <span style={{ color: '#7b1fa2' }}>{total.toLocaleString()}원</span>
          </Typography>
        </Box>
      </Paper>
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleOrder}
          disabled={loading || items.length === 0}
          sx={{ px: 6, py: 1.5, fontWeight: 700, fontSize: 18 }}
        >
          {loading ? '결제 중...' : '결제하기'}
        </Button>
      </Box>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </Container>
  );
} 
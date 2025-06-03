import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Skeleton,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  Divider,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import Toast from '../components/Toast';

// 상품 상세 스켈레톤
const ProductDetailSkeleton = () => (
  <Grid container spacing={4}>
    <Grid item xs={12} md={6}>
      <Skeleton variant="rectangular" height={400} />
    </Grid>
    <Grid item xs={12} md={6}>
      <Skeleton variant="text" height={32} width="40%" />
      <Skeleton variant="text" height={48} width="70%" />
      <Skeleton variant="text" height={32} width="30%" />
      <Box sx={{ my: 4 }}>
        <Skeleton variant="text" height={24} width="100%" />
        <Skeleton variant="text" height={24} width="100%" />
      </Box>
      <Box sx={{ mt: 4 }}>
        <Skeleton variant="rectangular" height={48} width="100%" />
      </Box>
    </Grid>
  </Grid>
);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ApiService.getProductById(id);
      setProduct(data);
      // 최근 본 상품에 추가
      let memberId = undefined;
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('loadProduct - localStorage user 정보:', user);
        if (user && user.memberId) {
          memberId = user.memberId;
        }
      } catch (e) {
        console.error('localStorage user 파싱 에러:', e);
      }
      if (memberId && id && data) {
        // 최근 본 상품 저장
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        const filteredProducts = recentlyViewed.filter(item => item.id !== data.id);
        const newRecentlyViewed = [
          {
            id: data.id,
            title: data.title,
            price: data.price,
            images: data.images,
            image: data.images && data.images.length > 0 ? data.images[0] : '/placeholder-image.jpg'
          },
          ...filteredProducts
        ].slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(newRecentlyViewed));
        window.dispatchEvent(new Event('storage'));
      } else {
        console.warn('최근 본 상품 추가: memberId 또는 productId가 유효하지 않습니다.', memberId, id);
      }
    } catch (error) {
      console.error('상품 로드 에러:', error);
      setSnackbar({
        open: true,
        message: '상품을 불러오는데 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(99, value));
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    let memberId;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.memberId) {
        memberId = user.memberId;
      }
    } catch (e) {}
    if (!memberId) {
      setSnackbar({ open: true, message: '로그인 후 이용해주세요.', severity: 'warning' });
      return;
    }
    try {
      await ApiService.addToCart({ productId: id, quantity, memberId });
      setSnackbar({ open: true, message: '장바구니에 상품이 추가되었습니다.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: '장바구니 추가 중 오류가 발생했습니다.', severity: 'error' });
    }
  };

  const handleBuyNow = () => {
    navigate('/checkout', { 
      state: { 
        items: [{ productId: id, quantity }] 
      } 
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ProductDetailSkeleton />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" color="error">
          상품을 찾을 수 없습니다.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 브레드크럼 */}
      <Breadcrumbs sx={{ mb: 4 }}>
        <Link color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
          홈
        </Link>
        <Link color="inherit" onClick={() => navigate('/products')} sx={{ cursor: 'pointer' }}>
          상품
        </Link>
        <Typography color="text.primary">{product.title}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* 상품 이미지 */}
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'}
            alt={product.title}
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: 1,
            }}
            onError={e => { e.target.src = '/placeholder-image.jpg'; }}
          />
          {(!product.images || product.images.length === 0) && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center', width: '100%' }}>
              상품 준비중...
            </Typography>
          )}
        </Grid>

        {/* 상품 정보 */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {product.brand}
            </Typography>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.title}
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              {product.price.toLocaleString()}원
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 수량 선택 */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>수량</Typography>
              <IconButton
                size="small"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                size="small"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                inputProps={{ 
                  min: 1, 
                  max: 99,
                  style: { textAlign: 'center', width: '50px' }
                }}
                sx={{ mx: 1 }}
              />
              <IconButton
                size="small"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 99}
              >
                <AddIcon />
              </IconButton>
            </Box>

            {/* 구매 버튼 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleBuyNow}
                sx={{ flex: 1 }}
              >
                바로 구매
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                sx={{ flex: 1 }}
              >
                장바구니
              </Button>
              <IconButton>
                <FavoriteIcon />
              </IconButton>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* 상품 상세 정보 탭 */}
      <Paper sx={{ mt: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          centered
        >
          <Tab label="상품 상세" />
          <Tab label="리뷰" />
          <Tab label="Q&A" />
          <Tab label="배송/교환/반품" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Typography>
              {product.description}
            </Typography>
          )}
          {tabValue === 1 && (
            <Typography>
              리뷰 기능 준비중입니다.
            </Typography>
          )}
          {tabValue === 2 && (
            <Typography>
              Q&A 기능 준비중입니다.
            </Typography>
          )}
          {tabValue === 3 && (
            <Typography>
              배송/교환/반품 안내 준비중입니다.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* 알림 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardActionArea, CardMedia, CardContent, IconButton, Stack, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { useNavigate } from 'react-router-dom';

const RecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 로컬 스토리지에서 최근 본 상품 불러오기
    const loadRecentProducts = () => {
      const savedProducts = localStorage.getItem('recentlyViewed');
      if (savedProducts) {
        setRecentProducts(JSON.parse(savedProducts));
      }
    };

    // 핀 상태 불러오기
    const loadPinnedState = () => {
      const pinnedState = localStorage.getItem('recentlyViewedPinned');
      if (pinnedState) {
        setIsPinned(JSON.parse(pinnedState));
        if (JSON.parse(pinnedState)) {
          setIsOpen(true);
        }
      }
    };

    loadRecentProducts();
    loadPinnedState();
    // 다른 페이지에서 상품을 볼 때마다 이 컴포넌트가 업데이트되도록 이벤트 추가
    window.addEventListener('storage', loadRecentProducts);

    return () => {
      window.removeEventListener('storage', loadRecentProducts);
    };
  }, []);

  const removeProduct = (id) => {
    const updatedProducts = recentProducts.filter(product => product.id !== id);
    setRecentProducts(updatedProducts);
    localStorage.setItem('recentlyViewed', JSON.stringify(updatedProducts));
    // 로컬 스토리지 이벤트 발생시키기
    window.dispatchEvent(new Event('storage'));
  };

  const togglePin = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    localStorage.setItem('recentlyViewedPinned', JSON.stringify(newPinnedState));
  };

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        left: isOpen ? 0 : -180, // 닫혔을 때는 일부만 보이게
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        transition: 'left 0.3s ease',
        display: 'flex',
      }}
    >
      {/* 사이드바 본체 */}
      <Box
        sx={{
          width: 180,
          maxHeight: '80vh',
          overflowY: 'auto',
          bgcolor: 'white',
          boxShadow: '2px 0 10px rgba(0,0,0,0.15)',
          borderRadius: '0 8px 8px 0',
          py: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'primary.main' }}>
            최근 본 상품
          </Typography>
          <Tooltip title={isPinned ? "고정 해제" : "고정하기"}>
            <IconButton 
              onClick={togglePin} 
              size="small" 
              color={isPinned ? "primary" : "default"}
            >
              {isPinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        
        <Stack spacing={1.5} sx={{ px: 1.5 }}>
          {recentProducts.slice(0, 5).map((product) => (
            <Card key={product.id} sx={{ position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  removeProduct(product.id);
                }}
                sx={{
                  position: 'absolute',
                  right: 2,
                  top: 2,
                  bgcolor: 'rgba(255,255,255,0.7)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  zIndex: 2,
                  width: 18,
                  height: 18,
                  p: 0,
                }}
              >
                <CloseIcon fontSize="small" sx={{ fontSize: 12 }} />
              </IconButton>
              <CardActionArea onClick={() => navigate(`/products/${product.id}`)}>
                <CardMedia
                  component="img"
                  height="80"
                  image={
                    (product.images && product.images.length > 0 && product.images[0]) ||
                    product.image ||
                    '/placeholder-image.jpg'
                  }
                  alt={product.title}
                  onError={e => { e.target.src = '/placeholder-image.jpg'; }}
                />
                {(!product.images || product.images.length === 0) && (
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>
                    상품 준비중...
                  </Typography>
                )}
                <CardContent sx={{ py: 1, px: 1.5 }}>
                  <Typography noWrap variant="caption" fontWeight={600} sx={{ display: 'block' }}>
                    {product.title}
                  </Typography>
                  <Typography variant="caption" color="primary" fontWeight="bold">
                    {product.price}원
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* 열기/닫기 탭 */}
      <Box
        onClick={() => !isPinned && setIsOpen(!isOpen)}
        sx={{
          width: 36,
          height: 80,
          bgcolor: isPinned ? 'primary.light' : 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isPinned ? 'default' : 'pointer',
          borderRadius: '0 8px 8px 0',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        {isPinned && (
          <PushPinIcon fontSize="small" sx={{ position: 'absolute', top: 5, right: 5 }} />
        )}
        <VisibilityIcon />
      </Box>
    </Box>
  );
};

export default RecentlyViewed; 
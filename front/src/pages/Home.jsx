import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Paper from '@mui/material/Paper';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CelebrationIcon from '@mui/icons-material/Celebration';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import RecentlyViewed from '../components/RecentlyViewed';
import Coupon from '../components/Coupon';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import ApiService from '../services/api';
import Skeleton from '@mui/material/Skeleton';
import { localizeCategories } from '../services/api';

const sliderImages = [
  { url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80', text: '여름 신상 최대 50% 할인!' },
  { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80', text: '가구/인테리어 특별전' },
  { url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=900&q=80', text: '전자제품 베스트셀러' },
];

// 카테고리 아이콘 색상 정의
const categoryColors = [
  'linear-gradient(90deg, #e0c3fc 0%, #a259e6 100%)',
  'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)',
  'linear-gradient(90deg, #6dd5ed 0%, #2193b0 100%)',
  'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)',
  'linear-gradient(90deg, #e0c3fc 0%, #a259e6 100%)'
];

// 카테고리 영어-한글 매핑
const categoryMapping = {
  'Clothes': '의류',
  'Electronics': '전자제품',
  'Furniture': '가구/인테리어',
  'Shoes': '신발',
  'Others': '기타',
  'Miscellaneous': '잡화'
};

const reviews = [
  { name: '김철수', text: '배송이 정말 빨라요! 상품도 신선하고 만족합니다.', rating: 5 },
  { name: '이영희', text: '할인 상품이 많아서 자주 이용해요.', rating: 4 },
  { name: '박민수', text: '고객센터 응대가 친절해서 좋았습니다.', rating: 5 },
  { name: '정지원', text: '상품의 퀄리티가 좋고 가격도 합리적이에요.', rating: 4 },
  { name: '최수진', text: '다양한 상품을 구경할 수 있어서 좋습니다. 배송도 빠르고 포장이 꼼꼼해요.', rating: 5 },
  { name: '강현우', text: '앱 사용이 편리하고 적립금 혜택도 좋아요!', rating: 4 },
];

// 상품 스켈레톤 컴포넌트
const ProductSkeleton = () => (
  <Grid xs={12} sm={6} md={3}>
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="rectangular" height={200} animation="wave" />
      <CardContent>
        <Skeleton variant="text" height={32} width="80%" animation="wave" />
        <Skeleton variant="text" height={24} width="40%" animation="wave" />
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="text" height={24} width="60%" animation="wave" />
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 상품 로드
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const responseData = await ApiService.getProducts({ page: 0, size: 8 });
        
        let productList = [];
        if (responseData && Array.isArray(responseData.content)) {
          productList = responseData.content;
        } else if (Array.isArray(responseData)) {
          productList = responseData;
        } else {
          console.error('상품 데이터 형식이 예상과 다릅니다:', responseData);
        }
        setProducts(productList);

      } catch (error) {
        console.error('상품 로드 에러:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // 상품 클릭 시 최근 본 상품에 추가하는 함수
  const handleProductClick = (product) => {
    // 로컬 스토리지에서 기존 최근 본 상품 목록 가져오기
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    
    // 이미 있는 상품인지 확인하고 있으면 제거
    const filteredProducts = recentlyViewed.filter(item => item.id !== product.id);
    
    // 새 상품을 배열 앞에 추가 (최대 10개까지만 저장)
    const newRecentlyViewed = [
      {
        id: product.id,
        title: product.title,
        price: product.price,
        images: product.images,
        image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'
      },
      ...filteredProducts
    ].slice(0, 10);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('recentlyViewed', JSON.stringify(newRecentlyViewed));
    
    // 스토리지 이벤트 발생시켜 다른 컴포넌트에 알리기
    window.dispatchEvent(new Event('storage'));
    
    // 상품 페이지로 이동
    navigate(`/products/${product.id}`);
  };

  return (
    <Box sx={{ marginTop: 8, minHeight: '80vh', pb: 6 }}>
      {/* 최근 본 상품 - 사이드바로 분리 */}
      <RecentlyViewed />
      
      {/* 상단 슬라이더 */}
      <Box sx={{ maxWidth: 900, mx: 'auto', mb: 5, mt: 6 }}>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          loop
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          navigation
          pagination={{ clickable: true }}
          style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 32px 0 rgba(162,89,230,0.10)' }}
        >
          {sliderImages.map((slide, idx) => (
            <SwiperSlide key={idx}>
              <Box sx={{ position: 'relative', height: 260, background: '#eee' }}>
                <img src={slide.url} alt={slide.text} style={{ width: '100%', height: 260, objectFit: 'cover', filter: 'brightness(0.7)' }} />
                <Box sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, rgba(162,89,230,0.6) 0%, rgba(224,195,252,0.4) 100%)',
                  opacity: 0.85,
                }} />
                <Box sx={{
                  position: 'absolute',
                  left: { xs: 24, md: 48 },
                  bottom: { xs: 24, md: 44 },
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 2
                }}>
                  <Typography variant="h4" fontWeight={700} sx={{ textShadow: '0 2px 12px rgba(0,0,0,0.35)', letterSpacing: 1 }}>
                    {slide.text}
                  </Typography>
                </Box>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* 추천 상품 */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', mb: 6 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3, textAlign: 'center', color: '#1976d2' }}>
          추천 상품
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {loading ? (
            // 스켈레톤 UI (ProductSkeleton 컴포넌트가 Grid item 역할을 하므로 4번 반복)
            <>
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
            </>
          ) : Array.isArray(products) && products.length > 0 ? (
            products.map((product) => (
              <Grid xs={12} sm={6} md={3} key={product.id}>
                <Card sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.12)'
                  }
                }}>
                  <CardActionArea onClick={() => handleProductClick(product)}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'}
                      alt={product.title}
                      sx={{ objectFit: 'cover' }}
                      onError={e => { e.target.src = '/placeholder-image.jpg'; }}
                    />
                    {(!product.images || product.images.length === 0) && (
                      <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', top: 12, left: 0, width: '100%', textAlign: 'center', zIndex: 2 }}>
                        상품 준비중...
                      </Typography>
                    )}
                    <CardContent>
                      <Typography gutterBottom variant="subtitle1" fontWeight={600} noWrap>
                        {product.title}
                      </Typography>
                      <Typography variant="body1" color="primary" fontWeight="bold">
                        {product.price}원
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.category?.koreanName || product.category?.name || product.category?.slug || '미분류'}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography sx={{ textAlign: 'center', width: '100%', py: 3 }}>
              상품이 없습니다.
            </Typography>
          )}
        </Grid>
      </Box>

      {/* 고객 후기 - 캐러셀 개선 */}
      <Box sx={{ maxWidth: 900, mx: 'auto', mb: 6 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: 'primary.main', letterSpacing: 1, textAlign: 'center' }}>
          고객 후기
        </Typography>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            900: {
              slidesPerView: 3,
            },
          }}
          style={{ padding: '10px 5px 40px 5px' }}
        >
          {reviews.map((r, i) => (
            <SwiperSlide key={i}>
              <Box sx={{
                p: 3,
                borderRadius: 3,
                minHeight: 150,
                background: '#fff',
                boxShadow: '0 2px 16px 0 rgba(162,89,230,0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 25px 0 rgba(162,89,230,0.15)',
                }
              }}>
                <Box>
                  <Typography fontWeight={700} sx={{ mb: 1, color: 'primary.main' }}>{r.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{r.text}</Typography>
                </Box>
                <Typography sx={{ color: '#a259e6', fontWeight: 700, fontSize: 18 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Typography>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* 푸터 */}
      <Box sx={{ textAlign: 'center', color: '#fff', fontSize: 15, mt: 8, py: 4, borderTop: 'none', background: 'linear-gradient(90deg, #a259e6 0%, #e0c3fc 100%)', letterSpacing: 1 }}>
        <Box sx={{ mb: 2, fontWeight: 600, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CallIcon fontSize="small" /> 고객센터: 070-1234-5678
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon fontSize="small" /> 이메일: help@openshop.kr
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MessageIcon fontSize="small" /> 카카오톡: @오픈쇼핑
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Button size="small" color="inherit" sx={{ color: '#fff', fontWeight: 700 }}>이용약관</Button>
          <Button size="small" color="inherit" sx={{ color: '#fff', fontWeight: 700 }}>개인정보처리방침</Button>
          <Button size="small" color="inherit" sx={{ color: '#fff', fontWeight: 700 }}>회사소개</Button>
        </Box>
        <Box sx={{ fontSize: 13, color: '#f3eaff' }}>
          © {new Date().getFullYear()} 오픈소스SW기초 쇼핑몰. All rights reserved.
        </Box>
      </Box>
    </Box>
  );
} 
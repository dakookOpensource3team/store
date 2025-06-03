import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Skeleton,
  Divider,
  CardActions,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate, useLocation } from 'react-router-dom';
import ApiService from '../services/api';
import { localizeCategories } from '../services/api';
import Toast from '../components/Toast';

// 상품 스켈레톤 컴포넌트
const ProductSkeleton = () => (
  <Grid item xs={6} sm={4} md={3}>
    <Card sx={{ height: '100%', boxShadow: 'none', borderRadius: 0 }}>
      <Skeleton variant="rectangular" height={200} animation="wave" />
      <CardContent sx={{ px: 0 }}>
        <Skeleton variant="text" height={24} width="60%" animation="wave" />
        <Skeleton variant="text" height={20} width="40%" animation="wave" />
        <Box sx={{ mt: 1 }}>
          <Skeleton variant="text" height={24} width="50%" animation="wave" />
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

export default function Products() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: [],
    priceRange: [],
    brand: [],
  });
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState('default');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // 필터 옵션
  const filterOptions = {
    category: categories,
    priceRange: [
      { id: '0-50000', name: '5만원 이하' },
      { id: '50000-100000', name: '5만원-10만원' },
      { id: '100000-', name: '10만원 이상' },
    ],
    brand: [
      { id: 'brand1', name: '브랜드1' },
      { id: 'brand2', name: '브랜드2' },
      { id: 'brand3', name: '브랜드3' },
    ],
  };

  // 정렬 옵션
  const sortOptions = [
    { value: 'default', label: '기본순' },
    { value: 'lowPrice', label: '낮은 가격순' },
    { value: 'highPrice', label: '높은 가격순' },
  ];

  // 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await ApiService.getCategories();
        const localizedCategories = localizeCategories(data);
        setCategories(localizedCategories.map(cat => ({
          id: cat.id,
          name: cat.koreanName || cat.name
        })));
      } catch (error) {
        console.error('카테고리 로드 에러:', error);
      }
    };
    
    loadCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialCategoryId = params.get('categoryId');
    if (initialCategoryId) {
      console.log('URL에서 읽은 categoryId:', initialCategoryId);
      // categoryId를 숫자로 변환
      const categoryIdNum = parseInt(initialCategoryId, 10);
      if (!isNaN(categoryIdNum)) {
        // 카테고리 변경 시 다른 필터들 초기화
        setFilters({
          category: [categoryIdNum],
          priceRange: [],
          brand: [],
        });
        setPage(1);
        console.log('카테고리 필터 설정:', categoryIdNum);
      }
    } else {
      // categoryId가 없으면 카테고리 필터 초기화
      setFilters(prev => ({
        ...prev,
        category: [],
      }));
      console.log('카테고리 필터 초기화');
    }
    // eslint-disable-next-line
  }, [location.search]);

  useEffect(() => {
    loadProducts();
  }, [filters, sort, page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: page - 1,
        size: 12,
      };
      
      console.log('상품 조회 파라미터:', params);
      console.log('현재 필터 상태:', filters);
      console.log('현재 정렬 옵션:', sort);
      
      let response;
      
      // 카테고리 필터가 있는 경우 카테고리별 API 호출
      if (filters.category && filters.category.length > 0) {
        const categoryId = filters.category[0]; // 첫 번째 카테고리만 사용
        console.log('카테고리별 상품 조회:', categoryId);
        response = await ApiService.getProductsByCategory(categoryId, params);
        
        // 카테고리별 조회 후 정렬 적용 (클라이언트 사이드)
        if (response && Array.isArray(response)) {
          if (sort === 'lowPrice') {
            response.sort((a, b) => a.price - b.price);
          } else if (sort === 'highPrice') {
            response.sort((a, b) => b.price - a.price);
          }
        }
      } else {
        // 전체 상품 조회 - 정렬 옵션에 따라 다른 API 호출
        switch (sort) {
          case 'lowPrice':
            response = await ApiService.getProductsByLowPrice(params);
            break;
          case 'highPrice':
            response = await ApiService.getProductsByHighPrice(params);
            break;
          case 'default':
          default:
            response = await ApiService.getProducts(params);
            break;
        }
      }
      
      console.log('상품 API 응답:', response);

      // 응답 구조에 따라 products 추출
      let productsArr = [];
      if (Array.isArray(response)) {
        productsArr = response;
      } else if (response && Array.isArray(response.data)) {
        productsArr = response.data;
      } else if (response && Array.isArray(response.content)) {
        productsArr = response.content;
      } else {
        productsArr = [];
      }

      // 가격대 필터링 (클라이언트 사이드)
      if (filters.priceRange && filters.priceRange.length > 0) {
        console.log('가격대 필터링 적용:', filters.priceRange);
        productsArr = productsArr.filter(product => {
          return filters.priceRange.some(range => {
            if (range === '0-50000') return product.price <= 50000;
            if (range === '50000-100000') return product.price > 50000 && product.price <= 100000;
            if (range === '100000-') return product.price > 100000;
            return false;
          });
        });
        console.log('가격대 필터링 후 상품 수:', productsArr.length);
      }

      // 브랜드 필터링 (클라이언트 사이드) - 현재는 브랜드 정보가 없으므로 스킵
      // if (filters.brand && filters.brand.length > 0) {
      //   // 브랜드 필터링 로직
      // }

      if (page === 1) {
        setProducts(productsArr);
      } else {
        setProducts(prev => [...prev, ...productsArr]);
      }

      setHasMore(response.hasMore || false);
      setTotal(response.total || productsArr.length);
      console.log('로드된 상품 수:', productsArr.length);
      console.log('필터링된 상품들:', productsArr);
    } catch (error) {
      console.error('상품 로드 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value,
    }));
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  const handleAddToCart = async (productId) => {
    let memberId;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.memberId) memberId = user.memberId;
    } catch (e) {}
    if (!memberId) {
      setToast({ open: true, message: '로그인 후 이용해주세요.', severity: 'warning' });
      return;
    }
    try {
      await ApiService.addToCart({ productId, quantity: 1, memberId });
      setToast({ open: true, message: '장바구니에 추가되었습니다.', severity: 'success' });
    } catch (error) {
      setToast({ open: true, message: '장바구니 추가 실패', severity: 'error' });
    }
  };

  const handleProductClick = async (productId) => {
    // productId 유효성 검사
    if (!productId) {
      console.error('productId가 유효하지 않습니다:', productId);
      return;
    }

    let memberId;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.memberId) memberId = user.memberId;
    } catch (e) {
      console.error('localStorage user 정보 파싱 에러:', e);
    }
    
    // 로그인 체크를 먼저 수행
    if (!memberId) {
      console.log('로그인하지 않은 사용자 - 최근 본 상품 API 호출 생략');
      // 로그인하지 않아도 상품 상세 페이지로 이동은 허용
      navigate(`/products/${productId}`);
      return;
    }
    
    try {
      console.log('최근 본 상품 추가:', { memberId, productId });
      await ApiService.addLastlyProduct(memberId, productId);
      // 상품 상세 페이지로 이동
      navigate(`/products/${productId}`);
    } catch (error) {
      console.error('최근 본 상품 추가 에러:', error);
      // 에러가 발생해도 상품 상세 페이지로 이동
      navigate(`/products/${productId}`);
    }
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, filterArray) => 
      count + filterArray.length, 0
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 8 }}>
      {/* 필터 및 정렬 헤더 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        borderBottom: '1px solid #eee',
        pb: 2
      }}>
        <Button
          startIcon={<FilterListIcon />}
          onClick={() => setFilterDrawerOpen(true)}
          sx={{ color: '#000' }}
        >
          필터
          {getActiveFiltersCount() > 0 && (
            <Chip
              size="small"
              label={getActiveFiltersCount()}
              sx={{ ml: 1, bgcolor: '#0078ff', color: '#fff' }}
            />
          )}
        </Button>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={sort}
            onChange={handleSortChange}
            displayEmpty
            sx={{ '.MuiSelect-select': { py: 1 } }}
          >
            {sortOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 활성화된 필터 표시 */}
      {getActiveFiltersCount() > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {Object.entries(filters).map(([type, values]) =>
            values.map(value => {
              const option = filterOptions[type].find(opt => opt.id === value);
              return option && (
                <Chip
                  key={`${type}-${value}`}
                  label={option.name}
                  onDelete={() => handleFilterChange(
                    type,
                    filters[type].filter(v => v !== value)
                  )}
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              );
            })
          )}
        </Box>
      )}

      {/* 상품 목록 */}
      <Grid container spacing={2}>
        {loading && page === 1 ? (
          Array.from(new Array(12)).map((_, index) => (
            <ProductSkeleton key={index} />
          ))
        ) : (
          products.map(product => (
            <Grid item xs={6} sm={4} md={3} key={product.id}>
              <Card sx={{ 
                height: '100%', 
                boxShadow: 'none', 
                borderRadius: 0,
                '&:hover': {
                  '.MuiCardMedia-root': {
                    transform: 'scale(1.05)',
                  },
                },
              }}>
                <Box 
                  sx={{ overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'}
                    alt={product.title}
                    sx={{ 
                      transition: 'transform 0.3s ease-in-out',
                      objectFit: 'cover',
                    }}
                    onError={e => { e.target.src = '/placeholder-image.jpg'; }}
                  />
                  {(!product.images || product.images.length === 0) && (
                    <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', top: 12, left: 0, width: '100%', textAlign: 'center', zIndex: 2 }}>
                      상품 준비중...
                    </Typography>
                  )}
                </Box>
                <CardContent sx={{ px: 0 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {product.category?.name || '카테고리 없음'}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    {product.title}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {product.price.toLocaleString()}원
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 0 }}>
                  <Button
                    startIcon={<ShoppingCartIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.id);
                    }}
                    sx={{ flex: 1 }}
                  >
                    장바구니
                  </Button>
                  <IconButton>
                    <FavoriteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* 더보기 버튼 */}
      {!loading && hasMore && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => setPage(prev => prev + 1)}
            sx={{
              width: '100%',
              maxWidth: 200,
              borderColor: '#ddd',
              color: '#666',
              '&:hover': {
                borderColor: '#000',
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            더보기 ({total - products.length}개 더보기)
          </Button>
        </Box>
      )}

      {/* 필터 드로어 */}
      <Drawer
        anchor="left"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: { width: 280 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            필터
          </Typography>
          {Object.entries(filterOptions).map(([type, options]) => (
            <Box key={type} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                {type === 'category' ? '카테고리' :
                 type === 'priceRange' ? '가격대' :
                 type === 'brand' ? '브랜드' : type}
              </Typography>
              <List dense>
                {options.map(option => (
                  <ListItem
                    key={option.id}
                    dense
                    sx={{ py: 0 }}
                  >
                    <Checkbox
                      edge="start"
                      checked={filters[type].includes(option.id)}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...filters[type], option.id]
                          : filters[type].filter(id => id !== option.id);
                        handleFilterChange(type, newValues);
                      }}
                    />
                    <ListItemText primary={option.name} />
                  </ListItem>
                ))}
              </List>
              <Divider />
            </Box>
          ))}
        </Box>
      </Drawer>

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </Container>
  );
} 
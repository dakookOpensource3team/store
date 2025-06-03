import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';
import ApiService from '../services/api';
import { localizeCategories } from '../services/api';

export default function Header({ toggleSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // 검색 기능을 사용할 수 있는 페이지들
  const searchAllowedPaths = ['/', '/products', '/products/'];
  const isSearchAllowed = searchAllowedPaths.some(path => 
    location.pathname === '/' || location.pathname.startsWith(path)
  );

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    ApiService.getCategories().then(data => setCategories(localizeCategories(data)));
  }, []);

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    setUser(userInfo ? JSON.parse(userInfo) : null);
    const onStorage = () => {
      const userInfo = localStorage.getItem('user');
      setUser(userInfo ? JSON.parse(userInfo) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (user && user.memberId) {
        try {
          const data = await ApiService.getCart(user.memberId);
          console.log('Header 장바구니 데이터:', data);
          const count = Array.isArray(data) ? data.length : 0;
          setCartCount(count);
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };
    fetchCartCount();
  }, [user]);

  return (
    <>
      <AppBar position="fixed" sx={{ 
        backgroundColor: '#fff',
        color: '#000',
        boxShadow: 'none',
        borderBottom: '1px solid #f5f5f5'
      }}>
        <Container maxWidth="xl">
          {/* 상단 툴바 */}
          <Toolbar sx={{ minHeight: '60px !important', justifyContent: 'space-between' }}>
            <Typography
              variant="h6"
              component="div"
              onClick={() => navigate('/')}
              sx={{
                fontWeight: 700,
                cursor: 'pointer',
                color: '#0078ff',
                fontSize: '24px'
              }}
            >
              STORE
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isSearchAllowed && (
                <IconButton
                  size="large"
                  color="inherit"
                  onClick={toggleSearch}
                >
                  <SearchIcon />
                </IconButton>
              )}

              <IconButton
                size="large"
                color="inherit"
                onClick={() => navigate('/cart')}
              >
                <Badge badgeContent={cartCount} color="primary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              <IconButton
                size="large"
                color="inherit"
                onClick={handleMenu}
              >
                <PersonIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {user && user.isLoggedIn ? (
                  <>
                    <MenuItem onClick={() => { handleClose(); navigate('/orders'); }}>📋 주문내역</MenuItem>
                    <MenuItem onClick={() => { handleClose(); navigate('/coupon'); }}>🎫 내 쿠폰</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { ApiService.logout(); window.location.reload(); }}>로그아웃</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem onClick={() => { handleClose(); navigate('/login'); }}>로그인</MenuItem>
                    <MenuItem onClick={() => { handleClose(); navigate('/register'); }}>회원가입</MenuItem>
                  </>
                )}
              </Menu>
            </Box>
          </Toolbar>

          {/* 카테고리 네비게이션 */}
          <Box sx={{ 
            display: 'flex', 
            borderTop: '1px solid #f5f5f5',
            backgroundColor: '#fff',
          }}>
            {categories.map((category) => (
              <Box
                key={category.id}
                sx={{ position: 'relative', '&:hover > .MuiBox-root': { display: 'block' } }}
              >
                <Button
                  sx={{ color: '#000', py: 2, minWidth: 120, '&:hover': { backgroundColor: 'transparent', color: '#0078ff' } }}
                  onClick={() => {
                    console.log('Header 카테고리 클릭:', category.id, category.koreanName || category.name);
                    navigate(`/products?categoryId=${category.id}`);
                  }}
                >
                  {category.koreanName || category.name}
                </Button>
                {/* 필요시 서브카테고리 등 추가 */}
              </Box>
            ))}
          </Box>
        </Container>
      </AppBar>

      {/* 헤더 높이만큼 여백 */}
      <Toolbar sx={{ minHeight: '110px !important' }} />
    </>
  );
} 
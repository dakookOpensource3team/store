import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Order from './pages/Order';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import Coupon from './pages/Coupon';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import AdminSettings from './components/AdminSettings';
import './App.css';
import './variables.css';
import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ApiService from './services/api';
import { Snackbar, Alert, IconButton, Tooltip, Badge, Drawer, Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import cronManager from './services/cron';

function AppContent() {
  const location = useLocation();
  const [shopName, setShopName] = useState('쇼핑몰');
  const [primaryColor, setPrimaryColor] = useState('#a259e6');
  const [secondaryColor, setSecondaryColor] = useState('#2193b0');
  const [searchVisible, setSearchVisible] = useState(false);
  const [dataRefreshSnackbar, setDataRefreshSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [systemStatus, setSystemStatus] = useState(null);
  const [systemMonitorOpen, setSystemMonitorOpen] = useState(false);
  const [hasApiErrors, setHasApiErrors] = useState(false);

  // 검색창을 표시할 페이지 경로들
  const searchAllowedPaths = ['/products', '/products/'];
  const isSearchAllowed = searchAllowedPaths.some(path => 
    location.pathname.startsWith(path)
  );

  // 관리자 설정 로드 및 CSS 변수 변경 감지
  useEffect(() => {
    // 초기 설정 로드
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.shopName) {
          setShopName(parsedSettings.shopName);
          document.title = `${parsedSettings.shopName} - 온라인 쇼핑몰`;
        }
        if (parsedSettings.colors) {
          if (parsedSettings.colors.primary) {
            setPrimaryColor(parsedSettings.colors.primary);
          }
          if (parsedSettings.colors.secondary) {
            setSecondaryColor(parsedSettings.colors.secondary);
          }
        }
      }
    };

    // 초기 로드 실행
    loadSettings();

    // CSS 변수 변경 감지를 위한 MutationObserver 설정
    const observer = new MutationObserver((mutations) => {
      const root = document.documentElement;
      const primaryVar = getComputedStyle(root).getPropertyValue('--primary-color').trim();
      const secondaryVar = getComputedStyle(root).getPropertyValue('--secondary-color').trim();
      
      if (primaryVar && primaryVar !== primaryColor) {
        setPrimaryColor(primaryVar);
      }
      if (secondaryVar && secondaryVar !== secondaryColor) {
        setSecondaryColor(secondaryVar);
      }
    });

    // 스토리지 이벤트 리스너 추가
    const handleStorageChange = (e) => {
      if (e.key === 'adminSettings') {
        loadSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 주기적으로 CSS 변수 확인 (MutationObserver가 style 속성 변경을 감지하지 못할 수 있음)
    const interval = setInterval(() => {
      const root = document.documentElement;
      const primaryVar = getComputedStyle(root).getPropertyValue('--primary-color').trim();
      const secondaryVar = getComputedStyle(root).getPropertyValue('--secondary-color').trim();
      
      if (primaryVar && primaryVar !== primaryColor) {
        setPrimaryColor(primaryVar);
      }
      if (secondaryVar && secondaryVar !== secondaryColor) {
        setSecondaryColor(secondaryVar);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [primaryColor, secondaryColor]);

  // 일일 데이터 갱신 확인
  useEffect(() => {
    const checkDataRefresh = async () => {
      // 마지막 데이터 갱신 시간 확인
      const lastRefresh = localStorage.getItem('last_data_refresh');
      const now = new Date().getTime();
      
      // 24시간(하루) 이상 지났거나 갱신 기록이 없는 경우 데이터 갱신
      // 또는 URL에 forceRefresh 파라미터가 있는 경우 강제 갱신
      const urlParams = new URLSearchParams(window.location.search);
      const forceRefresh = urlParams.get('forceRefresh') === 'true';
      
      if (forceRefresh || !lastRefresh || (now - parseInt(lastRefresh, 10) > 24 * 60 * 60 * 1000)) {
        try {
          setDataRefreshSnackbar({
            open: true,
            message: '데이터를 최신 정보로 갱신 중입니다...',
            severity: 'info'
          });
          
          // API 데이터 갱신
          await ApiService.getProducts({ page: 0, size: 8, forceRefresh: true });
          await ApiService.getCategories({ forceRefresh: true });
          
          // 마지막 갱신 시간 저장
          localStorage.setItem('last_data_refresh', now.toString());
          
          setDataRefreshSnackbar({
            open: true,
            message: '데이터가 성공적으로 갱신되었습니다.',
            severity: 'success'
          });
        } catch (error) {
          console.error('데이터 갱신 오류:', error);
          setDataRefreshSnackbar({
            open: true,
            message: '데이터 갱신 중 오류가 발생했습니다.',
            severity: 'error'
          });
        }
      }
    };
    
    // 페이지 로드 시 데이터 갱신 확인
    checkDataRefresh();
  }, []);

  // 시스템 상태 모니터링 (PiggyMetrics 패턴 적용)
  useEffect(() => {
    // 시스템 상태 주기적 업데이트
    const updateSystemStatus = () => {
      try {
        const status = ApiService.getSystemStatus();
        setSystemStatus(status);
        
        // 서킷 브레이커 상태 확인
        setHasApiErrors(status.circuitBreaker.status !== 'CLOSED');
      } catch (error) {
        console.error('시스템 상태 업데이트 오류:', error);
      }
    };
    
    // 초기 시스템 상태 로드
    updateSystemStatus();
    
    // 30초마다 갱신
    const interval = setInterval(() => {
      updateSystemStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 크론 작업 시작
    cronManager.start();

    // 컴포넌트 언마운트 시 크론 작업 중지
    return () => {
      cronManager.stop();
    };
  }, []);

  // 경로가 변경될 때 검색창 자동 닫기
  useEffect(() => {
    setSearchVisible(false);
  }, [location.pathname]);

  // 검색 컴포넌트 토글 함수
  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  // 시스템 모니터 토글
  const toggleSystemMonitor = () => {
    setSystemMonitorOpen(!systemMonitorOpen);
  };

  // 시스템 상태 강제 새로고침
  const refreshSystemStatus = async () => {
    try {
      setDataRefreshSnackbar({
        open: true,
        message: '시스템 상태를 새로고침 중입니다...',
        severity: 'info'
      });
      
      const status = ApiService.getSystemStatus();
      setSystemStatus(status);
      
      setDataRefreshSnackbar({
        open: true,
        message: '시스템 상태가 새로고침되었습니다.',
        severity: 'success'
      });
    } catch (error) {
      console.error('시스템 상태 새로고침 오류:', error);
      setDataRefreshSnackbar({
        open: true,
        message: '시스템 상태 새로고침 오류',
        severity: 'error'
      });
    }
  };

  // 동적으로 테마 설정
  const theme = createTheme({
    palette: {
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: secondaryColor,
      },
    },
  });

  // 알림 닫기
  const handleCloseSnackbar = () => {
    setDataRefreshSnackbar({ ...dataRefreshSnackbar, open: false });
  };

  // 이스터에그: 관리자 계정이 있는 경우만 시스템 모니터 표시
  const isAdmin = () => {
    try {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        return user.role === 'admin';
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ paddingTop: '64px' }}>
        <Header toggleSearch={toggleSearch} />
        {isSearchAllowed && (
          <SearchBar isVisible={searchVisible} onToggleVisibility={setSearchVisible} />
        )}
        <main style={{ 
          marginTop: (searchVisible && isSearchAllowed) ? '64px' : '0', 
          transition: 'margin-top 0.3s ease'
        }}>
          <AdminSettings />
          
          {/* PiggyMetrics 스타일 시스템 모니터링 버튼 (관리자만) */}
          {isAdmin() && (
            <Tooltip title="시스템 상태 모니터링">
              <IconButton
                onClick={toggleSystemMonitor}
                sx={{
                  position: 'fixed',
                  right: 20,
                  bottom: 80, // AdminSettings 버튼 위에 배치
                  bgcolor: hasApiErrors ? 'error.main' : 'info.main',
                  color: 'white',
                  zIndex: 1000,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: hasApiErrors ? 'error.dark' : 'info.dark',
                  }
                }}
              >
                <Badge 
                  color="warning" 
                  variant="dot" 
                  invisible={!hasApiErrors}
                >
                  <StorageIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* 시스템 모니터링 드로어 */}
          <Drawer
            anchor="right"
            open={systemMonitorOpen}
            onClose={toggleSystemMonitor}
          >
            <Box sx={{ width: 350, p: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                시스템 상태 모니터링
                <IconButton onClick={refreshSystemStatus} size="small" color="primary">
                  <RefreshIcon />
                </IconButton>
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              {systemStatus ? (
                <>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    서킷 브레이커 상태
                    {systemStatus.circuitBreaker.status !== 'CLOSED' && (
                      <WarningIcon fontSize="small" color="error" sx={{ ml: 1 }} />
                    )}
                  </Typography>
                  <Box sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                    <Typography variant="body2">
                      상태: {systemStatus.circuitBreaker.status === 'CLOSED' ? '정상 (CLOSED)' : 
                            systemStatus.circuitBreaker.status === 'OPEN' ? '차단됨 (OPEN)' : '테스트 중 (HALF-OPEN)'}
                    </Typography>
                    <Typography variant="body2">
                      실패 횟수: {systemStatus.circuitBreaker.failures}
                    </Typography>
                    {systemStatus.circuitBreaker.nextAttempt && (
                      <Typography variant="body2">
                        다음 시도: {new Date(systemStatus.circuitBreaker.nextAttempt).toLocaleTimeString()}
                      </Typography>
                    )}
                  </Box>
                  
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    캐시 상태
                  </Typography>
                  <Box sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                    <Typography variant="body2">
                      캐시된 항목: {systemStatus.cache.itemCount}개
                    </Typography>
                    <Typography variant="body2">
                      전체 크기: {Math.round(systemStatus.cache.totalSize / 1024)} KB
                    </Typography>
                  </Box>
                  
                  {systemStatus.cache.items.length > 0 && (
                    <>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        캐시 항목 상세
                      </Typography>
                      <List dense sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                        {systemStatus.cache.items.map((item, index) => (
                          <ListItem key={index} divider>
                            <ListItemText
                              primary={item.key}
                              secondary={`만료: ${item.expiresIn}분 후 (${Math.round(item.size / 1024)} KB)`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                  
                  <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
                    마지막 업데이트: {systemStatus.lastUpdated.toLocaleString()}
                  </Typography>
                </>
              ) : (
                <Typography>시스템 상태 로딩 중...</Typography>
              )}
            </Box>
          </Drawer>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<Order />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/coupon" element={<Coupon />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-register" element={<AdminRegister />} />
          </Routes>
        </main>
        
        {/* 데이터 갱신 알림 */}
        <Snackbar
          open={dataRefreshSnackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={dataRefreshSnackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {dataRefreshSnackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

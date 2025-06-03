import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Typography, 
  Divider, 
  Grid,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  FormHelperText
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import StoreIcon from '@mui/icons-material/Store';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import ApiService from '../services/api';
import { ChromePicker } from 'react-color';

const defaultColors = {
  primary: '#a259e6',
  secondary: '#2193b0'
};

const defaultShopName = '쇼핑몰';

const AdminSettings = () => {
  const [open, setOpen] = useState(false);
  const [colors, setColors] = useState(defaultColors);
  const [shopName, setShopName] = useState(defaultShopName);
  const [currentColor, setCurrentColor] = useState('primary');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewMode, setPreviewMode] = useState(false);
  const [tempColors, setTempColors] = useState(defaultColors);
  const [tempShopName, setTempShopName] = useState(defaultShopName);
  const [categoryMapping, setCategoryMapping] = useState({});
  const [tempCategoryMapping, setTempCategoryMapping] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 설정 불러오기
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setColors(parsedSettings.colors || defaultColors);
      setShopName(parsedSettings.shopName || defaultShopName);
      setTempColors(parsedSettings.colors || defaultColors);
      setTempShopName(parsedSettings.shopName || defaultShopName);
    }

    // 로컬 스토리지에서 유저 정보 불러와서 관리자 여부 확인
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setIsAdmin(user.role === 'admin');
    }

    // 카테고리 매핑 설정 로드
    const savedMapping = localStorage.getItem('categoryMapping');
    if (savedMapping) {
      const parsedMapping = JSON.parse(savedMapping);
      setCategoryMapping(parsedMapping);
      setTempCategoryMapping(parsedMapping);
    }
  }, []);

  // 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      if (open && tabValue === 2) {
        try {
          setLoadingCategories(true);
          const data = await ApiService.getCategories(true); // 최신 데이터 로드
          setCategories(data);
        } catch (error) {
          console.error('카테고리 로드 오류:', error);
          setSnackbar({
            open: true,
            message: '카테고리 정보를 불러오는 중 오류가 발생했습니다.',
            severity: 'error'
          });
        } finally {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();
  }, [open, tabValue]);

  // 설정 변경시 적용
  useEffect(() => {
    if (colors && shopName) {
      document.documentElement.style.setProperty('--primary-color', colors.primary);
      document.documentElement.style.setProperty('--secondary-color', colors.secondary);
      
      // 설정 저장
      const settingsData = { colors, shopName };
      localStorage.setItem('adminSettings', JSON.stringify(settingsData));
      
      // 페이지 타이틀 변경
      document.title = `${shopName} - 온라인 쇼핑몰`;
      
      // 이벤트 발생시켜 다른 컴포넌트에 알리기
      window.dispatchEvent(new Event('storage'));
    }
  }, [colors, shopName]);

  // 프리뷰 모드
  useEffect(() => {
    if (previewMode) {
      document.documentElement.style.setProperty('--primary-color', tempColors.primary);
      document.documentElement.style.setProperty('--secondary-color', tempColors.secondary);
      
      // 프리뷰 모드에서 임시 타이틀 설정
      document.title = `${tempShopName} - 온라인 쇼핑몰 (미리보기)`;
    } else {
      document.documentElement.style.setProperty('--primary-color', colors.primary);
      document.documentElement.style.setProperty('--secondary-color', colors.secondary);
      
      // 원래 타이틀로 복원
      document.title = `${shopName} - 온라인 쇼핑몰`;
    }
  }, [previewMode, tempColors, colors, tempShopName, shopName]);

  const handleOpen = () => {
    setOpen(true);
    setTempColors({...colors});
    setTempShopName(shopName);
    setTempCategoryMapping({...categoryMapping});
  };

  const handleClose = () => {
    setOpen(false);
    setShowColorPicker(false);
    setPreviewMode(false);
    // 저장하지 않은 변경사항이 있을 경우 원래 상태로 복구
    document.documentElement.style.setProperty('--primary-color', colors.primary);
    document.documentElement.style.setProperty('--secondary-color', colors.secondary);
    document.title = `${shopName} - 온라인 쇼핑몰`;
  };

  const handleSave = () => {
    // 저장하고 닫기
    setColors({...tempColors});
    setShopName(tempShopName);
    setCategoryMapping({...tempCategoryMapping});
    
    const settingsData = { 
      colors: tempColors, 
      shopName: tempShopName 
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settingsData));
    localStorage.setItem('categoryMapping', JSON.stringify(tempCategoryMapping));
    
    // storage 이벤트 발생시켜 다른 컴포넌트에 알리기
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'adminSettings',
      newValue: JSON.stringify(settingsData)
    }));
    
    // 카테고리가 변경되었다면 API 캐시 갱신
    ApiService.refreshCache();
    
    setSnackbar({
      open: true,
      message: '설정이 성공적으로 저장되었습니다.',
      severity: 'success'
    });
    
    setPreviewMode(false);
    handleClose();
  };

  const handleReset = () => {
    setTempColors({...defaultColors});
    setTempShopName(defaultShopName);
    setPreviewMode(true);
  };

  const handleColorChange = (color) => {
    setTempColors({
      ...tempColors,
      [currentColor]: color.hex
    });
    setPreviewMode(true);
  };

  const handleColorPickerClick = (colorKey) => {
    setCurrentColor(colorKey);
    setShowColorPicker(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  const handleCategoryNameChange = (categoryName, newKoreanName) => {
    setTempCategoryMapping({
      ...tempCategoryMapping,
      [categoryName]: newKoreanName
    });
  };

  // 관리자가 아니면 환경설정 엑세스 정보 표시
  if (!isAdmin) {
    return (
      <Box 
        sx={{ 
          position: 'fixed', 
          right: 20, 
          bottom: 20, 
          zIndex: 1000 
        }}
      >
        <Tooltip title="관리자로 로그인하세요">
          <IconButton
            onClick={() => window.location.href = '/login'}
            sx={{
              bgcolor: 'rgba(0,0,0,0.08)',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.15)',
              },
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <>
      <Tooltip title="쇼핑몰 환경설정">
        <IconButton
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            bgcolor: 'primary.main',
            color: 'white',
            zIndex: 1000,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(162, 89, 230, 0.7)'
              },
              '70%': {
                boxShadow: '0 0 0 10px rgba(162, 89, 230, 0)'
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(162, 89, 230, 0)'
              }
            }
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ px: 3, pb: 0 }}>
          <Typography variant="h5" fontWeight={700}>
            쇼핑몰 환경설정
          </Typography>
          <Divider sx={{ mt: 2 }} />
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            sx={{ mb: 0 }}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<StoreIcon />} label="쇼핑몰 기본 설정" />
            <Tab icon={<ColorLensIcon />} label="디자인 설정" />
            <Tab icon={<CategoryIcon />} label="카테고리 설정" />
          </Tabs>
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, py: 3 }}>
          {tabValue === 0 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                현재 관리자 모드입니다. 쇼핑몰의 기본 정보를 설정할 수 있습니다.
              </Alert>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  쇼핑몰 이름
                </Typography>
                <TextField
                  fullWidth
                  value={tempShopName}
                  onChange={(e) => {
                    setTempShopName(e.target.value);
                    setPreviewMode(true);
                  }}
                  placeholder="쇼핑몰 이름을 입력하세요"
                  variant="outlined"
                  size="medium"
                  helperText="쇼핑몰 이름은 브라우저 제목과 상단 헤더에 표시됩니다."
                />
              </Paper>
              
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  쇼핑몰 미리보기
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid #eee', 
                  borderRadius: 2, 
                  bgcolor: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2 
                }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    bgcolor: previewMode ? tempColors.primary : colors.primary, 
                    color: 'white', 
                    borderRadius: 2 
                  }}>
                    <StoreIcon />
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    {previewMode ? tempShopName : shopName}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                쇼핑몰의 테마 색상을 자유롭게 설정할 수 있습니다. 변경 사항은 미리보기로 확인하세요.
              </Alert>
              
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: 2, mb: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                      메인 색상
                    </Typography>
                    <Box
                      onClick={() => handleColorPickerClick('primary')}
                      sx={{
                        width: '100%',
                        height: 80,
                        bgcolor: tempColors.primary,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                        }
                      }}
                    >
                      <ColorLensIcon sx={{ color: 'white', opacity: 0.8, fontSize: 32 }} />
                    </Box>
                    <Typography variant="caption" display="block" mt={1} color="text.secondary">
                      헤더 및 주요 버튼에 사용됩니다.
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                      보조 색상
                    </Typography>
                    <Box
                      onClick={() => handleColorPickerClick('secondary')}
                      sx={{
                        width: '100%',
                        height: 80,
                        bgcolor: tempColors.secondary,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                        }
                      }}
                    >
                      <ColorLensIcon sx={{ color: 'white', opacity: 0.8, fontSize: 32 }} />
                    </Box>
                    <Typography variant="caption" display="block" mt={1} color="text.secondary">
                      강조 요소 및 보조 버튼에 사용됩니다.
                    </Typography>
                  </Grid>
                </Grid>
                
                {showColorPicker && (
                  <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={600} mb={2}>
                      {currentColor === 'primary' ? '메인 색상' : '보조 색상'} 선택
                    </Typography>
                    <ChromePicker
                      color={tempColors[currentColor]}
                      onChange={handleColorChange}
                      disableAlpha
                      styles={{
                        default: {
                          picker: {
                            width: '100%',
                            boxShadow: 'none',
                            borderRadius: '8px',
                            border: '1px solid #eee'
                          }
                        }
                      }}
                    />
                  </Box>
                )}
              </Paper>
              
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  색상 미리보기
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    sx={{ bgcolor: previewMode ? tempColors.primary : colors.primary }}
                  >
                    메인 버튼
                  </Button>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      color: previewMode ? tempColors.primary : colors.primary,
                      borderColor: previewMode ? tempColors.primary : colors.primary
                    }}
                  >
                    테두리 버튼
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ bgcolor: previewMode ? tempColors.secondary : colors.secondary }}
                  >
                    보조 버튼
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                카테고리의 한글 이름을 설정할 수 있습니다. API에서 제공하는 원래 이름과 사용자에게 표시할 한글 이름을 매핑합니다.
                <br />
                API에서 새로운 카테고리가 제공되면 자동으로 목록에 추가됩니다.
              </Alert>
              
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  카테고리 한글 이름 설정
                </Typography>
                
                {loadingCategories ? (
                  <Typography>카테고리 로딩 중...</Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell width="10%">ID</TableCell>
                          <TableCell width="45%">원래 이름</TableCell>
                          <TableCell width="45%">한글 이름</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categories.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} align="center">
                              <Typography color="text.secondary">카테고리가 없거나 로드되지 않았습니다.</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          categories.map((category) => (
                            <TableRow key={category.id}>
                              <TableCell>{category.id}</TableCell>
                              <TableCell>{category.name}</TableCell>
                              <TableCell>
                                <FormControl fullWidth>
                                  <TextField
                                    value={tempCategoryMapping[category.name] || category.name}
                                    onChange={(e) => handleCategoryNameChange(category.name, e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    placeholder="한글 이름 입력"
                                  />
                                  <FormHelperText>
                                    이 이름은 사용자에게 표시됩니다
                                  </FormHelperText>
                                </FormControl>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
              
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  카테고리 데이터 관리
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  카테고리 데이터에 문제가 있거나 API에서 변경된 경우 아래 버튼을 통해 데이터를 새로고침하세요.
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={async () => {
                    try {
                      setLoadingCategories(true);
                      // 강제 캐시 갱신
                      await ApiService.refreshCache();
                      // 카테고리 다시 로드
                      const data = await ApiService.getCategories(true);
                      setCategories(data);
                      setSnackbar({
                        open: true,
                        message: '카테고리 데이터가 새로고침되었습니다.',
                        severity: 'success'
                      });
                    } catch (error) {
                      console.error('카테고리 새로고침 오류:', error);
                      setSnackbar({
                        open: true,
                        message: '카테고리 새로고침 실패',
                        severity: 'error'
                      });
                    } finally {
                      setLoadingCategories(false);
                    }
                  }}
                >
                  카테고리 데이터 새로고침
                </Button>
                <Button 
                  variant="outlined"
                  color="error"
                  sx={{ ml: 2 }}
                  onClick={async () => {
                    if (window.confirm('카테고리 매핑을 기본값으로 초기화하시겠습니까? 모든 사용자 정의 카테고리 이름이 재설정됩니다.')) {
                      try {
                        setLoadingCategories(true);
                        // 매핑 초기화와 함께 강제 캐시 갱신
                        await ApiService.refreshCache(true);
                        // 카테고리 다시 로드
                        const data = await ApiService.getCategories(true);
                        // 초기화된 매핑 로드
                        const mapping = JSON.parse(localStorage.getItem('categoryMapping')) || {};
                        setCategories(data);
                        setTempCategoryMapping(mapping);
                        setCategoryMapping(mapping);
                        setSnackbar({
                          open: true,
                          message: '카테고리 매핑이 초기화되었습니다.',
                          severity: 'success'
                        });
                      } catch (error) {
                        console.error('카테고리 매핑 초기화 오류:', error);
                        setSnackbar({
                          open: true,
                          message: '카테고리 매핑 초기화 실패',
                          severity: 'error'
                        });
                      } finally {
                        setLoadingCategories(false);
                      }
                    }
                  }}
                >
                  카테고리 매핑 초기화
                </Button>
              </Paper>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handlePreview} 
            color="primary" 
            variant={previewMode ? 'contained' : 'outlined'}
            startIcon={previewMode ? <RestoreIcon /> : <ColorLensIcon />}
          >
            {previewMode ? '미리보기 해제' : '미리보기'}
          </Button>
          <Button 
            onClick={handleReset} 
            color="error" 
            variant="outlined" 
            startIcon={<RestoreIcon />}
          >
            기본값으로 초기화
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button onClick={handleClose} startIcon={<CloseIcon />}>취소</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
          >
            저장하기
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminSettings; 
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Typography, 
  Divider,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ApiService, { localizeCategories } from '../services/api';

// 카테고리 아이콘 색상 정의
const categoryColors = [
  '#a259e6',
  '#f7971e',
  '#2193b0',
  '#f7971e',
  '#a259e6',
  '#2193b0'
];

const CategoryMenu = ({ onSelectCategory }) => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 새로운 API 서비스를 사용하여 카테고리 로드
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getCategories();
        // 한글화된 카테고리 적용
        const localizedCategories = localizeCategories(data);
        setCategories(localizedCategories);
      } catch (error) {
        console.error('카테고리 로드 에러:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleCategoryClick = (categoryId) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
    setOpen(false);
  };

  const drawerWidth = 240;

  return (
    <>
      <Tooltip title="카테고리 메뉴">
        <IconButton
          onClick={toggleDrawer(true)}
          sx={{
            position: 'fixed',
            right: 20,
            top: 100,
            zIndex: 1100,
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': { bgcolor: '#f5f5f5' },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700} color="primary">
            카테고리
          </Typography>
          <IconButton onClick={toggleDrawer(false)}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ p: 2 }}>
            <Typography>카테고리 로딩 중...</Typography>
          </Box>
        ) : (
          <List>
            {categories.length === 0 ? (
              <ListItem>
                <ListItemText primary="카테고리 정보가 없습니다" />
              </ListItem>
            ) : (
              categories.map((category) => (
                <ListItem 
                  button 
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: `${category.color}15` // 투명도 15%의 색상으로 배경
                    }
                  }}
                >
                  <ListItemIcon>
                    <Box 
                      sx={{ 
                        bgcolor: category.color, 
                        color: 'white', 
                        width: 32, 
                        height: 32, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: '50%'
                      }}
                    >
                      <StorefrontIcon fontSize="small" />
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary={category.koreanName || `카테고리 ${category.id}`} />
                </ListItem>
              ))
            )}
          </List>
        )}

        <Divider />
        
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            원하는 카테고리를 선택하여 상품을 확인해보세요.
          </Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default CategoryMenu; 
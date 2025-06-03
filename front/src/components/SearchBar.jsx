import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
  Divider,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';

// 디바운스 함수
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function SearchBar({ onClose }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    // 최근 검색어 로드
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent);
  }, []);

  // 디바운스된 검색 함수
  const debouncedSearch = React.useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const results = await ApiService.searchProducts(term);
        setSearchResults(results);
      } catch (error) {
        console.error('검색 에러:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    
    // 최근 검색어 저장
    if (term.trim()) {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const newRecent = [term, ...recent.filter(t => t !== term)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
      setRecentSearches(newRecent);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    if (onClose) onClose();
  };

  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
      <TextField
        fullWidth
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="상품명을 입력하세요"
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                searchTerm && (
                  <IconButton onClick={handleClear} size="small">
                    <ClearIcon />
                  </IconButton>
                )
              )}
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <Paper elevation={0} sx={{ maxHeight: 400, overflow: 'auto' }}>
        {/* 최근 검색어 */}
        {!searchTerm && recentSearches.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              px: 2,
              py: 1
            }}>
              <Typography variant="subtitle2" color="text.secondary">
                최근 검색어
              </Typography>
              <Typography
                variant="caption"
                color="primary"
                sx={{ cursor: 'pointer' }}
                onClick={clearRecentSearches}
              >
                전체 삭제
              </Typography>
            </Box>
            <List dense>
              {recentSearches.map((term, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleRecentSearchClick(term)}
                >
                  <ListItemText primary={term} />
                </ListItem>
              ))}
            </List>
            <Divider />
          </Box>
        )}

        {/* 검색 결과 */}
        {searchResults.length > 0 ? (
          <List>
            {searchResults.map((product) => (
              <ListItem
                key={product.id}
                button
                onClick={() => handleProductClick(product.id)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={product.image}
                    alt={product.title}
                    variant="rounded"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={product.title}
                  secondary={
                    <Typography
                      component="span"
                      variant="body2"
                      color="primary"
                    >
                      {product.price.toLocaleString()}원
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : searchTerm && !loading && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              검색 결과가 없습니다.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
} 
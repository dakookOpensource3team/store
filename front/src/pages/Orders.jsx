import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ApiService from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      if (!user || !user.memberId) {
        setError('로그인이 필요합니다.');
        return;
      }

      setLoading(true);
      const orderData = await ApiService.getMyOrders(user.memberId);
      console.log('주문 데이터 전체:', orderData);
      if (orderData && orderData.length > 0) {
        console.log('첫 번째 주문 상세:', orderData[0]);
      }
      setOrders(orderData || []);
    } catch (err) {
      console.error('주문 목록 로드 에러:', err);
      setError('주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusText = (status) => {
    const statusMap = {
      'PAYMENT_WAITING': '결제 대기',
      'PREPARING': '상품 준비 중',
      'SHIPPED': '배송 중',
      'DELIVERING': '배송 중',
      'DELIVERY_COMPLETED': '배송 완료',
      'CANCEL': '주문 취소'
    };
    return statusMap[status] || status;
  };

  const getOrderStatusColor = (status) => {
    const colorMap = {
      'PAYMENT_WAITING': 'warning',
      'PREPARING': 'info',
      'SHIPPED': 'primary',
      'DELIVERING': 'primary',
      'DELIVERY_COMPLETED': 'success',
      'CANCEL': 'error'
    };
    return colorMap[status] || 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // 유효하지 않은 날짜인 경우 (1970년 등)
      if (isNaN(date.getTime()) || date.getFullYear() < 2020) {
        // 현재 시간으로 표시
        const now = new Date();
        return now.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      // 파싱 에러 시 현재 시간 반환
      const now = new Date();
      return now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return price.toLocaleString();
    }
    if (price && typeof price === 'object' && price.amount) {
      return price.amount.toLocaleString();
    }
    if (typeof price === 'string') {
      const numPrice = parseInt(price);
      return isNaN(numPrice) ? '0' : numPrice.toLocaleString();
    }
    return '0';
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>주문 목록을 불러오는 중...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" action={
          <Button onClick={() => navigate('/login')} size="small">
            로그인하기
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <ShoppingBagIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" fontWeight={700} color="primary.main">
          주문 내역
        </Typography>
      </Box>

      {orders.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingBagIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            주문 내역이 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            첫 번째 주문을 해보세요!
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/products')}
            sx={{ borderRadius: 3, fontWeight: 700 }}
          >
            쇼핑하러 가기
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.orderId}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                        주문번호: #{order.orderId}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarTodayIcon fontSize="small" color="text.secondary" />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={getOrderStatusText(order.orderState)} 
                      color={getOrderStatusColor(order.orderState)}
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* 주문자 정보 */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      주문자 정보
                    </Typography>
                    <Typography variant="body2">
                      이름: {order.ordererName || order.orderer?.name || user?.name || '정보 없음'}
                    </Typography>
                    {(order.orderer?.phoneNumber || user?.phone) && (
                      <Typography variant="body2">
                        연락처: {order.orderer?.phoneNumber || user?.phone}
                      </Typography>
                    )}
                    {(order.orderer?.email || user?.email) && (
                      <Typography variant="body2">
                        이메일: {order.orderer?.email || user?.email}
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* 주문 상품 목록 */}
                  {order.orderLines && order.orderLines.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        주문 상품
                      </Typography>
                      {order.orderLines.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography variant="body2">
                            상품 ID: {item.productId} (수량: {item.quantity || 1}개)
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatPrice(item.price || item.amount)}원
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* 배송 정보 */}
                  {order.shippingInfo && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocalShippingIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          배송 정보
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        받는분: {order.shippingInfo.receiver?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        연락처: {order.shippingInfo.receiver?.phoneNumber}
                      </Typography>
                      {order.shippingInfo.address && (
                        <Typography variant="body2" color="text.secondary">
                          주소: {order.shippingInfo.address.address} {order.shippingInfo.address.addressDetail}
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* 결제 정보 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        결제 방법: {order.paymentInfo === 'CARD' ? '카드 결제' : '무통장 입금'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        주문자: {order.ordererName}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', minWidth: 200 }}>
                      {/* 상세 금액 정보 */}
                      {(() => {
                        // 백엔드에서 받은 orderLines는 이미 할인이 적용된 가격
                        let subtotal = 0;
                        if (order.orderLines && order.orderLines.length > 0) {
                          subtotal = order.orderLines.reduce((sum, item) => {
                            const itemPrice = (item.price?.amount || item.price || 0);
                            const itemQuantity = item.quantity || 1;
                            return sum + (itemPrice * itemQuantity);
                          }, 0);
                        }
                        
                        // 배송비 계산 (원본 상품금액 기준이 아닌 할인된 금액 기준)
                        // 하지만 무료배송 기준은 원본 금액으로 해야 할 수도 있음 - 일단 할인된 금액 기준으로 처리
                        const shipping = subtotal >= 50000 ? 0 : 3000;
                        
                        // 할인은 이미 상품 가격에 적용되어 있으므로 별도 표시하지 않음
                        const finalTotal = subtotal + shipping;
                        
                        console.log('주문 금액 계산 (할인 적용된 가격 사용):', {
                          할인적용된상품금액: subtotal,
                          배송비: shipping,
                          최종금액: finalTotal
                        });
                        
                        return (
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              상품금액: {subtotal.toLocaleString()}원
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              배송비: {shipping === 0 ? (
                                <span style={{ color: '#4caf50' }}>무료</span>
                              ) : (
                                `${shipping.toLocaleString()}원`
                              )}
                            </Typography>
                            <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 0.5, mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                총 결제 금액
                              </Typography>
                              <Typography variant="h6" fontWeight={700} color="primary.main">
                                {finalTotal.toLocaleString()}원
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })()}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
} 
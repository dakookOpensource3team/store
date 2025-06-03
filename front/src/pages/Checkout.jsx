import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Done as DoneIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import PaymentMethodSelector from '../components/PaymentMethodSelector';

const steps = ['배송 정보', '쿠폰 & 결제', '주문 완료'];

// 날짜 포맷팅 함수 추가
const formatValidUntil = (dateString) => {
  if (!dateString) {
    // 날짜가 없으면 기본적으로 3개월 후로 설정 (백엔드 로직과 동일)
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    return futureDate.toLocaleDateString('ko-KR');
  }
  
  try {
    // Instant 형태의 문자열을 Date로 변환
    let date;
    if (typeof dateString === 'string') {
      // ISO 문자열이거나 Instant 타임스탬프인 경우
      date = new Date(dateString);
    } else if (typeof dateString === 'number') {
      // 밀리초 타임스탬프인 경우
      date = new Date(dateString);
    } else {
      throw new Error('Invalid date format');
    }
    
    // 유효하지 않은 날짜인 경우 (1970년 등)
    if (isNaN(date.getTime()) || date.getFullYear() < 2020) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      return futureDate.toLocaleDateString('ko-KR');
    }
    
    return date.toLocaleDateString('ko-KR');
  } catch (error) {
    // 파싱 에러 시 기본값 반환 (3개월 후)
    console.log('날짜 파싱 에러:', error, 'dateString:', dateString);
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    return futureDate.toLocaleDateString('ko-KR');
  }
};

function mapCartItem(raw) {
  console.log('Checkout.jsx mapCartItem 원본 데이터:', raw);
  const mapped = {
    cartId: raw.id || raw.cartId,
    title: raw.productName || raw.title || 'Unknown Product',
    price: raw.price?.amount || raw.price || 0,
    image: raw.imageUrl || raw.image || (raw.images && raw.images.length > 0 ? raw.images[0] : '/placeholder-image.jpg'),
    quantity: raw.quantity || 1,
    productId: raw.productId || raw.id,
    id: raw.id,
  };
  console.log('Checkout.jsx mapCartItem 매핑된 데이터:', mapped);
  return mapped;
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 3000,
    discount: 0,
    total: 0,
  });
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    addressDetail: '',
    zipcode: '',
    message: '',
  });
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const memberId = user?.memberId;
  
  // 바로구매인지 장바구니 결제인지 구분
  const isDirectCheckout = location.state?.isDirectCheckout === true;
  const pageTitle = isDirectCheckout ? '바로구매' : '장바구니 결제';

  useEffect(() => {
    loadOrderItems();
    loadCoupons();
    loadUserInfo();
  }, []);

  // orderItems가 변경될 때마다 주문 요약 재계산
  useEffect(() => {
    if (orderItems.length > 0) {
      console.log('주문 상품 변경으로 인한 주문 요약 재계산 시작');
      calculateOrderSummary(orderItems, selectedCoupon);
    }
  }, [orderItems, selectedCoupon]);

  const loadOrderItems = async () => {
    try {
      setLoading(true);
      let items = [];
      
      console.log('Checkout.jsx location.state:', location.state);
      
      if (isDirectCheckout && location.state?.items) {
        // 바로 구매
        console.log('Checkout.jsx: 바로구매 모드');
        const itemPromises = location.state.items.map(async (item) => {
          console.log('Checkout.jsx: 상품 정보 요청:', item.productId);
          const product = await ApiService.getProductById(item.productId);
          console.log('Checkout.jsx: 받은 상품 정보:', product);
          return mapCartItem({ 
            ...product, 
            quantity: item.quantity,
            id: product.id,
            productId: item.productId 
          });
        });
        items = await Promise.all(itemPromises);
      } else if (!isDirectCheckout && location.state?.cartItems) {
        // 장바구니 구매 - 전달받은 cartItems 사용
        console.log('Checkout.jsx: 장바구니 모드 (전달받은 데이터 사용)');
        items = location.state.cartItems.map(mapCartItem);
      } else {
        // 기본 장바구니 구매 (이전 버전 호환성)
        console.log('Checkout.jsx: 장바구니 모드 (API 호출)');
        const cart = await ApiService.getCart(memberId);
        items = (cart || []).map(mapCartItem);
      }

      console.log('Checkout.jsx: 로드된 주문 상품들:', items);
      setOrderItems(items);
      
    } catch (error) {
      setError('주문 정보를 불러오는데 실패했습니다.');
      console.error('주문 정보 로드 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserInfo = async () => {
    try {
      if (user && user.username) {
        // 백엔드에서 현재 사용자 정보 가져오기
        const memberData = await ApiService.getCurrentMember();
        console.log('현재 회원 정보:', memberData);
        
        if (memberData) {
          setShippingInfo({
            name: memberData.name || user.name || '',
            phone: memberData.phone || user.phone || '',
            address: memberData.address?.address || user.address || '',
            addressDetail: memberData.address?.detailedAddress || user.addressDetail || '',
            zipcode: String(memberData.address?.zipCode || user.zipcode || ''),
            message: '',
          });
        } else {
          // 백엔드에서 정보를 가져오지 못한 경우 로컬 저장소 정보 사용
          setShippingInfo({
            name: user.name || '',
            phone: user.phone || '',
            address: user.address || '',
            addressDetail: user.addressDetail || '',
            zipcode: String(user.zipcode || ''),
            message: '',
          });
        }
      }
    } catch (error) {
      console.error('회원정보 로드 에러:', error);
      // 에러 발생 시 로컬 저장소 정보 사용
      if (user) {
        setShippingInfo({
          name: user.name || '',
          phone: user.phone || '',
          address: user.address || '',
          addressDetail: user.addressDetail || '',
          zipcode: String(user.zipcode || ''),
          message: '',
        });
      }
    }
  };

  const handleAddressToggle = () => {
    setUseDefaultAddress(!useDefaultAddress);
    if (!useDefaultAddress) {
      // 기본 배송지로 되돌리기
      loadUserInfo();
    } else {
      // 새 배송지로 초기화
      setShippingInfo({
        name: '',
        phone: '',
        address: '',
        addressDetail: '',
        zipcode: '',
        message: '',
      });
    }
  };

  const loadCoupons = async () => {
    try {
      if (user && user.memberId) {
        const data = await ApiService.getCoupons(user.memberId);
        setCoupons(data || []);
      }
    } catch (error) {
      console.error('쿠폰 로드 에러:', error);
      setCoupons([]);
    }
  };

  const calculateOrderSummary = (items, coupon = selectedCoupon) => {
    console.log('=== 주문 요약 계산 시작 ===');
    console.log('상품 목록:', items);
    console.log('선택된 쿠폰:', coupon);
    
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      console.log(`상품 ${item.title}: ${item.price}원 x ${item.quantity}개 = ${itemTotal}원`);
      return sum + itemTotal;
    }, 0);
    
    const shipping = subtotal >= 50000 ? 0 : 3000;
    const discount = coupon ? calculateDiscount(subtotal, coupon) : 0;
    
    const finalTotal = subtotal + shipping - discount;
    
    console.log('주문 요약 계산 결과:', {
      상품금액: subtotal,
      배송비: shipping,
      할인금액: discount,
      최종금액: finalTotal
    });
    
    setOrderSummary({
      subtotal,
      shipping,
      discount,
      total: finalTotal,
    });
    
    console.log('=== 주문 요약 계산 완료 ===');
  };

  const calculateDiscount = (subtotal, coupon) => {
    if (!coupon) return 0;

    console.log('쿠폰 할인 계산:', {
      subtotal,
      coupon: {
        name: coupon.name,
        isRatio: coupon.isRatio,
        ratio: coupon.ratio,
        fixedAmount: coupon.fixedAmount
      }
    });

    // 백엔드 쿠폰 구조에 맞게 수정
    if (coupon.isRatio) {
      // 비율 할인 - ratio는 이미 소수점 형태 (0.1 = 10%)
      const discountAmount = Math.floor(subtotal * coupon.ratio);
      console.log('비율 할인 계산:', `${subtotal} * ${coupon.ratio} = ${discountAmount}`);
      return discountAmount;
    } else {
      // 고정 금액 할인
      const fixedAmount = coupon.fixedAmount?.amount || coupon.fixedAmount || 0;
      console.log('고정 할인 계산:', fixedAmount);
      return Math.min(fixedAmount, subtotal); // 상품 금액보다 큰 할인은 적용하지 않음
    }
  };

  const handleCouponSelect = (coupon) => {
    console.log('쿠폰 선택됨:', coupon);
    setSelectedCoupon(coupon);
    
    // 쿠폰 선택 즉시 주문 요약 재계산
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50000 ? 0 : 3000;
    const discount = calculateDiscount(subtotal, coupon);
    
    console.log('쿠폰 적용 후 계산:', {
      상품금액: subtotal,
      배송비: shipping,
      할인금액: discount,
      최종금액: subtotal + shipping - discount
    });
    
    setOrderSummary({
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount,
    });
    
    setCouponDialogOpen(false);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // 배송 정보 검증
      const missingFields = [];
      if (!shippingInfo.name.trim()) missingFields.push('이름');
      if (!shippingInfo.phone.trim()) missingFields.push('전화번호');
      if (!shippingInfo.address.trim()) missingFields.push('주소');
      if (!shippingInfo.zipcode.trim()) missingFields.push('우편번호');
      
      if (missingFields.length > 0) {
        setError(`다음 항목을 입력해주세요: ${missingFields.join(', ')}`);
        return;
      }
      
      // 전화번호 형식 검증 (선택적)
      const phoneRegex = /^[\d\-\s]+$/;
      if (!phoneRegex.test(shippingInfo.phone)) {
        setError('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)');
        return;
      }
      
      setError(null);
      setActiveStep(1);
    } else if (activeStep === 1) {
      // 1단계에서는 PaymentMethodSelector가 직접 다음 단계로 이동
      return;
    } else if (activeStep === 2) {
      handlePlaceOrder();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      // 할인 적용된 상품별 가격 계산
      const discountedOrderLines = orderItems.map(item => {
        let itemPrice = item.price || 0;
        
        // 쿠폰이 선택된 경우 할인 적용
        if (selectedCoupon) {
          if (selectedCoupon.isRatio) {
            // 비율 할인 적용
            itemPrice = Math.floor(itemPrice * (1 - selectedCoupon.ratio));
          } else {
            // 고정 금액 할인의 경우 전체 주문에서 비례 배분
            const subtotal = orderItems.reduce((sum, orderItem) => sum + (orderItem.price * orderItem.quantity), 0);
            const fixedAmount = selectedCoupon.fixedAmount?.amount || selectedCoupon.fixedAmount || 0;
            const discountRatio = Math.min(fixedAmount / subtotal, 1); // 최대 100% 할인
            itemPrice = Math.floor(itemPrice * (1 - discountRatio));
          }
        }
        
        return {
          productId: item.productId || item.id,
          price: itemPrice, // 할인 적용된 단가
          quantity: item.quantity || 1
        };
      });

      console.log('할인 적용된 주문 라인:', discountedOrderLines);
      console.log('원본 주문 요약:', orderSummary);

      // 백엔드 PlaceOrderRequest 구조에 맞게 데이터 구성
      const orderPayload = {
        orderLines: discountedOrderLines,
        shippingInfo: {
          address: {
            address: shippingInfo.address || '기본 주소',
            detailedAddress: shippingInfo.addressDetail || '',
            zipCode: parseInt(shippingInfo.zipcode) || 0
          },
          receiver: {
            name: shippingInfo.name || user.name || '주문자',
            phoneNumber: shippingInfo.phone || user.phone || '010-0000-0000'
          }
        },
        message: shippingInfo.message || '',
        orderer: {
          memberId: user.memberId,
          name: user.name || '주문자', // 회원 이름 사용
          phoneNumber: user.phone || shippingInfo.phone || '010-0000-0000',
          email: user.email || 'user@example.com'
        },
        paymentInfo: paymentMethod?.method === 'CASH' ? 'CASH' : 'CARD', // enum 값
        // 쿠폰 정보는 보내지 않음 - 이미 가격에 할인이 적용됨
        coupons: []
      };

      console.log("주문 요청 데이터 (할인 적용됨):", orderPayload);
      console.log("주문 요약 정보:", {
        상품금액: orderSummary.subtotal,
        배송비: orderSummary.shipping,
        할인: orderSummary.discount,
        총결제금액: orderSummary.total
      });
      const response = await ApiService.createOrder(orderPayload);
      console.log("주문 응답:", response);

      // 주문 결과 저장
      setOrderResult(response);

      // 사용된 쿠폰 삭제
      if (selectedCoupon && selectedCoupon.id) {
        try {
          await ApiService.deleteCoupon(selectedCoupon.id);
          console.log("쿠폰 삭제 완료:", selectedCoupon.name);
        } catch (couponError) {
          console.error("쿠폰 삭제 실패:", couponError);
          // 쿠폰 삭제 실패는 주문 완료에 영향주지 않음
        }
      }

      // 장바구니를 통해 주문한 경우, 장바구니 비우기
      if (!isDirectCheckout && user?.memberId) {
        await ApiService.clearCart(user.memberId);
        console.log("장바구니 비우기 완료");
      }

      setActiveStep(steps.length - 1); // UI를 "주문 완료" 단계로 이동

    } catch (err) {
      console.error('주문 처리 에러:', err);
      const errorMessage = err.message || '주문 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (paymentData) => {
    setPaymentMethod(paymentData);
    setActiveStep(2); // 마지막 단계로 이동
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ mr: 2, fontWeight: 600 }}>
                배송 정보
              </Typography>
              <Button
                variant={useDefaultAddress ? "contained" : "outlined"}
                size="small"
                onClick={handleAddressToggle}
                sx={{ mr: 1 }}
              >
                기본 배송지
              </Button>
              <Button
                variant={!useDefaultAddress ? "contained" : "outlined"}
                size="small"
                onClick={handleAddressToggle}
              >
                새 배송지
              </Button>
            </Box>
            
            {useDefaultAddress && user && (
              <Alert severity="info" sx={{ mb: 3 }}>
                회원 정보의 기본 배송지가 적용됩니다. 다른 주소로 배송받으려면 '새 배송지'를 선택하세요.
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="이름"
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                  disabled={useDefaultAddress}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="전화번호"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  placeholder="010-1234-5678"
                  helperText="배송 시 연락받을 전화번호를 입력하세요"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="주소"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  disabled={useDefaultAddress}
                  placeholder="예: 서울특별시 강남구 테헤란로 123"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="상세주소"
                  value={shippingInfo.addressDetail}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, addressDetail: e.target.value })}
                  placeholder="예: 101동 502호, 지하 1층 등"
                  helperText="아파트 동호수, 건물명, 층수 등을 입력하세요"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="우편번호"
                  value={shippingInfo.zipcode}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, zipcode: e.target.value })}
                  disabled={useDefaultAddress}
                  placeholder="예: 12345"
                  type="number"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    배송 메시지
                  </Typography>
                  <Select
                    value={shippingInfo.message}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, message: e.target.value })}
                    fullWidth
                    displayEmpty
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="">직접 입력</MenuItem>
                    <MenuItem value="부재 시 문 앞에 놓아주세요">부재 시 문 앞에 놓아주세요</MenuItem>
                    <MenuItem value="부재 시 경비실에 맡겨주세요">부재 시 경비실에 맡겨주세요</MenuItem>
                    <MenuItem value="배송 전 연락주세요">배송 전 연락주세요</MenuItem>
                    <MenuItem value="부재 시 휴대폰으로 연락주세요">부재 시 휴대폰으로 연락주세요</MenuItem>
                    <MenuItem value="부재 시 택배함에 넣어주세요">부재 시 택배함에 넣어주세요</MenuItem>
                    <MenuItem value="빠른 배송 부탁드립니다">빠른 배송 부탁드립니다</MenuItem>
                    <MenuItem value="조심히 다뤄주세요">조심히 다뤄주세요</MenuItem>
                    <MenuItem value="아침 배송 금지">아침 배송 금지</MenuItem>
                    <MenuItem value="저녁 배송 금지">저녁 배송 금지</MenuItem>
                  </Select>
                </Box>
                <TextField
                  fullWidth
                  label="배송 메시지 (직접 입력)"
                  multiline
                  rows={2}
                  value={shippingInfo.message}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, message: e.target.value })}
                  placeholder="배송 시 요청사항을 입력해주세요"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              쿠폰 사용
            </Typography>
            {selectedCoupon ? (
              <Alert 
                severity="success"
                action={
                  <IconButton size="small" onClick={() => { 
                    console.log('쿠폰 해제됨');
                    setSelectedCoupon(null); 
                    
                    // 쿠폰 해제 시 주문 요약 재계산
                    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    const shipping = subtotal >= 50000 ? 0 : 3000;
                    
                    setOrderSummary({
                      subtotal,
                      shipping,
                      discount: 0,
                      total: subtotal + shipping,
                    });
                  }}>
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2 }}
              >
                적용된 쿠폰: {selectedCoupon.name} ({selectedCoupon.description})
              </Alert>
            ) : (
              <Button 
                variant="outlined" 
                onClick={() => setCouponDialogOpen(true)} 
                sx={{ mb: 2, color: 'primary.main', borderColor: 'primary.main' }}
              >
                사용 가능한 쿠폰 보기 ({coupons.length}개)
              </Button>
            )}

            <Divider sx={{ my: 3 }} />
            <PaymentMethodSelector onSelect={handlePaymentMethodSelect} />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <DoneIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom fontWeight={700} color="success.main">
              주문이 완료되었습니다!
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              주문번호: #{orderResult?.orderId || 'ORD' + Date.now()}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              주문 확인 및 배송 정보는 등록하신 연락처로 안내해드립니다.
            </Typography>
            
            {paymentMethod?.method === 'CASH' && (
              <Alert severity="warning" sx={{ mb: 3, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  📋 무통장 입금 안내
                </Typography>
                <Typography variant="body2">
                  🏦 입금 계좌: 농협은행 123-456-789012<br/>
                  👤 예금주: (주)STORE<br/>
                  ⏰ 입금 기한: 24시간 이내<br/>
                  💰 입금 금액: {orderSummary.total.toLocaleString()}원
                </Typography>
              </Alert>
            )}
            
            {paymentMethod?.method === 'CARD' && (
              <Alert severity="success" sx={{ mb: 3, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  💳 카드 결제 완료
                </Typography>
                <Typography variant="body2">
                  은행: {paymentMethod.bank}<br/>
                  결제 금액: {orderSummary.total.toLocaleString()}원<br/>
                  결제가 정상적으로 처리되었습니다.
                </Typography>
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/')}
                sx={{ minWidth: 140 }}
              >
                🏠 홈으로
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/orders')}
                sx={{ minWidth: 140 }}
              >
                📋 주문내역
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/products')}
                sx={{ minWidth: 140 }}
              >
                🛍️ 계속 쇼핑
              </Button>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          {activeStep === steps.length - 1 ? '주문을 처리하고 있습니다...' : '정보를 불러오는 중...'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          잠시만 기다려주세요
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              새로고침
            </Button>
          }
        >
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button variant="contained" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 700, color: 'primary.main' }}>
        {pageTitle}
      </Typography>
      
      {/* 주문 상품 미리보기 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          주문 상품
        </Typography>
        <Grid container spacing={2}>
          {orderItems.map((item, index) => (
            <Grid item xs={12} key={item.cartId || item.id || index}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Box
                  component="img"
                  src={item.image || '/placeholder-image.jpg'}
                  alt={item.title || 'Product Image'}
                  sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1, mr: 2 }}
                  onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {item.title || 'Unknown Product'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.price?.toLocaleString() || '0'}원 × {item.quantity || 1}개
                  </Typography>
                </Box>
                <Typography variant="h6" color="primary" fontWeight={700}>
                  {((item.price || 0) * (item.quantity || 1))?.toLocaleString()}원
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        
        {/* 주문 요약 */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography>상품 금액</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography>{orderSummary.subtotal.toLocaleString()}원</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>배송비</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography>
                {orderSummary.shipping === 0 ? (
                  <span style={{ color: '#4caf50' }}>무료</span>
                ) : (
                  `${orderSummary.shipping.toLocaleString()}원`
                )}
              </Typography>
            </Grid>
            {orderSummary.shipping === 0 && orderSummary.subtotal >= 50000 && (
              <>
                <Grid item xs={12}>
                  <Typography variant="caption" color="success.main" sx={{ textAlign: 'center', display: 'block' }}>
                    🎉 50,000원 이상 구매로 무료배송!
                  </Typography>
                </Grid>
              </>
            )}
            {orderSummary.shipping > 0 && orderSummary.subtotal < 50000 && (
              <>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
                    💡 {(50000 - orderSummary.subtotal).toLocaleString()}원 더 구매하시면 무료배송!
                  </Typography>
                </Grid>
              </>
            )}
            {orderSummary.discount > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography color="error">할인</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography color="error">-{orderSummary.discount.toLocaleString()}원</Typography>
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" fontWeight={700}>총 결제 금액</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="h6" fontWeight={700} color="primary">
                {orderSummary.total.toLocaleString()}원
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep !== 0 && activeStep !== 2 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              이전
            </Button>
          )}
          {activeStep === 0 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              다음
            </Button>
          )}
          {activeStep === 2 && (
            <Button
              variant="contained"
              onClick={handlePlaceOrder}
              disabled={loading || !paymentMethod}
              sx={{ minWidth: 150 }}
            >
              {loading ? '결제 처리중...' : '주문 확정'}
            </Button>
          )}
        </Box>
      </Paper>

      {/* 쿠폰 선택 다이얼로그 */}
      <Dialog
        open={couponDialogOpen}
        onClose={() => setCouponDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          사용 가능한 쿠폰 ({coupons.length}개)
        </DialogTitle>
        <DialogContent dividers>
          {coupons.length > 0 ? (
            <List>
              {coupons.map((coupon) => (
                <ListItem 
                  button 
                  key={coupon.id} 
                  onClick={() => handleCouponSelect(coupon)}
                  selected={selectedCoupon?.id === coupon.id}
                  sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 1 }}
                >
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {coupon.name}
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight={700}>
                          {coupon.isRatio 
                            ? `${Math.round(coupon.ratio * 100)}%` 
                            : `${coupon.fixedAmount?.toLocaleString()}원`
                          }
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {coupon.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          만료일: {formatValidUntil(coupon.expiredAt || coupon.validUntil)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                사용 가능한 쿠폰이 없습니다.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCouponDialogOpen(false)}>
            닫기
          </Button>
          {selectedCoupon && (
            <Button 
              onClick={() => { 
                console.log('쿠폰 해제됨');
                setSelectedCoupon(null); 
                
                // 쿠폰 해제 시 주문 요약 재계산
                const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const shipping = subtotal >= 50000 ? 0 : 3000;
                
                setOrderSummary({
                  subtotal,
                  shipping,
                  discount: 0,
                  total: subtotal + shipping,
                });
                
                setCouponDialogOpen(false); 
              }}
              color="error"
            >
              쿠폰 해제
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
} 
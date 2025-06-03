import { configureStore, createSlice } from '@reduxjs/toolkit';

const loadCart = () => {
  try {
    const data = localStorage.getItem('cart');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem('cart', JSON.stringify(items));
  } catch {}
};

const initialState = {
  items: loadCart(), // {id, title, price, image, quantity}
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const exist = state.items.find((i) => i.id === item.id);
      if (exist) {
        exist.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveCart(state.items);
    },
    changeQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item && quantity > 0) item.quantity = quantity;
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCart(state.items);
    },
  },
});

export const { addToCart, removeFromCart, changeQuantity, clearCart } = cartSlice.actions;

const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
  },
});

export default store; 
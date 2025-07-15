import React, { createContext, useReducer, useContext, useEffect } from "react";

const CartContext = createContext();

const initialState = {
  cart: JSON.parse(localStorage.getItem('cart')) || [],
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      let newCart;
      const normalizedItem = {
        ...action.payload,
        price: action.payload.priceCents / 100,
        imageUrl: action.payload.image,
        deliveryOptionId: action.payload.deliveryOptionId || '1',
      };
      if (existingItem) {
        newCart = state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...state.cart, { ...normalizedItem, quantity: 1 }];
      }
      return { ...state, cart: newCart };
    }
    case 'REMOVE_ITEM': {
      const newCart = state.cart.filter(item => item.id !== action.payload.id);
      return { ...state, cart: newCart };
    }
    case 'INCREMENT_ITEM': {
      const newCart = state.cart.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      return { ...state, cart: newCart };
    }
    case 'DECREMENT_ITEM': {
      const newCart = state.cart.map(item =>
        item.id === action.payload.id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      return { ...state, cart: newCart };
    }
    case 'CLEAR_CART': {
      return { ...state, cart: [] };
    }
    case 'UPDATE_DELIVERY_OPTION': {
      const newCart = state.cart.map(item =>
        item.id === action.payload.productId
          ? { ...item, deliveryOptionId: action.payload.deliveryOptionId }
          : item
      );
      return { ...state, cart: newCart };
    }
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.cart));
  }, [state.cart]);

  return (
    <CartContext.Provider value={{ cart: state.cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
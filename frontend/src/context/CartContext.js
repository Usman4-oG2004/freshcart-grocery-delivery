import React, { createContext, useReducer, useContext, useCallback } from 'react';
import Toast from 'react-native-toast-message';

export const CartContext = createContext();

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i._id === action.item._id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i._id === action.item._id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.item, quantity: 1 }] };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i._id !== action.id) };

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i._id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i._id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = useCallback((item) => {
    dispatch({ type: 'ADD_ITEM', item });
    Toast.show({
      type: 'success',
      text1: 'Added to cart!',
      text2: item.name,
      visibilityTime: 1500,
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', id });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // Computed values
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => {
    const price = i.discountPrice || i.price;
    return sum + price * i.quantity;
  }, 0);
  const deliveryFee = subtotal >= 35 ? 0 : 2.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        subtotal,
        deliveryFee,
        tax,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

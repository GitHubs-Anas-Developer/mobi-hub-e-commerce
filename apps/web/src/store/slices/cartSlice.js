import { createSlice } from "@reduxjs/toolkit";

import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../thunks/cartThunks";

const initialState = {
  cart: null,
  items: [],
  isLoading: false,
  isMutating: false,
  error: null,
  successMessage: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },

    clearCartMessage: (state) => {
      state.successMessage = null;
    },

    resetCart: (state) => {
      state.cart = null;
      state.items = [];
      state.isLoading = false;
      state.isMutating = false;
      state.error = null;
      state.successMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // FETCH CART
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ADD TO CART
      .addCase(addToCart.pending, (state) => {
        state.isMutating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.isMutating = false;
        state.successMessage = "Product added to cart successfully";
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload;
      })

      // UPDATE CART ITEM
      .addCase(updateCartItem.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.isMutating = false;
        state.successMessage = "Cart updated successfully";
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload;
      })

      // REMOVE CART ITEM
      .addCase(removeCartItem.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.isMutating = false;
        state.successMessage = "Cart item removed successfully";
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload;
      })

      // CLEAR CART
      .addCase(clearCart.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.isMutating = false;
        state.successMessage = "Cart cleared successfully";
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartError, clearCartMessage, resetCart } =
  cartSlice.actions;

export default cartSlice.reducer;

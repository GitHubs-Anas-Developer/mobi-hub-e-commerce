import { createSlice } from "@reduxjs/toolkit";

import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../thunks/wishlistThunks";

const initialState = {
  wishlist: null,
  products: [],
  isLoading: false,
  isMutating: false,
  error: null,
  successMessage: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,

  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },

    clearWishlistMessage: (state) => {
      state.successMessage = null;
    },

    resetWishlist: (state) => {
      state.wishlist = null;
      state.products = [];
      state.isLoading = false;
      state.isMutating = false;
      state.error = null;
      state.successMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // FETCH WISHLIST
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
        state.products = action.payload?.products || [];
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ADD TO WISHLIST
      .addCase(addToWishlist.pending, (state) => {
        state.isMutating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
        state.products = action.payload?.products || [];
        state.isMutating = false;
        state.successMessage = "Product added to wishlist successfully";
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload;
      })

      // REMOVE FROM WISHLIST
      .addCase(removeFromWishlist.pending, (state) => {
        state.isMutating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
        state.products = action.payload?.products || [];
        state.isMutating = false;
        state.successMessage = "Product removed from wishlist successfully";
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload;
      })

      // CLEAR WISHLIST
      .addCase(clearWishlist.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
        state.products = action.payload?.products || [];
        state.isMutating = false;
        state.successMessage = "Wishlist cleared successfully";
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload;
      });
  },
});

export const { clearWishlistError, clearWishlistMessage, resetWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;

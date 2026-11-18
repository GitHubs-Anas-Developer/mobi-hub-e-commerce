import { createSlice } from "@reduxjs/toolkit";
import { fetchRelatedProducts } from "../thunks/relatedProducts";

const initialState = {
  products: [],
  loading: false,
  error: null,
  currentProductId: null,
};

const relatedProductsSlice = createSlice({
  name: "relatedProducts",
  initialState,
  reducers: {
    clearRelatedProducts: (state) => {
      state.products = [];
      state.loading = false;
      state.error = null;
      state.currentProductId = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchRelatedProducts.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.products = [];
        state.currentProductId = action.meta.arg.productId;
      })

      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.currentProductId = action.payload.productId;
      })

      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to load related products";
      });
  },
});

export const { clearRelatedProducts } = relatedProductsSlice.actions;

export default relatedProductsSlice.reducer;

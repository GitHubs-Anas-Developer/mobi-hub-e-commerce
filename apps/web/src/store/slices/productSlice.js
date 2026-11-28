import { createSlice } from "@reduxjs/toolkit";
import { createProduct, deleteProduct, fetchProductById, fetchProductBySlug, fetchProducts, updateProduct } from "@/store/thunks/productThunks";

const initialState = { items: [], pagination: null, selected: null, loading: false, mutating: false, error: null };

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: { clearProductError(state) { state.error = null; } },
  extraReducers(builder) {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => { const response = action.payload; state.items = Array.isArray(response?.data) ? response.data : []; state.pagination = response?.pagination || null; state.loading = false; })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.selected = action.payload?.data || null; })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => { state.selected = action.payload?.data || null; })
      .addCase(createProduct.fulfilled, (state, action) => { const product = action.payload?.data; if (product?._id) state.items.unshift(product); state.selected = product || null; })
      .addCase(updateProduct.fulfilled, (state, action) => { const product = action.payload?.data; if (product?._id) { state.items = state.items.map((item) => item._id === product._id ? product : item); state.selected = product; } })
      .addCase(deleteProduct.fulfilled, (state, action) => { state.items = state.items.filter((item) => item._id !== action.payload); if (state.selected?._id === action.payload) state.selected = null; })
      .addMatcher((action) => [createProduct.pending, updateProduct.pending, deleteProduct.pending].some((thunk) => thunk.match(action)), (state) => { state.mutating = true; state.error = null; })
      .addMatcher((action) => [createProduct.fulfilled, updateProduct.fulfilled, deleteProduct.fulfilled].some((thunk) => thunk.match(action)), (state) => { state.mutating = false; })
      .addMatcher((action) => [createProduct.rejected, updateProduct.rejected, deleteProduct.rejected].some((thunk) => thunk.match(action)), (state, action) => { state.mutating = false; state.error = action.payload; });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;

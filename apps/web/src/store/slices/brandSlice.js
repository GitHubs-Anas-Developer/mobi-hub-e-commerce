import { createSlice } from "@reduxjs/toolkit";
import { fetchBrands } from "../thunks/brandThunks";

const initialState = {
  brands: [],
  loading: false,
  error: null,
  fetched: false,
};

const brandSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {
    clearBrandError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload?.data;
        state.fetched = true;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBrandError } = brandSlice.actions;

export default brandSlice.reducer;

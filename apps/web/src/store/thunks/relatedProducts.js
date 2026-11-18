import { createAsyncThunk } from "@reduxjs/toolkit";
import relatedProductsService from "@/services/relatedProducts.service";

export const fetchRelatedProducts = createAsyncThunk(
  "relatedProducts/fetchRelatedProducts",
  async ({ productId, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await relatedProductsService.getRelatedProducts(
        productId,
        limit,
      );

      return {
        productId,
        products: response.data || [],
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load related products",
      );
    }
  },
);

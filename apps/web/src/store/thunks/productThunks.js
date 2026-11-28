import { createAsyncThunk } from "@reduxjs/toolkit";
import productService from "@/services/productService";
import adminProductService from "@/services/adminProductService";

const getMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

export const fetchProducts = createAsyncThunk("products/fetchProducts", async (params = {}, { rejectWithValue }) => {
  try { return await productService.getProducts(params); }
  catch (error) { return rejectWithValue(getMessage(error, "Failed to fetch products")); }
});

export const fetchProductById = createAsyncThunk("products/fetchProductById", async (productId, { rejectWithValue }) => {
  try { return await productService.getProductById(productId); }
  catch (error) { return rejectWithValue(getMessage(error, "Failed to fetch product")); }
});

export const fetchProductBySlug = createAsyncThunk("products/fetchProductBySlug", async (slug, { rejectWithValue }) => {
  try { return await productService.getProductBySlug(slug); }
  catch (error) { return rejectWithValue(getMessage(error, "Failed to fetch product")); }
});

export const createProduct = createAsyncThunk("products/createProduct", async (data, { rejectWithValue }) => {
  try { return await adminProductService.createProduct(data); }
  catch (error) { return rejectWithValue(getMessage(error, "Failed to create product")); }
});

export const updateProduct = createAsyncThunk("products/updateProduct", async ({ productId, data }, { rejectWithValue }) => {
  try { return await adminProductService.updateProduct(productId, data); }
  catch (error) { return rejectWithValue(getMessage(error, "Failed to update product")); }
});

export const deleteProduct = createAsyncThunk("products/deleteProduct", async (productId, { rejectWithValue }) => {
  try { await adminProductService.deleteProduct(productId); return productId; }
  catch (error) { return rejectWithValue(getMessage(error, "Failed to delete product")); }
});

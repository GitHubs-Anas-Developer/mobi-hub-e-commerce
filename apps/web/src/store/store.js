import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import notificationReducer from "./slices/notificationSlice";
import categoryReducer from "./slices/categorySlice";
import brandReducer from "./slices/brandSlice";
import relatedProductsReducer from "./slices/relatedProductsSlice";
import searchReducer from "./slices/searchSlice";
import bannerReducer from "./slices/bannerSlice";
import productVideoReducer from "./slices/productVideoSlice";
import newsletterReducer from "./slices/newsletterSlice";
import trackingReducer from "./slices/trackingSlice";
import ordersReducer from "./slices/orderSlice";
import adminReducer from "./slices/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    notifications: notificationReducer,
    categories: categoryReducer,
    brands: brandReducer,
    relatedProducts: relatedProductsReducer,
    search: searchReducer,
    banners: bannerReducer,
    productVideos: productVideoReducer,
    newsletter: newsletterReducer,
    tracking: trackingReducer,
    orders: ordersReducer,
    admin: adminReducer,
  },
});

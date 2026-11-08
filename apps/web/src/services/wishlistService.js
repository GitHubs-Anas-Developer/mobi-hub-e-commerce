import axiosInstance from "@/lib/axios";

const wishlistService = {
  getWishlist: async () => {
    const response = await axiosInstance.get("/wishlist");
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await axiosInstance.post("/wishlist/items", {
      productId,
    });
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await axiosInstance.delete(`/wishlist/items/${productId}`);
    return response.data;
  },

  clearWishlist: async () => {
    const response = await axiosInstance.delete("/wishlist");
    return response.data;
  },
};

export default wishlistService;

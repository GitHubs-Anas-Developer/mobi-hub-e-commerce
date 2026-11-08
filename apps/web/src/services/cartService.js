import axiosInstance from "@/lib/axios";

const cartService = {
  getCart: async () => {
    const response = await axiosInstance.get("/cart");
    return response.data;
  },

  addToCart: async (itemData) => {
    const response = await axiosInstance.post("/cart/items", itemData);
    return response.data;
  },

  updateCartItem: async (itemId, quantity) => {
    const response = await axiosInstance.patch(`/cart/items/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  removeCartItem: async (itemId) => {
    const response = await axiosInstance.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await axiosInstance.delete("/cart");
    return response.data;
  },
};

export default cartService;

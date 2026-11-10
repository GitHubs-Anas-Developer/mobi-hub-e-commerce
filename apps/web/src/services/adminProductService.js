import axiosInstance from "@/lib/axios";

const adminProductService = {
  // Get all products
  getProducts: async (params = {}) => {
    const response = await axiosInstance.get("/admin/products", {
      params,
    });

    return response.data;
  },

  // Upload product images to Cloudinary
  uploadImages: async (files, type = "products") => {
    const formData = new FormData();

    formData.append("type", type);

    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await axiosInstance.post("/admin/upload/images", formData);

    return response.data;
  },

  // Create product
  createProduct: async (productData) => {
    const response = await axiosInstance.post("/products", productData);

    return response.data;
  },
};

export default adminProductService;

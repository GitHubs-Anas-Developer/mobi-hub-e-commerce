import axiosInstance from "@/lib/axios";

const addressService = {
  getAddresses: async () => {
    const response = await axiosInstance.get("/addresses");
    return response.data;
  },

  createAddress: async (addressData) => {
    const response = await axiosInstance.post("/addresses", addressData);
    return response.data;
  },

  updateAddress: async (addressId, addressData) => {
    const response = await axiosInstance.patch(
      `/addresses/${addressId}`,
      addressData,
    );
    return response.data;
  },

  setDefaultAddress: async (addressId) => {
    const response = await axiosInstance.patch(
      `/addresses/${addressId}/default`,
    );
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await axiosInstance.delete(`/addresses/${addressId}`);
    return response.data;
  },
};

export default addressService;

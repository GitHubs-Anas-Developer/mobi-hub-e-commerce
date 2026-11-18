import axiosInstance from "@/lib/axios";

const searchService = {
  getSuggestions: async (query) => {
    const response = await axiosInstance.get("/search/suggestions", {
      params: { q: query },
    });

    return response.data.data;
  },
};

export default searchService;

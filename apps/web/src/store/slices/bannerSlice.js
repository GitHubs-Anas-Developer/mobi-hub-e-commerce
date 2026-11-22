import { createSlice } from "@reduxjs/toolkit";

import {
  fetchActiveBanners,
  fetchAdminBanners,
  fetchBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../thunks/bannerThunks";

const initialState = {
  banners: [],
  bannersByPlacement: {},

  adminBanners: [],
  selectedBanner: null,

  loading: false,
  adminLoading: false,
  detailLoading: false,
  submitting: false,
  deleting: false,

  error: null,
};

const getBanners = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.banners)) return response.banners;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.banners)) {
    return response.data.banners;
  }
  return [];
};

const getBanner = (response) => {
  return (
    response?.banner || response?.data?.banner || response?.data || response
  );
};

const bannerSlice = createSlice({
  name: "banners",
  initialState,

  reducers: {
    clearBannerError: (state) => {
      state.error = null;
    },

    clearSelectedBanner: (state) => {
      state.selectedBanner = null;
    },

    resetBanners: (state) => {
      state.banners = [];
      state.bannersByPlacement = {};
      state.adminBanners = [];
      state.selectedBanner = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch active banners
      .addCase(fetchActiveBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchActiveBanners.fulfilled, (state, action) => {
        state.loading = false;

        const fetchedBanners = getBanners(action.payload);
        const params = action.meta.arg || {};

        const placement = params.placement || "all";
        const position = params.position || "all";

        const cacheKey = `${placement}_${position}`;

        state.bannersByPlacement[cacheKey] = fetchedBanners;

        // Maintain backward compatibility
        state.banners = fetchedBanners;
      })

      .addCase(fetchActiveBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch admin banners
      .addCase(fetchAdminBanners.pending, (state) => {
        state.adminLoading = true;
        state.error = null;
      })

      .addCase(fetchAdminBanners.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminBanners = getBanners(action.payload);
      })

      .addCase(fetchAdminBanners.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload;
      })

      // Fetch single banner
      .addCase(fetchBannerById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })

      .addCase(fetchBannerById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedBanner = getBanner(action.payload);
      })

      .addCase(fetchBannerById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      // Create banner
      .addCase(createBanner.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })

      .addCase(createBanner.fulfilled, (state, action) => {
        state.submitting = false;
        state.adminBanners.unshift(getBanner(action.payload));
      })

      .addCase(createBanner.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Update banner
      .addCase(updateBanner.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })

      .addCase(updateBanner.fulfilled, (state, action) => {
        state.submitting = false;

        const updatedBanner = getBanner(action.payload);

        if (!updatedBanner?._id) return;

        state.adminBanners = state.adminBanners.map((banner) =>
          banner._id === updatedBanner._id ? updatedBanner : banner,
        );

        state.banners = state.banners.map((banner) =>
          banner._id === updatedBanner._id ? updatedBanner : banner,
        );

        Object.keys(state.bannersByPlacement).forEach((key) => {
          state.bannersByPlacement[key] = state.bannersByPlacement[key].map(
            (banner) =>
              banner._id === updatedBanner._id ? updatedBanner : banner,
          );
        });

        if (state.selectedBanner?._id === updatedBanner._id) {
          state.selectedBanner = updatedBanner;
        }
      })

      .addCase(updateBanner.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Delete banner
      .addCase(deleteBanner.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })

      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.deleting = false;

        const deletedBannerId = action.meta.arg;

        state.adminBanners = state.adminBanners.filter(
          (banner) => banner._id !== deletedBannerId,
        );

        state.banners = state.banners.filter(
          (banner) => banner._id !== deletedBannerId,
        );

        Object.keys(state.bannersByPlacement).forEach((key) => {
          state.bannersByPlacement[key] = state.bannersByPlacement[key].filter(
            (banner) => banner._id !== deletedBannerId,
          );
        });

        if (state.selectedBanner?._id === deletedBannerId) {
          state.selectedBanner = null;
        }
      })

      .addCase(deleteBanner.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearBannerError, clearSelectedBanner, resetBanners } =
  bannerSlice.actions;

export default bannerSlice.reducer;

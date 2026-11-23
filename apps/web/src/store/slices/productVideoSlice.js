import { createSlice } from "@reduxjs/toolkit";

import {
  fetchActiveProductVideos,
  fetchAdminProductVideos,
  fetchProductVideoById,
  createProductVideo,
  updateProductVideo,
  deleteProductVideo,
} from "@/store/thunks/productVideoThunks";

// Extract video array from API response
const extractVideos = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.videos)) {
    return response.videos;
  }

  if (Array.isArray(response?.data?.videos)) {
    return response.data.videos;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data?.videos)) {
    return response.data.data.videos;
  }

  return [];
};

// Extract a single video from API response
const extractVideo = (response) => {
  if (response?._id) return response;

  if (response?.video?._id) {
    return response.video;
  }

  if (response?.data?._id) {
    return response.data;
  }

  if (response?.data?.video?._id) {
    return response.data.video;
  }

  if (response?.data?.data?.video?._id) {
    return response.data.data.video;
  }

  return null;
};

const initialState = {
  adminVideos: [],
  activeVideos: [],
  selectedVideo: null,

  pagination: null,

  loading: false,
  uploading: false,
  updating: false,
  deleting: false,

  error: null,
};

const productVideoSlice = createSlice({
  name: "productVideos",

  initialState,

  reducers: {
    clearProductVideoError: (state) => {
      state.error = null;
    },

    clearSelectedProductVideo: (state) => {
      state.selectedVideo = null;
    },

    resetProductVideos: (state) => {
      state.adminVideos = [];
      state.activeVideos = [];
      state.selectedVideo = null;
      state.pagination = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ==========================================
      // FETCH ACTIVE PRODUCT VIDEOS (PUBLIC)
      // ==========================================

      .addCase(fetchActiveProductVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchActiveProductVideos.fulfilled, (state, action) => {
        state.loading = false;

        state.activeVideos = extractVideos(action.payload);
      })

      .addCase(fetchActiveProductVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch active videos";
      })

      // ==========================================
      // FETCH ALL PRODUCT VIDEOS (ADMIN)
      // ==========================================

      .addCase(fetchAdminProductVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAdminProductVideos.fulfilled, (state, action) => {
        state.loading = false;

        state.adminVideos = extractVideos(action.payload);

        state.pagination =
          action.payload?.pagination ||
          action.payload?.data?.pagination ||
          null;
      })

      .addCase(fetchAdminProductVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch product videos";
      })

      // ==========================================
      // FETCH SINGLE PRODUCT VIDEO
      // ==========================================

      .addCase(fetchProductVideoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProductVideoById.fulfilled, (state, action) => {
        state.loading = false;

        state.selectedVideo = extractVideo(action.payload);
      })

      .addCase(fetchProductVideoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch product video";
      })

      // ==========================================
      // CREATE PRODUCT VIDEO
      // ==========================================

      .addCase(createProductVideo.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })

      .addCase(createProductVideo.fulfilled, (state, action) => {
        state.uploading = false;

        const newVideo = extractVideo(action.payload);

        if (newVideo) {
          state.adminVideos.unshift(newVideo);

          if (newVideo.isActive) {
            state.activeVideos.unshift(newVideo);
          }
        }
      })

      .addCase(createProductVideo.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload || "Failed to create product video";
      })

      // ==========================================
      // UPDATE PRODUCT VIDEO
      // ==========================================

      .addCase(updateProductVideo.pending, (state) => {
        state.updating = true;
        state.error = null;
      })

      .addCase(updateProductVideo.fulfilled, (state, action) => {
        state.updating = false;

        const updatedVideo = extractVideo(action.payload);

        if (!updatedVideo) return;

        state.adminVideos = state.adminVideos.map((video) =>
          video._id === updatedVideo._id ? updatedVideo : video,
        );

        state.activeVideos = state.activeVideos
          .map((video) =>
            video._id === updatedVideo._id ? updatedVideo : video,
          )
          .filter((video) => video.isActive);

        if (state.selectedVideo?._id === updatedVideo._id) {
          state.selectedVideo = updatedVideo;
        }
      })

      .addCase(updateProductVideo.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to update product video";
      })

      // ==========================================
      // DELETE PRODUCT VIDEO
      // ==========================================

      .addCase(deleteProductVideo.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })

      .addCase(deleteProductVideo.fulfilled, (state, action) => {
        state.deleting = false;

        const videoId = action.payload;

        state.adminVideos = state.adminVideos.filter(
          (video) => video._id !== videoId,
        );

        state.activeVideos = state.activeVideos.filter(
          (video) => video._id !== videoId,
        );

        if (state.selectedVideo?._id === videoId) {
          state.selectedVideo = null;
        }
      })

      .addCase(deleteProductVideo.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || "Failed to delete product video";
      });
  },
});

export const {
  clearProductVideoError,
  clearSelectedProductVideo,
  resetProductVideos,
} = productVideoSlice.actions;

export default productVideoSlice.reducer;

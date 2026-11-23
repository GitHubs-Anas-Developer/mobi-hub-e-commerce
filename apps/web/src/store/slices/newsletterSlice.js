import { createSlice } from "@reduxjs/toolkit";
import { subscribeNewsletter } from "../thunks/newsletterThunks";

const initialState = {
  loading: false,
  success: false,
  message: "",
  error: null,
  subscribedEmail: "",
};

const newsletterSlice = createSlice({
  name: "newsletter",
  initialState,
  reducers: {
    resetNewsletterState: (state) => {
      state.loading = false;
      state.success = false;
      state.message = "";
      state.error = null;
      state.subscribedEmail = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(subscribeNewsletter.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.message = "";
        state.error = null;
      })
      .addCase(subscribeNewsletter.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "Successfully subscribed!";
        state.subscribedEmail = action.payload?.data?.email || "";
      })
      .addCase(subscribeNewsletter.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Subscription failed.";
      });
  },
});

export const { resetNewsletterState } = newsletterSlice.actions;

export default newsletterSlice.reducer;

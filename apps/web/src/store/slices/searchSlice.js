import { createSlice } from "@reduxjs/toolkit";
import { fetchSearchSuggestions } from "../thunks/searchThunks";

const initialState = {
  query: "",
  suggestions: {
    products: [],
    brands: [],
    categories: [],
  },
  recentSearches: [],
  popularSearches: [],
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,

  reducers: {
    setSearchQuery: (state, action) => {
      state.query = action.payload;
    },

    clearSearch: (state) => {
      state.query = "";
      state.suggestions = {
        products: [],
        brands: [],
        categories: [],
      };
      state.error = null;
    },

    addRecentSearch: (state, action) => {
      const value = action.payload?.trim();

      if (!value) return;

      state.recentSearches = [
        value,
        ...state.recentSearches.filter(
          (item) => item.toLowerCase() !== value.toLowerCase(),
        ),
      ].slice(0, 10);
    },

    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload;
      })

      .addCase(fetchSearchSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const {
  setSearchQuery,
  clearSearch,
  addRecentSearch,
  clearRecentSearches,
} = searchSlice.actions;

export default searchSlice.reducer;

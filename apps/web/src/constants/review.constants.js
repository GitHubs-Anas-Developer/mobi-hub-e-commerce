export const REVIEW_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 5,
  MAX_TITLE_LENGTH: 100,
  MIN_TITLE_LENGTH: 3,
  MIN_COMMENT_LENGTH: 10,
  MAX_COMMENT_LENGTH: 1000,
  MIN_RATING: 1,
  MAX_RATING: 5,
};

export const INITIAL_REVIEW_FORM = {
  rating: 5,
  title: "",
  comment: "",
};

export const REVIEW_MESSAGES = {
  LOAD_ERROR: "Unable to load product reviews.",
  MY_REVIEW_ERROR: "Unable to fetch your review.",
  SUBMIT_SUCCESS: "Your review has been submitted successfully.",
  SUBMIT_ERROR: "Unable to submit your review.",
  UPDATE_SUCCESS: "Your review has been updated successfully.",
  UPDATE_ERROR: "Unable to update your review.",
  DELETE_SUCCESS: "Your review has been deleted successfully.",
  DELETE_ERROR: "Unable to delete your review.",
  VALIDATION_ERROR: "Please complete all review fields.",
  DELETE_CONFIRMATION: "Are you sure you want to delete your review?",
  LOGIN_REQUIRED: "Please log in to share your experience with this product.",
};

export const REVIEW_SORT_OPTIONS = [
  { label: "Most Recent", value: "newest" },
  { label: "Highest Rated", value: "highest" },
  { label: "Lowest Rated", value: "lowest" },
];

export const REVIEW_RATING_FILTERS = [
  { label: "All Ratings", value: "all" },
  { label: "5 Stars", value: 5 },
  { label: "4 Stars", value: 4 },
  { label: "3 Stars", value: 3 },
  { label: "2 Stars", value: 2 },
  { label: "1 Star", value: 1 },
];

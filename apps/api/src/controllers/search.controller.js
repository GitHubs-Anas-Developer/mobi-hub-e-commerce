import * as searchService from "../services/search.service.js";

export const getSearchSuggestions = async (req, res, next) => {
  try {
    const query = req.query.q || "";

    const suggestions = await searchService.getSearchSuggestions(query);

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

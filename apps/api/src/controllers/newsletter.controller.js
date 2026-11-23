import {
  subscribeToNewsletter,
  getNewsletterSubscribers,
  getNewsletterStats,
} from "../services/newsletter.service.js";

import { validateNewsletterEmail } from "../validators/newsletter.validator.js";

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    const validationError = validateNewsletterEmail(email);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const subscriber = await subscribeToNewsletter(email);

    return res.status(200).json({
      success: true,
      message: "Successfully subscribed to Mobi Hub newsletter!",
      data: {
        email: subscriber.email,
        status: subscriber.status,
      },
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to subscribe. Please try again later.",
    });
  }
};

export const getAllNewsletterSubscribers = async (req, res) => {
  try {
    const result = await getNewsletterSubscribers({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search || "",
    });

    return res.status(200).json({
      success: true,
      message: "Newsletter subscribers fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get newsletter subscribers error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch newsletter subscribers",
    });
  }
};

export const getNewsletterStatistics = async (req, res) => {
  try {
    const stats = await getNewsletterStats();

    return res.status(200).json({
      success: true,
      message: "Newsletter statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Newsletter statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch newsletter statistics",
    });
  }
};

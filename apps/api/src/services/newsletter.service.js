import Newsletter from "../models/newsletter.model.js";

export const subscribeToNewsletter = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const subscriber = await Newsletter.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        status: "subscribed",
        subscribedAt: new Date(),
        unsubscribedAt: null,
      },
      $setOnInsert: {
        email: normalizedEmail,
        source: "website",
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  return subscriber;
};

export const getNewsletterSubscribers = async ({
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  const currentPage = Math.max(1, Number(page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(limit) || 10));

  const filter = {
    status: "subscribed",
  };

  if (search.trim()) {
    filter.email = {
      $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  }

  const [subscribers, total] = await Promise.all([
    Newsletter.find(filter)
      .sort({ subscribedAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .select("email status subscribedAt createdAt"),

    Newsletter.countDocuments(filter),
  ]);

  return {
    subscribers,
    pagination: {
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

export const getNewsletterStats = async () => {
  const [totalSubscribers, unsubscribedCount] = await Promise.all([
    Newsletter.countDocuments({ status: "subscribed" }),
    Newsletter.countDocuments({ status: "unsubscribed" }),
  ]);

  return {
    totalSubscribers,
    unsubscribedCount,
  };
};

import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getSearchSuggestions = async (query) => {
  const searchTerm = query?.trim();

  if (!searchTerm || searchTerm.length < 2) {
    return {
      products: [],
      brands: [],
      categories: [],
    };
  }

  const regex = new RegExp(escapeRegex(searchTerm), "i");

  const [products, brands, categories] = await Promise.all([
    Product.find({
      isActive: true,
      name: regex,
    })
      .select("name slug brand basePrice thumbnail")
      .limit(5)
      .lean(),

    Product.distinct("brand", {
      isActive: true,
      brand: regex,
    }),

    Category.find({
      isActive: true,
      name: regex,
    })
      .select("name slug")
      .limit(5)
      .lean(),
  ]);

  return {
    products,
    brands: brands.slice(0, 5),
    categories,
  };
};

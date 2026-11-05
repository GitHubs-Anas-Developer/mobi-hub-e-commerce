import mongoose from "mongoose";
import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Get user's wishlist
export const getWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [],
    });
  }

  return await Wishlist.findById(wishlist._id).populate({
    path: "products",
    select: "name slug brand thumbnail basePrice totalStock isActive",
  });
};

// Add product to wishlist
export const addToWishlist = async (userId, productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw createError("Invalid product ID");
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw createError("Product not found or inactive", 404);
  }

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [],
    });
  }

  const alreadyExists = wishlist.products.some(
    (id) => id.toString() === productId,
  );

  if (alreadyExists) {
    throw createError("Product already exists in wishlist", 409);
  }

  wishlist.products.push(productId);

  await wishlist.save();

  return await Wishlist.findById(wishlist._id).populate({
    path: "products",
    select: "name slug brand thumbnail basePrice totalStock isActive",
  });
};

// Remove product from wishlist
export const removeFromWishlist = async (userId, productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw createError("Invalid product ID");
  }

  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw createError("Wishlist not found", 404);
  }

  const productExists = wishlist.products.some(
    (id) => id.toString() === productId,
  );

  if (!productExists) {
    throw createError("Product not found in wishlist", 404);
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId,
  );

  await wishlist.save();

  return await Wishlist.findById(wishlist._id).populate({
    path: "products",
    select: "name slug brand thumbnail basePrice totalStock isActive",
  });
};

// Clear wishlist
export const clearWishlist = async (userId) => {
  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw createError("Wishlist not found", 404);
  }

  wishlist.products = [];

  await wishlist.save();

  return wishlist;
};

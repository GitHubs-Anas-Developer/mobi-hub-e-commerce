
import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const populateCart = async (cartId) => {
  return Cart.findById(cartId).populate({
    path: "items.product",
    select: "name slug brand thumbnail basePrice totalStock isActive variants",
  });
};

// Get user's cart and remove unavailable items
export const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  const productIds = [
    ...new Set(cart.items.map((item) => item.product.toString())),
  ];

  const activeProducts = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  }).select("_id variants");

  const validItems = cart.items.filter((item) => {
    const product = activeProducts.find(
      (product) => product._id.toString() === item.product.toString(),
    );

    if (!product) return false;

    const variant = product.variants.id(item.variantId);

    return variant && variant.isActive && variant.stock >= item.quantity;
  });

  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  return populateCart(cart._id);
};

// Validate product and variant
const validateProductVariant = async (productId, variantId, quantity) => {
  if (
    !mongoose.isValidObjectId(productId) ||
    !mongoose.isValidObjectId(variantId)
  ) {
    throw createError("Invalid product or variant ID");
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw createError("Product not found or inactive", 404);
  }

  const variant = product.variants.id(variantId);

  if (!variant || !variant.isActive) {
    throw createError("Product variant not available", 404);
  }

  if (variant.stock < quantity) {
    throw createError("Insufficient stock", 400);
  }

  return { product, variant };
};

// Add item to cart
export const addToCart = async (userId, itemData) => {
  const { productId, variantId, quantity } = itemData;

  const { variant } = await validateProductVariant(
    productId,
    variantId,
    quantity,
  );

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      item.variantId.toString() === variantId,
  );

  if (existingItem) {
    const updatedQuantity = existingItem.quantity + quantity;

    if (updatedQuantity > variant.stock) {
      throw createError("Requested quantity exceeds available stock");
    }

    existingItem.quantity = updatedQuantity;
  } else {
    cart.items.push({
      product: productId,
      variantId,
      quantity,
    });
  }

  await cart.save();

  return populateCart(cart._id);
};

// Update cart item quantity
export const updateCartItem = async (userId, itemId, quantity) => {
  if (!mongoose.isValidObjectId(itemId)) {
    throw createError("Invalid cart item ID");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw createError("Cart not found", 404);
  }

  const item = cart.items.id(itemId);

  if (!item) {
    throw createError("Cart item not found", 404);
  }

  const { variant } = await validateProductVariant(
    item.product,
    item.variantId,
    quantity,
  );

  if (quantity > variant.stock) {
    throw createError("Requested quantity exceeds available stock");
  }

  item.quantity = quantity;

  await cart.save();

  return populateCart(cart._id);
};

// Remove item from cart
export const removeCartItem = async (userId, itemId) => {
  if (!mongoose.isValidObjectId(itemId)) {
    throw createError("Invalid cart item ID");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw createError("Cart not found", 404);
  }

  const item = cart.items.id(itemId);

  if (!item) {
    throw createError("Cart item not found", 404);
  }

  item.deleteOne();

  await cart.save();

  return populateCart(cart._id);
};

// Clear cart
export const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw createError("Cart not found", 404);
  }

  cart.items = [];

  await cart.save();

  return cart;
};

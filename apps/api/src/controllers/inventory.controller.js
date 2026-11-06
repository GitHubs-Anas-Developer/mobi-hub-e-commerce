
import mongoose from "mongoose";

import Product from "../models/product.model.js";

import {
  updateVariantStock,
  getInventoryHistory,
  getLowStockVariants,
  getOutOfStockVariants,
} from "../services/inventory.service.js";
import { createError } from "../utils/createError.js";

// Adjust stock
export const adjustStock = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const {
      productId,
      variantId,
      quantity,
      direction,
      note,
      idempotencyKey,
    } = req.body;

    let transaction;
    let product;

    await session.withTransaction(async () => {
      transaction = await updateVariantStock({
        productId,
        variantId,
        quantity,
        direction,
        type: "Adjustment",
        referenceType: "Adjustment",
        performedBy: req.user._id,
        note,
        idempotencyKey,
        session,
      });

      product = await Product.findById(productId)
        .select("name totalStock variants")
        .session(session);

      if (!product) {
        throw createError("Product not found", 404);
      }
    });

    res.status(200).json({
      success: true,
      message: "Stock adjusted successfully",
      data: {
        transaction,
        product,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

// Get inventory transaction history
export const getInventoryHistoryController = async (req, res, next) => {
  try {
    const {
      productId,
      variantId,
      type,
      direction,
      page = 1,
      limit = 10,
    } = req.query;

    const result = await getInventoryHistory({
      productId,
      variantId,
      type,
      direction,
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      success: true,
      message: "Inventory history fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get low-stock variants
export const getLowStockController = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await getLowStockVariants({
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      success: true,
      message: "Low-stock variants fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get out-of-stock variants
export const getOutOfStockController = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await getOutOfStockVariants({
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      success: true,
      message: "Out-of-stock variants fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

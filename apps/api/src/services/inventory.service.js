import mongoose from "mongoose";

import Product from "../models/product.model.js";
import InventoryTransaction from "../models/inventory-transaction.model.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Update variant stock and create inventory history

export const updateVariantStock = async ({
  productId,
  variantId,
  quantity,
  direction,
  type,
  referenceType = "System",
  referenceId = null,
  performedBy = null,
  note = "",
  idempotencyKey = null,
  requireActive = false,
  session = null,
}) => {
  if (
    !mongoose.Types.ObjectId.isValid(productId) ||
    !mongoose.Types.ObjectId.isValid(variantId)
  ) {
    throw createError("Invalid product or variant ID", 400);
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw createError("Quantity must be a positive integer", 400);
  }

  if (!["IN", "OUT"].includes(direction)) {
    throw createError("Invalid stock direction", 400);
  }

  if (
    !["Order", "Cancellation", "Adjustment", "Return", "Correction"].includes(
      type,
    )
  ) {
    throw createError("Invalid inventory transaction type", 400);
  }

  if (!["Order", "Adjustment", "Return", "System"].includes(referenceType)) {
    throw createError("Invalid reference type", 400);
  }

  if (idempotencyKey && !session) {
    throw createError(
      "Idempotent stock updates require a MongoDB transaction",
      400,
    );
  }

  // 1. Check idempotency
  if (idempotencyKey) {
    const existingTransaction = await InventoryTransaction.findOne({
      idempotencyKey,
    }).session(session);

    if (existingTransaction) {
      const sameOperation =
        existingTransaction.product.toString() === productId.toString() &&
        existingTransaction.variantId.toString() === variantId.toString() &&
        existingTransaction.quantity === quantity &&
        existingTransaction.direction === direction &&
        existingTransaction.type === type &&
        existingTransaction.referenceType === referenceType &&
        String(existingTransaction.referenceId || "") ===
          String(referenceId || "");

      if (!sameOperation) {
        throw createError(
          "Idempotency key already used for a different stock operation",
          409,
        );
      }

      return existingTransaction;
    }
  }

  // 2. Find product
  const product = await Product.findById(productId).session(session);

  if (!product) {
    throw createError("Product not found", 404);
  }

  if (requireActive && !product.isActive) {
    throw createError("Product is not available for ordering", 400);
  }

  // 3. Find variant
  const variant = product.variants.id(variantId);

  if (!variant) {
    throw createError("Product variant not found", 404);
  }

  if (requireActive && !variant.isActive) {
    throw createError("Product variant is not available for ordering", 400);
  }

  // 4. Validate current stock
  const stockBefore = variant.stock;

  if (!Number.isInteger(stockBefore) || stockBefore < 0) {
    throw createError("Invalid product stock value", 400);
  }

  const stockAfter =
    direction === "IN" ? stockBefore + quantity : stockBefore - quantity;

  if (stockAfter < 0) {
    throw createError("Insufficient stock", 400);
  }

  // 5. Atomic stock update
  const updatedProduct = await Product.findOneAndUpdate(
    {
      _id: productId,
      ...(requireActive && { isActive: true }),
      variants: {
        $elemMatch: {
          _id: variantId,
          stock: stockBefore,
          ...(requireActive && { isActive: true }),
        },
      },
    },
    {
      $inc: {
        "variants.$.stock": direction === "IN" ? quantity : -quantity,
        totalStock: direction === "IN" ? quantity : -quantity,
      },
    },
    {
      new: true,
      session,
      runValidators: true,
    },
  );

  if (!updatedProduct) {
    throw createError("Stock changed concurrently. Please retry.", 409);
  }

  // 6. Create inventory transaction
  const transactionData = {
    product: productId,
    variantId,
    sku: variant.sku,
    type,
    direction,
    quantity,
    stockBefore,
    stockAfter,
    referenceType,
    referenceId,
    performedBy,
    note,
  };

  if (idempotencyKey) {
    transactionData.idempotencyKey = idempotencyKey;
  }

  const [transaction] = await InventoryTransaction.create([transactionData], {
    session,
  });

  return transaction;
};

// Get inventory transaction history
export const getInventoryHistory = async ({
  productId,
  variantId,
  type,
  direction,
  page = 1,
  limit = 10,
}) => {
  const filter = {};

  if (productId) {
    if (!mongoose.isValidObjectId(productId)) {
      throw createError("Invalid product ID");
    }

    filter.product = productId;
  }

  if (variantId) {
    if (!mongoose.isValidObjectId(variantId)) {
      throw createError("Invalid variant ID");
    }

    filter.variantId = variantId;
  }

  if (type) {
    if (
      !["Order", "Cancellation", "Adjustment", "Return", "Correction"].includes(
        type,
      )
    ) {
      throw createError("Invalid transaction type");
    }

    filter.type = type;
  }

  if (direction) {
    if (!["IN", "OUT"].includes(direction)) {
      throw createError("Invalid stock direction");
    }

    filter.direction = direction;
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    InventoryTransaction.find(filter)
      .populate("product", "name slug")
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    InventoryTransaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get low-stock variants
export const getLowStockVariants = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const products = await Product.aggregate([
    { $match: { isActive: true } },
    { $unwind: "$variants" },
    {
      $match: {
        "variants.isActive": true,
        $expr: {
          $lte: ["$variants.stock", "$variants.lowStockThreshold"],
        },
      },
    },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        productName: "$name",
        slug: "$slug",
        variantId: "$variants._id",
        sku: "$variants.sku",
        attributes: "$variants.attributes",
        stock: "$variants.stock",
        lowStockThreshold: "$variants.lowStockThreshold",
      },
    },
    { $sort: { stock: 1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        metadata: [{ $count: "total" }],
      },
    },
  ]);

  const result = products[0] || {
    data: [],
    metadata: [],
  };

  const total = result.metadata[0]?.total || 0;
  return {
    products: result.data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get out-of-stock variants
export const getOutOfStockVariants = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const products = await Product.aggregate([
    { $match: { isActive: true } },
    { $unwind: "$variants" },
    {
      $match: {
        "variants.isActive": true,
        "variants.stock": 0,
      },
    },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        productName: "$name",
        slug: "$slug",
        variantId: "$variants._id",
        sku: "$variants.sku",
        attributes: "$variants.attributes",
        stock: "$variants.stock",
      },
    },
    { $sort: { productName: 1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        metadata: [{ $count: "total" }],
      },
    },
  ]);

  const result = products[0] || {
    data: [],
    metadata: [],
  };

  const total = result.metadata[0]?.total || 0;

  return {
    products: result.data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

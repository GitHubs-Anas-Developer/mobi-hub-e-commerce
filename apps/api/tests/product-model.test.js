import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Product from "../src/models/product.model.js";
import { createProductSchema } from "../src/validators/product.validator.js";

const validProduct = (overrides = {}) => ({
  name: "ELENZO Audio Device",
  brand: "ELENZO",
  category: new mongoose.Types.ObjectId(),
  description: "A long enough product description for schema validation.",
  thumbnail: { url: "https://res.cloudinary.com/demo/image/upload/main.webp", publicId: "products/main" },
  variants: [{ sku: "elz-black", mrp: 100, sellingPrice: 80, stock: 4, lowStockThreshold: 2, attributes: { Color: "Black" }, isActive: true, isDefault: true }],
  ...overrides,
});

test("product validation calculates base price and active total stock", async () => {
  const product = new Product(validProduct({ variants: [
    { sku: "A", mrp: 100, sellingPrice: 80, stock: 4, isActive: true, isDefault: true },
    { sku: "B", mrp: 120, sellingPrice: 90, stock: 20, isActive: false },
  ] }));
  await product.validate();
  assert.equal(product.basePrice, 80);
  assert.equal(product.totalStock, 4);
  assert.equal(product.status, "active");
  assert.equal(product.variants[0].attributes.get("Color"), undefined);
  assert.equal(product.variants[1].isDefault, false);
});

test("product validation rejects selling price above MRP and malformed images", async () => {
  const product = new Product(validProduct({ variants: [{ sku: "A", mrp: 10, sellingPrice: 11, stock: 0, isActive: true, isDefault: true }] }));
  await assert.rejects(product.validate(), (error) => Boolean(error.errors["variants.0.sellingPrice"]));

  const invalidImage = new Product(validProduct({ thumbnail: { url: "not-a-url", publicId: "" } }));
  await assert.rejects(invalidImage.validate(), (error) => Boolean(error.errors["thumbnail.url"] || error.errors["thumbnail.publicId"]));
});

test("product validator rejects duplicate SKUs and accepts configurable tax metadata", () => {
  const payload = {
    name: "ELENZO Audio Device", brand: "ELENZO", category: new mongoose.Types.ObjectId().toString(),
    description: "A long enough product description for validation.",
    thumbnail: { url: "https://res.cloudinary.com/demo/image/upload/main.webp", publicId: "products/main" },
    variants: [
      { sku: "same", mrp: 10, sellingPrice: 8 },
      { sku: "SAME", mrp: 10, sellingPrice: 8 },
    ],
    gstRate: 18,
  };
  assert.equal(createProductSchema.safeParse(payload).success, false);
  payload.variants = [{ sku: "ONE", mrp: 10, sellingPrice: 8 }];
  assert.equal(createProductSchema.safeParse(payload).success, true);
});

test("product validator rejects multiple active defaults and negative inventory", () => {
  const payload = {
    name: "ELENZO Audio Device", brand: "ELENZO", category: new mongoose.Types.ObjectId().toString(),
    description: "A long enough product description for validation.",
    thumbnail: { url: "https://res.cloudinary.com/demo/image/upload/main.webp", publicId: "products/main" },
    variants: [
      { sku: "ONE", mrp: 10, sellingPrice: 8, isDefault: true },
      { sku: "TWO", mrp: 10, sellingPrice: 8, isDefault: true },
    ],
  };
  assert.equal(createProductSchema.safeParse(payload).success, false);
  payload.variants = [{ sku: "ONE", mrp: 10, sellingPrice: 8, stock: -1 }];
  assert.equal(createProductSchema.safeParse(payload).success, false);
});

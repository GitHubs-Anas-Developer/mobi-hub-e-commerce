import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Category from "../src/models/category.model.js";
import Product from "../src/models/product.model.js";
import { createProduct, updateProduct } from "../src/services/product.service.js";

import {
  generateProductSeoMetadata,
  getProductSeoUpdates,
} from "../src/utils/product-seo.js";

test("generates product-specific titles and descriptions from catalog data", () => {
  const product = {
    name: "Noise Cancelling Headphones",
    brand: "Acme Audio",
    description: "<p>Wireless headphones with active noise cancellation.</p>",
    variants: [
      { sku: "HEADPHONES-BLACK", isDefault: true, isActive: true },
      { sku: "HEADPHONES-RED", isActive: true },
      { sku: "DRAFT-SKU", isActive: false },
    ],
  };
  const first = generateProductSeoMetadata(product);
  const second = generateProductSeoMetadata({
    ...product,
    variants: [{ sku: "HEADPHONES-RED", isDefault: true, isActive: true }],
  });

  assert.match(first.seoTitle, /Noise Cancelling Headphones/);
  assert.match(first.seoTitle, /HEADPHONES-BLACK/);
  assert.match(first.seoDescription, /Acme Audio/);
  assert.match(first.seoDescription, /active noise cancellation/);
  assert.match(first.seoDescription, /HEADPHONES-BLACK/);
  assert.notEqual(first.seoTitle, second.seoTitle);
  assert.notEqual(first.seoDescription, second.seoDescription);
  assert.ok(first.seoTitle.length <= 180);
  assert.ok(first.seoDescription.length <= 300);
});

test("bounds metadata for maximum-length product fields and strips markup", () => {
  const seo = generateProductSeoMetadata({
    name: "Product ".repeat(15),
    brand: "Brand ".repeat(15),
    description: `<p>${"Detailed feature. ".repeat(40)}</p>`,
    variants: [{ sku: "SKU-123", isDefault: true }],
  });

  assert.ok(seo.seoTitle.length <= 180);
  assert.ok(seo.seoDescription.length <= 300);
  assert.doesNotMatch(seo.seoDescription, /<\/?p>/);
  assert.match(seo.seoDescription, /SKU SKU-123\./);
});

test("refreshes generated metadata on product edits but preserves custom metadata", () => {
  const currentProduct = {
    name: "Original Product",
    brand: "Acme",
    description: "Original product description.",
    variants: [{ sku: "ORIGINAL-1", isDefault: true }],
  };
  Object.assign(currentProduct, generateProductSeoMetadata(currentProduct));

  const updatedProduct = {
    ...currentProduct,
    name: "Updated Product",
    description: "Updated product description.",
    variants: [{ sku: "UPDATED-1", isDefault: true }],
  };
  const refreshed = getProductSeoUpdates(
    currentProduct,
    updatedProduct,
    {
      seoTitle: currentProduct.seoTitle,
      seoDescription: currentProduct.seoDescription,
    },
  );

  assert.match(refreshed.seoTitle, /Updated Product/);
  assert.match(refreshed.seoDescription, /Updated product description/);
  assert.match(refreshed.seoTitle, /UPDATED-1/);

  const custom = getProductSeoUpdates(
    { ...currentProduct, seoTitle: "Custom product title" },
    updatedProduct,
    { seoTitle: "Custom product title" },
  );
  assert.equal(custom.seoTitle, "Custom product title");
});

test("admin product creation and publication generate metadata and persist status", async () => {
  const originalMethods = {
    categoryFindById: Category.findById,
    productFindOne: Product.findOne,
    productFindById: Product.findById,
    productCreate: Product.create,
  };

  try {
    Category.findById = async (_id) => ({ isActive: true });
    Product.findOne = async () => null;
    Product.create = async (data) => new Product(data);

    const product = await createProduct({
      name: "Automation SEO Product",
      brand: "Acme",
      category: new mongoose.Types.ObjectId().toString(),
      description: "A clear product description for SEO publication testing.",
      thumbnail: {
        url: "https://res.cloudinary.com/demo/image/upload/product.webp",
        publicId: "products/seo-test",
      },
      variants: [
        {
          sku: "AUTOMATION-SEO-1",
          mrp: 100,
          sellingPrice: 80,
          stock: 0,
          isActive: true,
          isDefault: true,
        },
      ],
      status: "draft",
      seoTitle: "",
      seoDescription: "",
    });

    assert.equal(product.isActive, false);
    assert.equal(product.status, "draft");
    assert.match(product.seoTitle, /AUTOMATION-SEO-1/);
    assert.match(product.seoDescription, /clear product description/);

    product.save = async function save() {
      return this;
    };
    Product.findById = async () => product;

    const publishedProduct = await updateProduct(product._id, {
      status: "active",
      description: "Updated details describing the newly published item.",
    });

    assert.equal(publishedProduct.isActive, true);
    assert.equal(publishedProduct.status, "active");
    assert.match(publishedProduct.seoDescription, /Updated details/);
  } finally {
    Category.findById = originalMethods.categoryFindById;
    Product.findOne = originalMethods.productFindOne;
    Product.findById = originalMethods.productFindById;
    Product.create = originalMethods.productCreate;
  }
});

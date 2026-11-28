import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Product from "../src/models/product.model.js";
import ProductVideo from "../src/models/product-video.model.js";
import { getActiveProductVideosService } from "../src/services/product-video.service.js";

test("public product videos only return videos for published products", async () => {
  const originalMethods = {
    productDistinct: Product.distinct,
    videoFind: ProductVideo.find,
    videoCountDocuments: ProductVideo.countDocuments,
  };
  const productId = new mongoose.Types.ObjectId();
  let productFilter;
  let videoFilter;

  try {
    Product.distinct = async (field, filter) => {
      assert.equal(field, "_id");
      productFilter = filter;
      return [productId];
    };
    ProductVideo.find = (filter) => {
      videoFilter = filter;
      return {
        populate() {
          return this;
        },
        sort() {
          return this;
        },
        skip() {
          return this;
        },
        limit() {
          return this;
        },
        async lean() {
          return [];
        },
      };
    };
    ProductVideo.countDocuments = async () => 0;

    await getActiveProductVideosService({
      productId: productId.toString(),
    });

    assert.equal(productFilter.isActive, true);
    assert.deepEqual(productFilter.status, { $in: ["active", null] });
    assert.equal(String(productFilter._id), productId.toString());
    assert.equal(videoFilter.isActive, true);
    assert.deepEqual(videoFilter.product.$in, [productId]);
  } finally {
    Product.distinct = originalMethods.productDistinct;
    ProductVideo.find = originalMethods.videoFind;
    ProductVideo.countDocuments = originalMethods.videoCountDocuments;
  }
});

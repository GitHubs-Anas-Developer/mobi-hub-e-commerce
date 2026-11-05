import express from "express";

import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createAddressSchema,
  updateAddressSchema,
  addressIdSchema,
} from "../validators/address.validator.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getAddresses);

router.post("/", validate(createAddressSchema, "body"), createAddress);

router.patch(
  "/:addressId",
  validate(addressIdSchema, "params"),
  validate(updateAddressSchema, "body"),
  updateAddress,
);

router.patch(
  "/:addressId/default",
  validate(addressIdSchema, "params"),
  setDefaultAddress,
);

router.delete(
  "/:addressId",
  validate(addressIdSchema, "params"),
  deleteAddress,
);

export default router;

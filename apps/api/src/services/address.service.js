import mongoose from "mongoose";
import Address from "../models/address.model.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Get all user's addresses
export const getAddresses = async (userId) => {
  return await Address.find({ user: userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });
};

// Add new address
export const createAddress = async (userId, addressData) => {
  const addressCount = await Address.countDocuments({ user: userId });

  const isDefault = addressData.isDefault === true || addressCount === 0;

  if (isDefault) {
    await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
  }

  const address = await Address.create({
    ...addressData,
    user: userId,
    isDefault,
  });

  return address;
};

// Update address
export const updateAddress = async (userId, addressId, updateData) => {
  if (!mongoose.isValidObjectId(addressId)) {
    throw createError("Invalid address ID");
  }

  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw createError("Address not found", 404);
  }

  if (updateData.isDefault === true) {
    await Address.updateMany(
      {
        user: userId,
        _id: { $ne: addressId },
      },
      { $set: { isDefault: false } },
    );
  }

  Object.assign(address, updateData);

  await address.save();

  return address;
};

// Delete address
export const deleteAddress = async (userId, addressId) => {
  if (!mongoose.isValidObjectId(addressId)) {
    throw createError("Invalid address ID");
  }

  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw createError("Address not found", 404);
  }

  const wasDefault = address.isDefault;

  await address.deleteOne();

  // Assign default to another address if the default was deleted
  if (wasDefault) {
    const nextAddress = await Address.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return { message: "Address deleted successfully" };
};

// Set default address
export const setDefaultAddress = async (userId, addressId) => {
  if (!mongoose.isValidObjectId(addressId)) {
    throw createError("Invalid address ID");
  }

  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw createError("Address not found", 404);
  }

  await Address.updateMany({ user: userId }, { $set: { isDefault: false } });

  address.isDefault = true;
  await address.save();

  return address;
};

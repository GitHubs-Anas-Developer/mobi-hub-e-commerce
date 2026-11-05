import * as addressService from "../services/address.service.js";

// Get all addresses
export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await addressService.getAddresses(req.user._id);

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

// Create address
export const createAddress = async (req, res, next) => {
  try {
    const address = await addressService.createAddress(
      req.user._id,
      req.validatedData.body,
    );

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

// Update address
export const updateAddress = async (req, res, next) => {
  try {
    const address = await addressService.updateAddress(
      req.user._id,
      req.validatedData.params.addressId,
      req.validatedData.body,
    );

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

// Delete address
export const deleteAddress = async (req, res, next) => {
  try {
    const result = await addressService.deleteAddress(
      req.user._id,
      req.validatedData.params.addressId,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// Set default address
export const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await addressService.setDefaultAddress(
      req.user._id,
      req.validatedData.params.addressId,
    );

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

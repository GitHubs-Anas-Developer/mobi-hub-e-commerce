import * as cartService from "../services/cart.service.js";

// Get Cart
export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user._id);

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// Add to Cart
export const addToCart = async (req, res, next) => {
  try {
    const cart = await cartService.addToCart(
      req.user._id,
      req.validatedData.body,
    );

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// Update Cart Item
export const updateCartItem = async (req, res, next) => {
  try {
    const cart = await cartService.updateCartItem(
      req.user._id,
      req.validatedData.params.itemId,
      req.validatedData.body.quantity,
    );

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// Remove Cart Item
export const removeCartItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeCartItem(
      req.user._id,
      req.validatedData.params.itemId,
    );

    res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// Clear Cart
export const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user._id);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

import { checkCourierServiceability } from "../services/shiprocket.service.js";
import {
  createMockShipment,
  updateMockShipmentTracking,
} from "../services/order.service.js";

export const checkCourierServiceabilityController = async (req, res, next) => {
  try {
    const {
      pickupPostcode,
      deliveryPostcode,
      weight,
      cod = 0,
      length = 15,
      breadth = 10,
      height = 5,
    } = req.body;

    if (!pickupPostcode || !deliveryPostcode || !weight) {
      return res.status(400).json({
        success: false,
        message: "Pickup pincode, delivery pincode and weight are required",
      });
    }

    const result = await checkCourierServiceability({
      pickupPostcode,
      deliveryPostcode,
      weight,
      cod,
      length,
      breadth,
      height,
    });

    return res.status(200).json({
      success: true,
      message: "Courier serviceability checked successfully",
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const createMockShipmentController = async (req, res, next) => {
  try {
    const order = await createMockShipment(req.params.orderId, req.user?._id);

    return res.status(200).json({
      success: true,
      message: "Mock shipment created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMockShipmentTrackingController = async (req, res, next) => {
  try {
    const order = await updateMockShipmentTracking(
      req.params.orderId,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Mock tracking updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

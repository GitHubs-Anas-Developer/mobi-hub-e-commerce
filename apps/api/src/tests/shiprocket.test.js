
import "dotenv/config";
import { checkCourierServiceability } from "../services/shiprocket.service.js";

const testCourierServiceability = async () => {
  try {
    const result = await checkCourierServiceability({
      pickupPostcode: "676505",
      deliveryPostcode: "682001",
      weight: 0.5,
      cod: 0,
    });

    console.log("COURIER SERVICEABILITY RESULT:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("SHIPROCKET TEST FAILED:", error.message);
  }
};

testCourierServiceability();


import {
  createRefreshToken,
  generateAccessToken,
} from "../services/refresh-token.service.js";

const getCookieOptions = (path) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path,
});

const sanitizeUser = (user) => {
  const data = user.toObject ? user.toObject() : { ...user };

  delete data.password;

  return data;
};

const getFrontendUrl = () => {
  const clientUrl = process.env.CLIENT_URL;

  if (!clientUrl) {
    throw new Error("CLIENT_URL is missing");
  }

  const frontendUrl = new URL(clientUrl.split(",")[0].trim());

  if (!["http:", "https:"].includes(frontendUrl.protocol)) {
    throw new Error("Invalid CLIENT_URL protocol");
  }

  return frontendUrl;
};

// Google Authentication Success
export const googleAuthSuccess = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user || !user.isActive || !user.isEmailVerified) {
      return res.redirect(
        `${getFrontendUrl().origin}/login?google=failed`,
      );
    }

    // Generate the same tokens used by normal login
    const accessToken = generateAccessToken(user._id, user.role);

    const refreshToken = await createRefreshToken(user._id);

    // Access token cookie
    res.cookie("accessToken", accessToken, {
      ...getCookieOptions("/api/v1"),
      maxAge: 15 * 60 * 1000,
    });

    // Refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      ...getCookieOptions("/api/v1/auth"),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend after successful login
    const frontendUrl = getFrontendUrl();

    frontendUrl.pathname = "/";
    frontendUrl.search = "";
    frontendUrl.searchParams.set("google", "success");

    return res.redirect(frontendUrl.toString());
  } catch (error) {
    return next(error);
  }
};

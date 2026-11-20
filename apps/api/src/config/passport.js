import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "../models/user.model.js";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } =
  process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  throw new Error("Google OAuth environment variables are missing");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      state: true,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        // Get verified Google email
        const isEmailVerified = profile._json?.email_verified === true;

        const email = profile.emails
          ?.find((item) => item.verified === true)
          ?.value?.toLowerCase()
          .trim();

        if (!email || !isEmailVerified) {
          return done(null, false, {
            message: "A verified Google email is required",
          });
        }

        // Find existing Google account
        let user = await User.findOne({
          googleId: profile.id,
        });

        if (user) {
          if (!user.isActive) {
            return done(null, false, {
              message: "Your account is inactive",
            });
          }
        }

        // Check existing account by email
        if (!user) {
          user = await User.findOne({ email });

          if (user) {
            if (!user.isActive) {
              return done(null, false, {
                message: "Your account is inactive",
              });
            }

            // Never automatically link an admin account
            if (user.role !== "customer") {
              return done(null, false, {
                message: "Please use your existing login method",
              });
            }

            // Prevent linking a different Google account
            if (user.googleId && user.googleId !== profile.id) {
              return done(null, false, {
                message: "This email is linked to another Google account",
              });
            }

            // Link verified Google account to existing customer
            user.googleId = profile.id;
            user.isEmailVerified = true;
            user.emailVerificationToken = null;
            user.emailVerificationExpires = null;

            await user.save();
          }
        }

        // Create a new Google account
        if (!user) {
          user = await User.create({
            name: profile.displayName || email.split("@")[0],
            email,
            googleId: profile.id,
            authProvider: "google",
            isEmailVerified: true,
            role: "customer",
          });
        }

        // Final account status check
        if (!user.isActive) {
          return done(null, false, {
            message: "Your account is inactive",
          });
        }

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

export default passport;

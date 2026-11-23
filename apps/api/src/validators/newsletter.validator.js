export const validateNewsletterEmail = (email) => {
  if (!email || typeof email !== "string") {
    return "Email address is required";
  }

  const normalizedEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    return "Please enter a valid email address";
  }

  if (normalizedEmail.length > 254) {
    return "Email address is too long";
  }

  return null;
};

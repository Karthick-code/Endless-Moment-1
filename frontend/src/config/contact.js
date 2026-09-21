const contactConfig = {
  phones: (import.meta.env.VITE_PHONE_NUMBERS || "")
    .split(",")
    .map((phone) => phone.trim())
    .filter(Boolean),

  emails: (import.meta.env.VITE_EMAIL_ADDRESSES || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean),

  instagramLinks: (import.meta.env.VITE_INSTA_LINKS || "")
    .split(",")
    .map((link) => link.trim())
    .filter(Boolean),
};

export default contactConfig;
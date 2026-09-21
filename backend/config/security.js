import crypto from "crypto";

let runtimeSecret = "";

export const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (!runtimeSecret) runtimeSecret = crypto.randomBytes(32).toString("hex");
  return runtimeSecret;
};

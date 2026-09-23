import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/security.js";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

export const isPrimaryAdminEmail = (email) =>
  normalizeEmail(email) === normalizeEmail(process.env.ADMIN_EMAIL || "admin@test.com");

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ msg: "Authentication token is missing." });
    return;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    res.status(401).json({ msg: "Authentication token format is invalid (Bearer <token> required)." });
    return;
  }

  try {
    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret);

    if (decoded.role !== "admin") {
      res.status(403).json({ msg: "Administrator access is required." });
      return;
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Session expired or invalid authentication token." });
    return;
  }
};

export const requirePrimaryAdmin = (req, res, next) => {
  if (!isPrimaryAdminEmail(req.user?.email)) {
    res.status(403).json({ msg: "Only the primary administrator can manage admin accounts." });
    return;
  }

  next();
};

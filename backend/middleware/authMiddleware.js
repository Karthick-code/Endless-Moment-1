import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/security.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ msg: "Authentication token is missing." });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ msg: "Authentication token format is invalid (Bearer <token> required)." });
    return;
  }

  try {
    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Session expired or invalid authentication token." });
    return;
  }
};

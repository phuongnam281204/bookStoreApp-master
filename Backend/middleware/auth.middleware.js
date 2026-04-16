import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return secret;
};

const getTokenFromRequest = (req) => {
  const cookieToken = req.cookies?.token;
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer "))
    return header.slice("Bearer ".length);

  return null;
};

export const requireAuth = (req, res, next) => {
  const token = getTokenFromRequest(req);
  const secret = getJwtSecret();

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!secret) {
    return res.status(500).json({ message: "Server misconfigured" });
  }

  try {
    const payload = jwt.verify(token, secret);
    req.user = { userId: payload.userId, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};

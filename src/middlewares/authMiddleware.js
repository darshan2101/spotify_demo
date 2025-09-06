const { verifyAccessToken } = require("../utils/jwt");
const { ApiError } = require("./errorHandler");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "No token provided"));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(new ApiError(403, "Admin only"));
  }
  next();
}

module.exports = { authMiddleware, isAdmin };

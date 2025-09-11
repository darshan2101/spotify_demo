const User = require("../models/user");
const { ApiError } = require("../middlewares/errorHandler");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

async function register(req, res, next) {
  try {
    const { username, email, password, role } = req.body || {};
    if (!username || !email || !password) {
      return next(new ApiError(400, "Username, email and password are required"));
    }

    const existing = await User.findOne({ email });
    if (existing) return next(new ApiError(409, "Email already registered"));

    const user = await User.create({
      username: String(username).trim(),
      email: String(email).trim().toLowerCase(),
      password,
      role: role === "admin" ? "admin" : "user",
    });

    return res.status(201).json({
      success: true,
      message: `User registered Successfully, Welcome to Karkhana product ${username} `,
      data: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(new ApiError(500, "Failed to register user", { original: err.message }));
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return next(new ApiError(400, "Email and password are required"));

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) return next(new ApiError(401, "Invalid credentials"));

    const match = await user.comparePassword(password);
    if (!match) return next(new ApiError(401, "Invalid credentials"));

    const payload = { id: user._id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return res.json({ success: true, accessToken, refreshToken });
  } catch (err) {
    return next(new ApiError(500, "Login failed", { original: err.message }));
  }
}

async function refresh(req, res, next) {
  try {
    const { token } = req.body || {};
    if (!token) return next(new ApiError(400, "Refresh token is required"));

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      return next(new ApiError(401, "Invalid or expired refresh token"));
    }

    const payload = { id: decoded.id, role: decoded.role };
    const newAccess = signAccessToken(payload);
    const newRefresh = signRefreshToken(payload);

    return res.json({ success: true, accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    return next(new ApiError(500, "Failed to refresh token", { original: err.message }));
  }
}

async function profile(req, res, next) {
  try {
    if (!req.user) return next(new ApiError(401, "Not authenticated"));
    return res.json({ success: true, data: req.user });
  } catch (err) {
    return next(new ApiError(500, "Failed to fetch profile", { original: err.message }));
  }
}

module.exports = { register, login, refresh, profile };

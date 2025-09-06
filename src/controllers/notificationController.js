const Notification = require("../models/notification");
const { ApiError } = require("../middlewares/errorHandler");

async function getNotifications(req, res, next) {
  try {
    if (!req.user) return next(new ApiError(401, "Not authenticated"));

    const notes = await Notification.find({ user: req.user.id })
      .populate({
        path: "album",
        match: { isDeleted: false },
      })
      .populate({
        path: "song",
        match: { isDeleted: false },
      })
      .sort({ createdAt: -1 })
      .limit(20);

    const clean = notes.filter((n) => n.album && n.song);

    return res.json({ success: true, data: clean });
  } catch (err) {
    return next(new ApiError(500, "Failed to fetch notifications", { original: err.message }));
  }
}

module.exports = { getNotifications };

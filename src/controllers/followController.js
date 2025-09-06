const mongoose = require("mongoose");
const Follow = require("../models/follow");
const Album = require("../models/album");
const { ApiError } = require("../middlewares/errorHandler");

async function followAlbum(req, res, next) {
  try {
    const { albumId } = req.params || {};
    if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
      return next(new ApiError(400, "Invalid albumId"));
    }

    const album = await Album.findOne({ _id: albumId, isDeleted: false });
    if (!album) return next(new ApiError(404, "Album not found"));

    const exists = await Follow.findOne({ user: req.user.id, album: album._id });
    if (exists) return next(new ApiError(409, "Already following this album"));

    const follow = await Follow.create({ user: req.user.id, album: album._id });
    return res.status(201).json({ success: true, message: "Followed album", data: follow });
  } catch (err) {
    return next(new ApiError(500, "Failed to follow album", { original: err.message }));
  }
}

async function unfollowAlbum(req, res, next) {
  try {
    const { albumId } = req.params || {};
    if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
      return next(new ApiError(400, "Invalid albumId"));
    }

    const follow = await Follow.findOneAndDelete({ user: req.user.id, album: albumId });
    if (!follow) return next(new ApiError(404, "Not following this album"));

    return res.json({ success: true, message: "Unfollowed album" });
  } catch (err) {
    return next(new ApiError(500, "Failed to unfollow album", { original: err.message }));
  }
}

async function getFollowedAlbums(req, res, next) {
  try {
    const follows = await Follow.find({ user: req.user.id }).populate({
      path: "album",
      match: { isDeleted: false },
      populate: { path: "songs", match: { isDeleted: false } },
    });

    const albums = follows.map((f) => f.album).filter((a) => a && !a.isDeleted);
    return res.json({ success: true, data: albums });
  } catch (err) {
    return next(new ApiError(500, "Failed to fetch followed albums", { original: err.message }));
  }
}

module.exports = { followAlbum, unfollowAlbum, getFollowedAlbums };

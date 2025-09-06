const Album = require("../models/album");
const Follow = require("../models/follow");
const { ApiError } = require("../middlewares/errorHandler");

async function topAlbums(req, res, next) {
  try {
    const top = await Follow.aggregate([
      {
        $lookup: {
          from: "albums",
          localField: "album",
          foreignField: "_id",
          as: "album",
        },
      },
      { $unwind: "$album" },
      { $match: { "album.isDeleted": false } },
      {
        $group: {
          _id: "$album._id",
          title: { $first: "$album.title" },
          artist: { $first: "$album.artist" },
          followers: { $sum: 1 },
        },
      },
      { $sort: { followers: -1 } },
      { $limit: 10 },
    ]);

    return res.json({ success: true, data: top });
  } catch (err) {
    return next(new ApiError(500, "Failed to fetch top albums", { original: err.message }));
  }
}

async function genreStats(req, res, next) {
  try {
    const stats = await Album.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$genre",
          totalAlbums: { $sum: 1 },
        },
      },
      { $sort: { totalAlbums: -1 } },
    ]);

    return res.json({ success: true, data: stats });
  } catch (err) {
    return next(new ApiError(500, "Failed to fetch genre stats", { original: err.message }));
  }
}

async function artistTimeline(req, res, next) {
  try {
    const artist = req.params && req.params.artist;
    if (!artist) return next(new ApiError(400, "Artist parameter is required"));

    const timeline = await Album.aggregate([
      { $match: { artist: artist, isDeleted: false } },
      {
        $group: {
          _id: "$year",
          totalAlbums: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.json({ success: true, data: timeline, artist });
  } catch (err) {
    return next(new ApiError(500, "Failed to fetch artist timeline", { original: err.message }));
  }
}

module.exports = { topAlbums, genreStats, artistTimeline };

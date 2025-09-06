const mongoose = require("mongoose");
const Album = require("../models/album");
const { ApiError } = require("../middlewares/errorHandler");

async function browseAlbums(req, res, next) {
  try {
    let { genre, artist, year, search, sortBy, order, page, limit } = req.query || {};

    const query = { isDeleted: false };
    if (genre) query.genre = genre;
    if (artist) query.artist = artist;
    if (year) {
      const yearNum = Number(year);
      if (!Number.isNaN(yearNum)) query.year = yearNum;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { artist: { $regex: search, $options: "i" } },
      ];
    }

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    let sort = {};
    if (sortBy) {
      sort[sortBy] = order === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const albums = await Album.find(query)
      .populate({
        path: "songs",
        match: { isDeleted: false },
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Album.countDocuments(query);

    return res.json({
      success: true,
      page,
      limit,
      total,
      data: albums,
    });
  } catch (err) {
    return next(new ApiError(500, "Failed to browse albums", { original: err.message }));
  }
}

async function getAlbumById(req, res, next) {
  try {
    const { albumId } = req.params || {};
    if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
      return next(new ApiError(400, "Invalid albumId"));
    }

    const album = await Album.findOne({ _id: albumId, isDeleted: false }).populate({
      path: "songs",
      match: { isDeleted: false },
    });

    if (!album) return next(new ApiError(404, "Album not found"));

    return res.json({ success: true, data: album });
  } catch (err) {
    return next(new ApiError(500, "Failed to fetch album", { original: err.message }));
  }
}

module.exports = { browseAlbums, getAlbumById };

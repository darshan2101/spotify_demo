const mongoose = require("mongoose");
const Album = require("../models/album");
const Song = require("../models/song");
const Follow = require("../models/follow");
const Notification = require("../models/notification");
const { ApiError } = require("../middlewares/errorHandler");
const { invalidate } = require("../cache/cache");

function escapeRegExp(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function addAlbum(req, res, next) {
  try {
    const { title, artist, genre, year } = req.body || {};

    if (!title || !artist || !genre || year === undefined) {
      return next(new ApiError(400, "Missing required fields: title, artist, genre, year"));
    }

    const normalizedTitle = String(title).trim();
    const normalizedArtist = String(artist).trim();
    const yearNum = Number(year);

    if (!normalizedTitle || !normalizedArtist || Number.isNaN(yearNum)) {
      return next(new ApiError(400, "Invalid field types for title/artist/year"));
    }

    // check duplicate (case-insensitive match on title + artist + year)
    const dup = await Album.findOne({
      title: { $regex: `^${escapeRegExp(normalizedTitle)}$`, $options: "i" },
      artist: { $regex: `^${escapeRegExp(normalizedArtist)}$`, $options: "i" },
      year: yearNum,
      isDeleted: false,
    });

    if (dup) {
      return next(new ApiError(409, "An album with the same title, artist and year already exists"));
    }

    const album = await Album.create({
      title: normalizedTitle,
      artist: normalizedArtist,
      genre: String(genre).trim(),
      year: yearNum,
      createdBy: req.user && req.user.id,
    });

    invalidate(["albums:list"]);

    return res.status(201).json({ success: true, message: "Album created", data: album });
  } catch (err) {
    return next(new ApiError(500, "Failed to create album", { original: err.message }));
  }
}

async function deleteAlbum(req, res, next) {
  try {
    const { albumId } = req.params || {};
    if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
      return next(new ApiError(400, "Invalid albumId"));
    }

    const album = await Album.findById(albumId);
    if (!album) return next(new ApiError(404, "Album not found"));
    if (album.isDeleted) return next(new ApiError(410, "Album already deleted"));

    album.isDeleted = true;
    album.deletedAt = new Date();
    await album.save();

    await Song.updateMany({ album: album._id }, { isDeleted: true, deletedAt: new Date() });

    invalidate(["albums:list", `albums:${albumId}`]);

    return res.json({ success: true, message: "Album and its songs soft-deleted" });
  } catch (err) {
    return next(new ApiError(500, "Failed to delete album", { original: err.message }));
  }
}

async function addSong(req, res, next) {
  try {
    const { albumId } = req.params || {};
    const { title, duration } = req.body || {};

    if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
      return next(new ApiError(400, "Invalid albumId"));
    }

    if (!title || duration === undefined) {
      return next(new ApiError(400, "Missing required fields: title, duration"));
    }

    const normalizedTitle = String(title).trim();
    const durationNum = Number(duration);
    if (!normalizedTitle || Number.isNaN(durationNum) || durationNum <= 0) {
      return next(new ApiError(400, "Invalid title or duration"));
    }

    const album = await Album.findOne({ _id: albumId, isDeleted: false });
    if (!album) return next(new ApiError(404, "Album not found or deleted"));

    // duplicate check for song title inside the album (case-insensitive)
    const dupSong = await Song.findOne({
      album: album._id,
      title: { $regex: `^${escapeRegExp(normalizedTitle)}$`, $options: "i" },
      isDeleted: false,
    });

    if (dupSong) {
      return next(new ApiError(409, "A song with the same title already exists in this album"));
    }

    const song = await Song.create({ title: normalizedTitle, duration: durationNum, album: album._id });
    album.songs.push(song._id);
    await album.save();

    // notify followers (non-blocking; failures are logged to console)
    const followers = await Follow.find({ album: album._id }).select("user -_id");
    if (followers && followers.length) {
      const tasks = followers.map((f) =>
        Notification.create({
          user: f.user,
          album: album._id,
          song: song._id,
          message: `New song "${song.title}" added to album "${album.title}"`,
        })
      );
      const results = await Promise.allSettled(tasks);
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`Notification failed for follower index ${i}:`, r.reason && r.reason.message);
        }
      });
    }

    invalidate(["albums:list", `albums:${albumId}`]);

    return res.status(201).json({ success: true, message: "Song added to album", data: song });
  } catch (err) {
    return next(new ApiError(500, "Failed to add song", { original: err.message }));
  }
}

async function deleteSong(req, res, next) {
  try {
    const { albumId, songId } = req.params || {};

    if (!albumId || !mongoose.Types.ObjectId.isValid(albumId)) {
      return next(new ApiError(400, "Invalid albumId"));
    }
    if (!songId || !mongoose.Types.ObjectId.isValid(songId)) {
      return next(new ApiError(400, "Invalid songId"));
    }

    const album = await Album.findOne({ _id: albumId, isDeleted: false });
    if (!album) return next(new ApiError(404, "Album not found or deleted"));

    const song = await Song.findOne({ _id: songId, album: album._id });
    if (!song) return next(new ApiError(404, "Song not found"));
    if (song.isDeleted) return next(new ApiError(410, "Song already deleted"));

    song.isDeleted = true;
    song.deletedAt = new Date();
    await song.save();

    invalidate(["albums:list", `albums:${albumId}`]);

    return res.json({ success: true, message: "Song soft-deleted from album" });
  } catch (err) {
    return next(new ApiError(500, "Failed to delete song", { original: err.message }));
  }
}

module.exports = { addAlbum, deleteAlbum, addSong, deleteSong };

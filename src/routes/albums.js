const express = require("express");
const router = express.Router();
const albumCtrl = require("../controllers/albumController");
const userAlbumCtrl = require("../controllers/userAlbumController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { cacheMiddleware } = require("../cache/cache");
const validate = require("../middlewares/validate");
const { createAlbumValidation, albumIdParam } = require("../validators/albumValidators");
const { createSongValidation, songIdParam } = require("../validators/songValidators");

router.get("/", cacheMiddleware(() => "albums:list"), userAlbumCtrl.browseAlbums);

router.get(
  "/:albumId",
  validate(albumIdParam),
  cacheMiddleware((req) => `albums:${req.params.albumId}`),
  userAlbumCtrl.getAlbumById
);

router.post("/", authMiddleware, isAdmin, validate(createAlbumValidation), albumCtrl.addAlbum);

router.delete("/:albumId", authMiddleware, isAdmin, validate(albumIdParam), albumCtrl.deleteAlbum);

router.post(
  "/:albumId/songs",
  authMiddleware,
  isAdmin,
  validate([...albumIdParam, ...createSongValidation]),
  albumCtrl.addSong
);

router.delete(
  "/:albumId/songs/:songId",
  authMiddleware,
  isAdmin,
  validate([...albumIdParam, ...songIdParam]),
  albumCtrl.deleteSong
);

module.exports = router;

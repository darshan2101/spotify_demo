const express = require("express");
const router = express.Router();
const followCtrl = require("../controllers/followController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/:albumId", authMiddleware, followCtrl.followAlbum);
router.delete("/:albumId", authMiddleware, followCtrl.unfollowAlbum);
router.get("/", authMiddleware, followCtrl.getFollowedAlbums);

module.exports = router;

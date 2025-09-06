const express = require("express");
const router = express.Router();
const analyticsCtrl = require("../controllers/analyticsController");

router.get("/top-albums", analyticsCtrl.topAlbums);
router.get("/genre-stats", analyticsCtrl.genreStats);
router.get("/artist-timeline/:artist", analyticsCtrl.artistTimeline);

module.exports = router;

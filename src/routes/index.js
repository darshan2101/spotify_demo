const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ success: true, message: "Mini Spotify API", version: "0.1.0" });
});

router.use("/auth", require("./auth"));
router.use("/albums", require("./albums"));
router.use("/follows", require("./follows"));
router.use("/notifications", require("./notifications"));
router.use("/analytics", require("./analytics"));

module.exports = router;

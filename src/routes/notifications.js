const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const noteCtrl = require("../controllers/notificationController");

router.get("/", authMiddleware, noteCtrl.getNotifications);

module.exports = router;

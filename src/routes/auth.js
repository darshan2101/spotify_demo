const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { registerValidation, loginValidation } = require("../validators/authValidators");

router.post("/register", validate(registerValidation), authCtrl.register);
router.post("/login", validate(loginValidation), authCtrl.login);
router.post("/refresh", authCtrl.refresh);
router.get("/profile", authMiddleware, authCtrl.profile);

module.exports = router;

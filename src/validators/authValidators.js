const { body } = require("express-validator");

const registerValidation = [
  body("username").isString().isLength({ min: 3 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
];

const loginValidation = [
  body("email").isEmail(),
  body("password").exists(),
];

module.exports = { registerValidation, loginValidation };

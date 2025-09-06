const { body, param } = require("express-validator");

const createSongValidation = [
  body("title").isString().trim().isLength({ min: 1 }).withMessage("Title is required"),
  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number (seconds)"),
];

const songIdParam = [
  param("songId").isMongoId().withMessage("Invalid songId"),
];

module.exports = { createSongValidation, songIdParam };

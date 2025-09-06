const { body, param } = require("express-validator");

const createAlbumValidation = [
  body("title").isString().trim().isLength({ min: 1 }).withMessage("Title is required"),
  body("artist").isString().trim().isLength({ min: 1 }).withMessage("Artist is required"),
  body("genre").isString().trim().isLength({ min: 1 }).withMessage("Genre is required"),
  body("year")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("Year must be a valid number"),
];

const albumIdParam = [
  param("albumId").isMongoId().withMessage("Invalid albumId"),
];

module.exports = { createAlbumValidation, albumIdParam };

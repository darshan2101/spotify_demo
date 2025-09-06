const { validationResult } = require("express-validator");
const { ApiError } = require("./errorHandler");

module.exports = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return next(new ApiError(400, "Validation failed", errors.array()));
  };
};

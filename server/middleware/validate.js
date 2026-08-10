const { validationResult } = require('express-validator');

/**
 * Middleware: Check validation results and return errors if any
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validasi gagal.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
}

module.exports = { validate };

import {createValidator} from 'express-joi-validation';

const validator = createValidator({
  passError: true,
});

export const handleValidationError = (err, req, res, next) => {
  if (err && err.error && err.error.isJoi) {
    const errors = err.error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));

    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  next(err);
};

export {validator};

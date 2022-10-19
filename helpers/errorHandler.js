const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldDB = (error) => {
  const message = `${error.errors[0].path}:${error.errors[0].value} should be unique`;
  return new AppError(message, 400);
};
const handleDateTimeParseErrorDB = (error) => {
  const message = `${error.parent.routine} please enter valid Date or Time`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (error) => {
  const message = `${error.errors[0].path}:${error.errors[0].value} ${error.errors[0].message}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrUnhandled = (err, res) => {
  res.status(err.code).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrHandled = (error, res) => {
  res.status(error.code).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  });
}

module.exports = (err, req, res, next) => {
  err.code = err.code || 500;
  err.status = err.status || "error";
  let error = { ...err };
  if (error.name) {
    if (error.name == "CastError") error = handleCastErrorDB(error);
    if (error.name == "SequelizeUniqueConstraintError")
      error = handleDuplicateFieldDB(error);
    if (error.name == "SequelizeDatabaseError") {
      if (error.parent.code == 22007) error = handleDateTimeParseErrorDB(error);
    }
    if (error.name == "SequelizeValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    sendErrHandled(error, res)
  } else {
    sendErrUnhandled(err, res);
  }
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found ${req.originalUrl}`);
  res.status(404);
  res.json(error.message);
};

const errorHandler = (err, req, res, next) => {
  const error = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(error).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

const success = (res, message = "", body = {}) => {
  return res.status(200).json({
    success: true,
    code: 200,
    message: message,
    body: body,
  });
};

export { notFound, errorHandler, success };

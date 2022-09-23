export const checkValidation = async (v) => {
  let errorsResponse;

  await v.check().then(function (matched) {
    if (!matched) {
      let valdErrors = v.errors;
      let respErrors = [];
      Object.keys(valdErrors).forEach(function (key) {
        if (valdErrors && valdErrors[key] && valdErrors[key].message) {
          respErrors.push(valdErrors[key].message);
        }
      });
      errorsResponse = respErrors.join(", ");
    }
  });
  return errorsResponse;
};

export const failed = (res, message = "") => {
  message =
    typeof message === "object"
      ? message.message
        ? message.message
        : ""
      : message;
  return res.status(400).json({
    success: false,
    code: 400,
    message: message,
    body: {},
  });
};

export const unixTimestamp = () => {
  var time = Date.now();
  var n = time / 1000;
  return (time = Math.floor(n));
};

export const error = (res, err, req) => {
  console.log(err, "===========================>error");
  let code = typeof err === "object" ? (err.code ? err.code : 403) : 403;
  let message =
    typeof err === "object" ? (err.message ? err.message : "") : err;

  if (req) {
    req.flash("flashMessage", {
      color: "error",
      message,
    });

    const originalUrl = req.originalUrl.split("/")[1];
    return res.redirect(`/${originalUrl}`);
  }
  return res.status(code).json({
    success: false,
    message: message,
    code: code,
    body: {},
  });
};

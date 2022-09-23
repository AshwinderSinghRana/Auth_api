import { Validator } from "node-input-validator";
import { checkValidation, failed } from "../config/validator.js";
import aes256 from "aes256";

////this key is used in routes

export const authenticateHeader = async (req, res, next) => {
  const validator = new Validator(req.headers, {
    secret_key: "required|string",
    publish_key: "required|string",
  });

  let errorResponse = await checkValidation(validator);
  if (errorResponse) {
    return failed(res, errorResponse);
  }

  const { secret_key, publish_key } = req.headers;
  if (
    secret_key !== process.env.SECRET_KEY ||
    publish_key !== process.env.PUBLISH_KEY
  ) {
    return failed(res, "Keys Not Matched");
  }
  next();
};

//secret key publish key generator

// const key = aes256.encrypt("ashu1@gmail.com", "aaa");
// console.log(key);

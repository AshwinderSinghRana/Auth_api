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

// const key = "ashu@gmail.com";
// const plaintext = "aaa";
// const buffer = Buffer.from(plaintext);

// const encryptedPlainText = aes256.encrypt(key, plaintext);
// const decryptedPlainText = aes256.decrypt(key, encryptedPlainText);

// const secretKey = aes256.encrypt(key, plaintext);
// console.log(secretKey);

// const publishKey = aes256.encrypt(key, plaintext);
// console.log(publishKey);

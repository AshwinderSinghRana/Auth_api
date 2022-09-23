import CryptoJS from "crypto-js";
import dotenv from "dotenv";

dotenv.config();
const cryptoEncryptPassword = (p) => {
  const encrypt = CryptoJS.AES.encrypt(
    p,
    process.env.CRYPTO_SECRET_KEY
  ).toString();
  //   console.log(encrypt);
  return encrypt;
};

const decryptPassword = (password) => {
  const decrypted = CryptoJS.AES.decrypt(
    password,
    process.env.CRYPTO_SECRET_KEY
  );
  const decryptedPassword = decrypted.toString(CryptoJS.enc.Utf8);
  return decryptedPassword;
};

export { cryptoEncryptPassword, decryptPassword };

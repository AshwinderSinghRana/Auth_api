import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../Models/userModel.js";
import { failed } from "../config/validator.js";

dotenv.config();

export const authMiddleware = expressAsyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);

      let checkUser = await User.findOne({
        _id: decoded.id,
        login_time: decoded.iat,
      });
      if (checkUser) {
        req.user = checkUser;
        next();
      } else {
        return failed(res, "Please Login First");
      }
    } catch (error) {
      return failed(res, error.message);
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not authorized ,no token");
  }
});

import express from "express";
import { authenticateHeader } from "../Middleware/keys.js";
import {
  createUser,
  deleteUser,
  forgotPassword,
  forgottedUpdatePasword,
  getAllUser,
  getUser,
  logoutUser,
  otpVerification,
  passwordChange,
  updateUser,
  userCreateLogin,
} from "../Controllers/authController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const Route = express.Router();

//register route

Route.post("/create", authenticateHeader, createUser);
Route.delete("/delete/:userId", authenticateHeader, authMiddleware, deleteUser);
Route.put("/update/:userId", authenticateHeader, authMiddleware, updateUser);
Route.get("/singleuser/:userId", authenticateHeader, authMiddleware, getUser);
Route.get("/alluser", authenticateHeader, authMiddleware, getAllUser);

//login route

Route.post("/login", authenticateHeader, userCreateLogin);
Route.put(
  "/passwordchange/:userId",
  authenticateHeader,
  authMiddleware,
  passwordChange
);
Route.get("/logout", authenticateHeader, authMiddleware, logoutUser);
Route.post("/forgotpassword", authenticateHeader, forgotPassword);
Route.post("/otpverification", authenticateHeader, otpVerification);
Route.post(
  "/forgettedupdatepassword/:email",
  authenticateHeader,
  forgottedUpdatePasword
);

export default Route;

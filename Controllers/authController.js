import expressAsyncHandler from "express-async-handler";
import { Validator } from "node-input-validator";
import { checkValidation, error, failed } from "../config/validator.js";
import {
  cryptoEncryptPassword,
  decryptPassword,
} from "../config/cryptoEncryptDecrypt.js";
import { success } from "../Middleware/error.js";
import User from "../Models/userModel.js";
import { generateToken } from "../Utils/generateToken.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const createUser = expressAsyncHandler(async (req, res) => {
  let validatorCheck = new Validator(req.body, {
    firstName: "required",
    email: "required|email",
    password: "required",
  });

  let value = JSON.parse(JSON.stringify(validatorCheck));
  let errorResponse = await checkValidation(validatorCheck);
  if (errorResponse) {
    return failed(res, errorResponse);
  }

  const userExist = await User.findOne({ email: value.inputs.email });
  if (userExist) {
    res.status(400);
    throw new Error("User Already Exist");
  }

  try {
    let result = await User.create({
      ...req.body,
      password: cryptoEncryptPassword(req.body.password),
    });
    res.status(201).send({ success: "User created", result });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const deleteUser = expressAsyncHandler(async (req, res) => {
  try {
    let result = await User.deleteOne({ _id: req.params.userId });
    res.status(201).send({ success: "User deleted", result });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const updateUser = expressAsyncHandler(async (req, res) => {
  try {
    let result = await User.findByIdAndUpdate(req.params.userId, {
      ...req.body,
      password: cryptoEncryptPassword(req.body.password),
    });
    res.status(201).send({ success: "User updated", result });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const getUser = expressAsyncHandler(async (req, res) => {
  try {
    let result = await User.findById(req.params.userId);
    res.status(201).send({ success: "Here is the single user", result });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const getAllUser = expressAsyncHandler(async (req, res) => {
  try {
    let result = await User.find();
    res.status(201).send({ success: "Here is all the user", result });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//Login controller////////////////////////////////

const userCreateLogin = expressAsyncHandler(async (req, res) => {
  let validatorCheck = new Validator(req.body, {
    email: "required|email",
    password: "required",
  });

  let value = JSON.parse(JSON.stringify(validatorCheck));
  let errorResponse = await checkValidation(validatorCheck);
  if (errorResponse) {
    return failed(res, errorResponse);
  }

  let userExist = await User.findOne({ email: value.inputs.email });
  if (!userExist) {
    res.status(404);
    throw new Error("User Not Found");
  } else {
    const token = generateToken(userExist._id);
    const password = decryptPassword(userExist.password);
    const info = {
      firstName: userExist.firstName,
      lastName: userExist.lastName,
      email: userExist.email,
    };
    if (password === req.body.password) {
      await User.updateOne(
        { _id: userExist._id },
        {
          $set: {
            login_time: token.time,
          },
        }
      );
      return success(res, "Login Success", {
        ...info,
        token: token.token,
        time: token.time,
      });
    } else {
      -res.status(400);
      throw new Error("Invalid email or password");
    }
  }
});

const passwordChange = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return failed(res, "User Not Found");
  } else {
    try {
      const v = new Validator(req.body, {
        firstName: "string",
        lastName: "string",
        email: "email|string",
        password: "string",
        mobile: "integer",
        newPassword: req.body.password ? "required|string" : "string",
      });
      const values = JSON.parse(JSON.stringify(v));
      const errorResponse = await checkValidation(v);
      if (errorResponse) {
        return failed(res, errorResponse);
      }

      user.firstName = values.inputs.firstName || user.firstName;
      user.lastName = values.inputs.lastName || user.lastName;
      user.email = values.inputs.email || user.email;
      user.mobile = values.inputs.mobile || user.mobile;

      if (req.body.password) {
        const dcrptPassword = decryptPassword(user.password);
        if (dcrptPassword === req.body.password) {
          user.password = cryptoEncryptPassword(req.body.newPassword);
        } else {
          return failed(res, "Please Enter Old Password");
        }
      }

      const result = await user.save();
      return success(res, "Updated Successfully", {
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        mobile: result.mobile,
      });
    } catch (error) {
      return failed(res, error.message);
    }
  }
});

const logoutUser = expressAsyncHandler(async (req, res) => {
  try {
    const user = await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          login_time: 0,
        },
      }
    );
    if (user) {
      return success(res, "Logout Successfull", {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    } else {
      return failed(res, "User Not Found");
    }
  } catch (error) {
    return res, error.message;
  }
});

const forgotPassword = expressAsyncHandler(async (req, res) => {
  try {
    const v = new Validator(req.body, {
      email: "email|string|required",
    });

    const values = JSON.parse(JSON.stringify(v));
    const errorResponse = await checkValidation(v);
    if (errorResponse) {
      return failed(res, errorResponse);
    } else {
      const data = await User.findOne({ email: values.inputs.email }).select(
        "email"
      );
      if (!data) {
        return failed(res, "User Not Found");
      }
      var otp = Math.floor(Math.random() * 1000000 + 1);
      console.log(otp);
      var token = jwt.sign({ otp }, process.env.JWT_SECRET_KEY, {
        expiresIn: "3m",
      });
    }

    //nodemailer//////////////////

    var transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "f912cd891b1d06",
        pass: "50c4d05785c1d2",
      },
    });

    let info = await transport.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: values.inputs.email, // list of receivers
      subject: "OTP generate ✔", // Subject line
      text: "Hello world?", // plain text body
      html: `<b>Hello world? Here is your otp: : 
        ${otp}
         </b>`,
    });
    console.log(token);
    return success(res, "Otp Sent Successfully", token);
  } catch (error) {
    failed(res, error.message);
  }
});

const otpVerification = expressAsyncHandler(async (req, res) => {
  try {
    const v = new Validator(req.body, {
      otp: "required",
    });
    const values = JSON.parse(JSON.stringify(v));
    const errorResponse = await checkValidation(v);
    if (errorResponse) {
      return failed(res, errorResponse);
    } else {
      const token = req.headers.authorization.split(" ")[1];
      var tokenVerification = await jwt.verify(
        token,
        process.env.JWT_SECRET_KEY
      );
      console.log(tokenVerification);
    }
    if (values.inputs.otp != tokenVerification.otp) {
      return failed(res, "Wrong OTP");
    } else {
      return success(res, "OTP matched");
    }
  } catch (error) {
    failed(res, error.message);
  }
});

const forgottedUpdatePasword = expressAsyncHandler(async (req, res) => {
  try {
    const v1 = new Validator(req.body, {
      newPassword: "required",
      confirmNewPassword: "required|same:newPassword",
    });
    const v2 = new Validator(req.params, {
      email: "required",
    });
    const value1 = JSON.parse(JSON.stringify(v1));
    const errorResponse1 = await checkValidation(v1);
    const value2 = JSON.parse(JSON.stringify(v2));
    const errorResponse2 = await checkValidation(v2);
    if (errorResponse1) {
      return failed(res, errorResponse1);
    }
    if (errorResponse2) {
      return failed(res, errorResponse2);
    }
    const password = await cryptoEncryptPassword(
      value1.inputs.confirmNewPassword
    );
    const user = await User.findOne({ email: value2.inputs.email });
    if (user) {
      const updateData = await User.findOneAndUpdate(
        {
          email: value2.inputs.email,
        },
        {
          password: password,
        }
      );
      return success(res, "Password Updated Successfully");
    } else {
      return failed(res, "Email is not Valid");
    }
  } catch (err) {
    return error(res, err.message);
  }
});

export {
  createUser,
  getAllUser,
  getUser,
  updateUser,
  deleteUser,
  userCreateLogin,
  passwordChange,
  logoutUser,
  forgotPassword,
  otpVerification,
  forgottedUpdatePasword,
};

import mongoose from "mongoose";

const User = new mongoose.Schema({
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    require: true,
  },
  mobile: {
    type: Number,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  login_time: {
    type: Number,
    default: 0,
  },
});

export default new mongoose.model("Register", User);

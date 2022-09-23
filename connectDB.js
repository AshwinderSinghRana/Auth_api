import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_CONNECT);
    console.log("Connected");
  } catch (error) {
    console.log(error.message);
  }
}

export default connectDB;

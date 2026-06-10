import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  
  userName: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [30, "Username too long"],
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,

    match: [/^\S+@\S+\.\S+$/,"Please enter valid email"],
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [4, "Password must be at least 4 characters"],
  },

}, {
  timestamps: true,
})

export default mongoose.models.User ||mongoose.model("User", userSchema);
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    username: { 
      type: String, 
      unique: true, 
      sparse: true, 
      lowercase: true,
      trim: true 
    },
    email: { 
      type: String, 
      sparse: true, 
      lowercase: true,
      trim: true 
    },
    password: { type: String },
    phoneNumber: { type: String, required: true },
    firebaseUid: { type: String, unique: true, sparse: true },
    profilePic: { type: String, default: "" },
    bannerPic: { type: String, default: "" },
    about: { type: String, default: "Hey there! I am using DockChat." },
    bio: { type: String, default: "" },
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    privacySettings: {
      lastSeen: { type: String, default: "everyone" }, 
      profilePhoto: { type: String, default: "everyone" },
      about: { type: String, default: "everyone" },
      readReceipts: { type: Boolean, default: true },
    },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Password hashing middleware
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const bcrypt = require("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password verification method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  const bcrypt = require("bcryptjs");
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);

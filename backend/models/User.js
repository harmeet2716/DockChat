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
    phoneHash: { type: String, unique: true, sparse: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    privacySettings: {
      lastSeen: { type: String, default: "everyone" }, 
      profilePhoto: { type: String, default: "everyone" },
      about: { type: String, default: "everyone" },
      readReceipts: { type: Boolean, default: true },
    },
    isSearchable: { type: Boolean, default: true },
    isProfileComplete: { type: Boolean, default: false },
    isContactsSynced: { type: Boolean, default: false },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Hashing middleware
UserSchema.pre("save", async function () {
  // Password hashing
  if (this.isModified("password")) {
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Phone number hashing (SHA-256) for privacy-safe matching
  if (this.isModified("phoneNumber") && this.phoneNumber) {
    const crypto = require("crypto");
    this.phoneHash = crypto.createHash("sha256").update(this.phoneNumber).digest("hex");
  }
});

// Password verification method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  const bcrypt = require("bcryptjs");
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);

const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret", {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    let { username } = req.body;
    console.log("DEBUG: Register Request Body:", req.body);

    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!phoneNumber) missingFields.push("phoneNumber");

    if (missingFields.length > 0) {
      console.log("DEBUG: Missing fields:", missingFields);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(", ")}`,
        received: req.body 
      });
    }

    // Auto-generate username if not provided
    if (!username) {
      const emailPrefix = email.split('@')[0];
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      username = `${emailPrefix}${randomNum}`;
    }

    const lowerUsername = username.toLowerCase();
    const userExists = await User.findOne({ 
      $or: [
        { username: lowerUsername },
        { email: email.toLowerCase() },
        { phoneNumber: phoneNumber }
      ]
    });

    if (userExists) {
      const field = userExists.username === lowerUsername ? "Username" : 
                    userExists.email === email.toLowerCase() ? "Email" : "Phone number";
      return res.status(400).json({ message: `${field} is already in use` });
    }

    const user = await User.create({
      name: name || "",
      username: lowerUsername,
      email: email.toLowerCase(),
      password,
      phoneNumber,
      isVerified: false // Keep false, verify at login
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePic: user.profilePic,
      isProfileComplete: user.isProfileComplete,
      isContactsSynced: user.isContactsSynced,
      token: generateToken(user._id),
      message: "Registration successful"
    });
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identity, password } = req.body; // identity can be email or phone number

    if (!identity || !password) {
      return res.status(400).json({ message: "Please provide credentials" });
    }

    // Dual-Key Identification logic
    const isEmail = identity.includes('@');
    const query = isEmail 
      ? { email: identity.toLowerCase() } 
      : { phoneNumber: identity.replace(/\s+/g, '') }; // Simple phone normalization

    const user = await User.findOne(query);

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        profilePic: user.profilePic,
        isProfileComplete: user.isProfileComplete,
        isContactsSynced: user.isContactsSynced,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: `Invalid ${isEmail ? 'email' : 'phone number'} or password` });
    }
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

const sendOTP = async (req, res) => {
  // Manual OTP sending is now handled by Firebase on the frontend.
  // This endpoint is kept for compatibility but returns a notice.
  res.status(200).json({ message: "Please use Firebase Phone Auth on the frontend." });
};

const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, firebaseUid, isMock } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // In a real production app, we would verify the Firebase token or real OTP here.
    // For demo/development (isMock), we trust the frontend's verification.

    let user = await User.findOne({ phoneNumber });
    let isNewUser = false;

    if (!user) {
      const userData = { phoneNumber };
      if (firebaseUid) userData.firebaseUid = firebaseUid;
      
      user = await User.create(userData);
      isNewUser = true;
    } else if (firebaseUid && !user.firebaseUid) {
      user.firebaseUid = firebaseUid;
      await user.save();
    }

    res.status(200).json({
      _id: user._id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      profilePic: user.profilePic,
      isProfileComplete: user.isProfileComplete,
      isContactsSynced: user.isContactsSynced,
      token: generateToken(user._id),
      isNewUser,
    });
  } catch (error) {
    console.error("Backend verifyOTP error:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, about, profilePic } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (about) updateData.about = about;
    if (profilePic) updateData.profilePic = profilePic;
    updateData.isProfileComplete = true;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password");

    // Real-time propagation
    const io = req.app.get("io");
    if (io) {
      io.emit("user-update", {
        _id: user._id,
        name: user.name,
        profilePic: user.profilePic,
        about: user.about
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const syncContacts = async (req, res) => {
  try {
    const { numbers } = req.body; // Array of phone numbers from device
    if (!numbers || !Array.isArray(numbers)) {
      return res.status(400).json({ message: "Invalid numbers list" });
    }

    // Find users whose phone numbers are in the provided list
    const matchedUsers = await User.find({
      phoneNumber: { $in: numbers },
      _id: { $ne: req.user._id }
    }).select("name phoneNumber profilePic about isOnline lastSeen");

    res.status(200).json(matchedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    await User.findOneAndUpdate({ email }, { isVerified: true });
    await OTP.deleteMany({ email });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });

    await sendEmail({
      email,
      subject: "Your New Verification Code",
      message: `Your code is ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #10b981; text-align: center;">New Verification Code</h2>
          <p>You requested a new code. Use it to verify your account:</p>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; border-radius: 8px; border: 1px dashed #cbd5e1;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">This code will expire in 5 minutes.</p>
        </div>
      `
    });

    res.status(200).json({ message: "New code sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: "Username is required" });

    const user = await User.findOne({ username: username.toLowerCase() });
    
    if (user) {
      // Generate suggestions
      const suggestions = [
        `${username}_official`,
        `${username}.${Math.floor(Math.random() * 999)}`,
        `${username}_chat`,
        `the_${username}`
      ];
      return res.status(200).json({ 
        available: false, 
        suggestions: suggestions.slice(0, 3) 
      });
    }

    res.status(200).json({ available: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const search = req.query.search;
    if (!search) return res.status(200).json([]);

    const keyword = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ],
    };

    // Filter out the current user to avoid searching for yourself
    const users = await User.find({
      ...keyword,
      _id: { $ne: req.user?._id }
    }).select("name phoneNumber profilePic about isOnline lastSeen");
    
    res.status(200).json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Internal Server Error during search" });
  }
};

const toggleFollow = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ 
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $nin: [...req.user.following, req.user._id] }
    })
    .limit(10)
    .select("name username profilePic bio followers isVerified");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  sendOTP, 
  verifyOTP, 
  updateProfile, 
  syncContacts, 
  searchUsers,
  registerUser,
  loginUser,
  sendEmailOTP,
  verifyEmailOTP,
  toggleFollow,
  getSuggestedUsers,
  checkUsername,
  getMe
};

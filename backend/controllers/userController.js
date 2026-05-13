const User = require("../models/User");

const searchUserByPhone = async (req, res) => {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ message: "Phone number required for search" });
  }

  try {
    // Clean phone number: remove all non-digits for a strict digit match
    const cleanPhone = phone.replace(/\D/g, "");

    // Search for user by phone number (flexible match)
    // We search for a match where the stored number contains the clean digits
    const userFound = await User.findOne({
      phoneNumber: { $regex: cleanPhone }, 
      isSearchable: { $ne: false }, // Handle users where the field might be missing
      _id: { $ne: req.user._id } 
    }).select("name username profilePic email phoneNumber about");

    if (userFound) {
      res.status(200).json(userFound);
    } else {
      res.status(404).json({ message: "User not found or privacy restricted" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { searchUserByPhone };

const User = require("../models/User");

const searchUserByPhone = async (req, res) => {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ message: "Phone number required for search" });
  }

  try {
    // Clean phone number for comparison
    const cleanPhone = phone.replace(/\D/g, "");

    // Search for user by phone number and check if they are searchable
    const userFound = await User.findOne({
      phoneNumber: { $regex: cleanPhone }, // Partial match or exact
      isSearchable: true,
      _id: { $ne: req.user._id } // Don't find self
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

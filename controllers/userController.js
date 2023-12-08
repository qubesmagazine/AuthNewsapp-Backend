const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
var mailer = require("../utils/Mailer");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  console.log(req.body);

  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      success: false,
      msg: "Entered email id already registered with us. Login to continue",
    });
  }
  const user = new User({
    name,
    email,
    password,
  });

  // save user object
  user
    .save()
    .then((savedUser) => {
      res.status(201).json({
        success: true,
        msg: "Account Created successfully. Please log in",
      });
    })
    .catch((error) => {
      next(error);
    });
});


// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
      favorites: user.favorites,
    });
  } else {
    res.status(401).json({
      success: false,
      msg: "Unauthorized user",
    });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      favorites: user.favorites,
      otp: user.otp,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // Corrected line

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.avatar = req.body.avatar || user.avatar;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Server having some issues",
    });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
};

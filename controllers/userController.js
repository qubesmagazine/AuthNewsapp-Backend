const asyncHandler = require('express-async-handler')
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

  if (userExists && userExists.active) {
    return res.status(400).json({
      success: false,
      msg: "Entered email id already registered with us. Login to continue",
    });
  } else if (userExists && !userExists.active) {
    return res.status(400).json({
      success: false,
      msg: "Account created but need to activate. A link sent with your registered mobile no",
    });
  }

  const user = new User({
    name,
    email,
    password,
  });

  // Generate 20 bit activation code, ‘crypto’ is nodejs built in package.
  crypto.randomBytes(20, function (err, buf) {
    // Ensure the activation code is unique.
    user.activeToken = user._id + buf.toString("hex");

    console.log(process.env.api_host);
    // Set expiration time is 24 hours.
    user.activeExpires = Date.now() + 24 * 3600 * 1000;
    var link =
      process.env.NODE_ENV == "development"
        ? `http://locolhost:3000/api/users/active/${user.activeToken}`
        : `${process.env.api_host}/api/users/active/${user.activeToken}`;
    // Sending activation email
    mailer.send({
      to: req.body.email,
      subject: "Welcome",
      html:
        'Please click <a href="' +
        link +
        '"> here </a> to activate your account.',
    });

    // save user object
    user
      .save()
      .then((savedUser) => {
        res.status(201).json({
          success: true,
          msg:
            "The activation email has been sent to " +
            savedUser.email +
            ", please click the activation link within 24 hours.",
        });
      })
      .catch((error) => {
        next(error);
      });
  });
});

const activeToken = asyncHandler(async (req, res) => {
  // find the corresponding user
  User.findOne(
    {
      activeToken: req.params.activeToken,

      // check if the expire time > the current time       activeExpires: {$gt: Date.now()}
    },
    function (err, user) {
      if (err) return next(err);

      // invalid activation code
      if (!user) {
        return res.status(400).json({
          message: false,
          msg: "Your activation link is invalid",
        });
      }

      if (user.active == true) {
        return res.status(400).json({
          message: false,
          msg: "Your account alreday activated go and use this app.",
        });
      }

      // activate and save
      user.active = true;
      user.save(function (err, user) {
        if (err) return next(err);

        // activation success
        res.json({
          success: true,
          msg: "Activation success",
        });
      });
    }
  );
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
        msg: 'User not found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: 'Server having some issues',
    });
  }
};




module.exports = {
  registerUser,
  activeToken,
  authUser,
  getUserProfile,
  updateUserProfile,
};

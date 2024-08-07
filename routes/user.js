const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const nodemailer = require("nodemailer");
const sendOtpCode = require("../logic/userVerifiyResetPassword");
const UserOTPVerification = require('../models/userOTPVerification');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Register new user
router.post(
  '/register',
  [
    body("username").notEmpty().trim().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).trim().withMessage('Password must be at least 6 characters long'),
    body('email').isEmail().trim().withMessage('Email is invalid'),
  ],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    const result = validationResult(req);
    console.log(result);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, email } = req.body;



    try {
      const user = new User({ username, password, email });
      await user.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(406).json({ error: error.message });
    }
  }
);

// Login user
router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ "email": email });
      if (!user) {
        return res.status(406).json({ error: 'Invalid email or password' });
      }
      const HashPassword = await bcrypt.compare(password, user["password"]);
      if (!HashPassword) {
        return res.status(406).json({ error: 'Password is Correct' });
      } else {
        return res.status(200).json({ user: user });
      }
    } catch (error) {
      res.status(406).json({ error: error.message });
    }
  }
);

// Update Profile
router.post('/edit-image-profile/:uuid', upload.single('profileImage'), async (req, res) => {
  try {
    const { uuid } = req.params;
    const profileImage = req.file ? req.file.path : '';
    console.log(req.file);
    const updatedData = { "profileImage": profileImage };
    const user = await User.findOneAndUpdate({ uuid }, updatedData);
    res.status(200).json(user);
  } catch (error) {
    res.status(406).json({ error: error.message });
  }
});

// Edit user profile
router.put('/edit/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const updatedData = req.body;
    const user = await User.findOneAndUpdate({ uuid }, updatedData, { new: true });
    if (!user) return res.status(406).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(406).json({ error: error.message });
  }
});

// Reset password
router.post('/reset-password', [
  body("email").notEmpty().withMessage("Email is required")
], async (req, res) => {
  try {
    // mailtrap
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    try {
      const user = await User.findOne({ "email": email });

      if (!user) {
        return res.status(406).json({ error: 'User not Found' });
      }


      await sendOtpCode(user.uuid, email, user.username, res);




    } catch (error) {
      res.status(201).json({ error: error.message });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.post('/otp-verify', [
  body("otp").notEmpty().withMessage("OTP Code is required"),
  body("uuid").notEmpty().withMessage("uuid is required")
], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(202).json({ errors: errors.array() });
  }

  let { uuid, otp } = req.body;

  var userRecords = await UserOTPVerification.find({ userId: uuid });

  if (userRecords.length <= 0) {
    return res.status(406).json({
      status: 406,
      message: "Otp Code is Not Allow",
    });
  } else {
    const { expiresAt } = userRecords[0];
    const hashedOTP = userRecords[0].otp;

    if (expiresAt < Date.now()) {
      await UserOTPVerification.deleteMany({ userId: uuid });
      return res.status(406).json({ status: 406, message: "Code has Expired. Please request again." });
    } else {
      const validOTP = await bcrypt.compare(otp, hashedOTP);
      if (!validOTP) {
        return res.status(406).json({ status: 406, message: "Invalid code passed. Check your inbox." });
      } else {
        return res.status(200).json({ status: 200, message: "Success" })
      }
    }
  }


});

router.post("/new-password",[
  body("password").notEmpty().withMessage("Password is required"),
  body("uuid").notEmpty().withMessage("uuid is required")
],async(req,res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(202).json({ errors: errors.array() });
  }
  updatedData = {
    password:bcrypt.hash({}) 
  }

  const user = await User.findOneAndUpdate({ uuid }, updatedData, { new: true });
    if (!user) return res.status(202).json({ error: 'User not found' });
  
  res.status(200).json({message:"success"});




});

// Get user data by UUID
router.get('/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const user = await User.findOne({ uuid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(202).json({ error: error.message });
  }
});



module.exports = router;






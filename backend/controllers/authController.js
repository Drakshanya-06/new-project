const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../Utils/SendEmail');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register OR /api/auth/signup
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, country, age, dob, businessType, incomeType } = req.body;

    console.log('\n=== REGISTRATION ATTEMPT ===');
    console.log('Data received:', { name, email, phoneNumber, country, age, businessType, incomeType });

    // Validate required fields
    if (!name || !email || !phoneNumber || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user exists (lowercase email)
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      console.log('❌ User already exists:', email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    console.log('Creating user with email:', email.toLowerCase());

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phoneNumber,
      password,
      country: country || 'India',
      age,
      dob,
      businessType,
      incomeType,
    });

    console.log('✅ User created successfully!');
    console.log('User ID:', user._id);
    console.log('User email saved as:', user.email);

    // Generate token
    const token = generateToken(user._id);

    console.log('=== END REGISTRATION ===\n');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        country: user.country,
        age: user.age,
        dob: user.dob,
        businessType: user.businessType,
        incomeType: user.incomeType,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('\n=== LOGIN ATTEMPT ===');
    console.log('Email received:', email);
    console.log('Password received:', password);
    console.log('Email after lowercase:', email.toLowerCase());

    // Validate email and password
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user (include password) - LOWERCASE EMAIL
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    console.log('User found in DB:', user ? '✅ YES' : '❌ NO');
    if (user) {
      console.log('User details:');
      console.log('  - Name:', user.name);
      console.log('  - Email in DB:', user.email);
      console.log('  - Phone:', user.phoneNumber);
      console.log('  - Password hash exists:', !!user.password);
      console.log('  - Password hash length:', user.password ? user.password.length : 0);
    } else {
      console.log('❌ No user found with email:', email.toLowerCase());
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    console.log('Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    
    console.log('Password match result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');

    if (!isMatch) {
      console.log('❌ Login failed: Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);
    
    console.log('✅ Login successful for:', user.email);
    console.log('=== END LOGIN ===\n');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        country: user.country,
        age: user.age,
        businessType: user.businessType,
        incomeType: user.incomeType,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email',
      });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Hash OTP and set expiry (10 minutes)
    user.resetPasswordOTP = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create email message
    const message = `
      Hello ${user.name},
      
      You requested a password reset for your TaxPal account.
      
      Your OTP is: ${otp}
      
      This OTP will expire in 10 minutes.
      
      If you didn't request this, please ignore this email.
      
      Best regards,
      TaxPal Team
    `;

    const htmlMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .otp-box { background-color: white; border: 2px dashed #4F46E5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
          .otp { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>You requested a password reset for your TaxPal account.</p>
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your OTP is:</p>
              <div class="otp">${otp}</div>
            </div>
            <p><strong>This OTP will expire in 10 minutes.</strong></p>
            <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
            <p>Best regards,<br>TaxPal Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP - TaxPal',
        message: message,
        html: htmlMessage,
      });

      // Log OTP in development mode only
      if (process.env.NODE_ENV === 'development') {
        console.log('OTP for', email, ':', otp);
      }

      res.status(200).json({
        success: true,
        message: 'OTP sent to your email',
        // Only send OTP in development mode for testing
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      });
    } catch (emailError) {
      // If email fails, remove the OTP from database
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.',
        error: emailError.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Hash the OTP
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordOTP: hashedOTP,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Hash the OTP
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordOTP: hashedOTP,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
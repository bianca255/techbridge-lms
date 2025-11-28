const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

// Generate MFA secret and QR code
exports.setupMFA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (user.role !== 'admin') {
      return errorResponse(res, 403, 'MFA is only available for admin accounts');
    }

    if (user.mfaEnabled) {
      return errorResponse(res, 400, 'MFA is already enabled for this account');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `TechBridge (${user.email})`,
      issuer: 'TechBridge'
    });

    // Save temporary secret (not enabled yet)
    user.mfaSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    successResponse(res, 200, {
      secret: secret.base32,
      qrCode: qrCodeUrl
    }, 'MFA secret generated. Scan QR code with authenticator app');

  } catch (error) {
    next(error);
  }
};

// Verify and enable MFA
exports.verifyAndEnableMFA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.mfaSecret) {
      return errorResponse(res, 400, 'MFA setup not initiated');
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return errorResponse(res, 400, 'Invalid verification code');
    }

    // Enable MFA
    user.mfaEnabled = true;
    await user.save();

    successResponse(res, 200, { mfaEnabled: true }, 'MFA enabled successfully');

  } catch (error) {
    next(error);
  }
};

// Verify MFA token during login
exports.verifyMFAToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.mfaEnabled) {
      return errorResponse(res, 400, 'MFA is not enabled');
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return errorResponse(res, 400, 'Invalid MFA token');
    }

    successResponse(res, 200, { verified: true }, 'MFA token verified');

  } catch (error) {
    next(error);
  }
};

// Disable MFA
exports.disableMFA = async (req, res, next) => {
  try {
    const { password, token } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return errorResponse(res, 401, 'Invalid password');
    }

    // Verify current MFA token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return errorResponse(res, 400, 'Invalid MFA token');
    }

    // Disable MFA
    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    await user.save();

    successResponse(res, 200, { mfaEnabled: false }, 'MFA disabled successfully');

  } catch (error) {
    next(error);
  }
};

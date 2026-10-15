const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const memoryStore = require('../config/memoryStore');
const { isConnected } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// @desc Register user
// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      collegeName,
      department,
      yearOfStudy,
      preferredLanguage,
      placementGoals,
      role
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.'
      });
    }

    // Check existing
    if (isConnected()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.'
        });
      }

      const user = await User.create({
        fullName,
        email,
        password,
        collegeName: collegeName || 'Engineering College',
        department: department || 'Computer Science & Engineering',
        yearOfStudy: yearOfStudy || '3rd Year',
        preferredLanguage: preferredLanguage || 'python',
        placementGoals: placementGoals || 'Product Companies (Tier 1)',
        role: role === 'admin' ? 'admin' : 'student'
      });

      // Create profile
      await UserProfile.create({
        user: user._id,
        bio: `${yearOfStudy || '3rd Year'} student at ${collegeName || 'Engineering College'}`,
        targetRole: 'Software Development Engineer'
      });

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          collegeName: user.collegeName,
          department: user.department,
          yearOfStudy: user.yearOfStudy,
          preferredLanguage: user.preferredLanguage,
          placementGoals: user.placementGoals
        }
      });
    } else {
      const existing = memoryStore.findOne('users', { email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = memoryStore.insertOne('users', {
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        collegeName: collegeName || 'Engineering College',
        department: department || 'Computer Science & Engineering',
        yearOfStudy: yearOfStudy || '3rd Year',
        preferredLanguage: preferredLanguage || 'python',
        placementGoals: placementGoals || 'Product Companies (Tier 1)',
        role: role === 'admin' ? 'admin' : 'student'
      });

      memoryStore.insertOne('userprofiles', {
        user: user._id,
        bio: `${yearOfStudy || '3rd Year'} student at ${collegeName || 'Engineering College'}`,
        targetRole: 'Software Development Engineer',
        cgpa: 8.0,
        dailyGoalMinutes: 60
      });

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          collegeName: user.collegeName,
          department: user.department,
          yearOfStudy: user.yearOfStudy,
          preferredLanguage: user.preferredLanguage,
          placementGoals: user.placementGoals
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password.'
      });
    }

    let user;
    if (isConnected()) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. User not found.'
        });
      }
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }
    } else {
      user = memoryStore.findOne('users', { email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. User not found.'
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        department: user.department,
        yearOfStudy: user.yearOfStudy,
        preferredLanguage: user.preferredLanguage,
        placementGoals: user.placementGoals
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    let profile = null;
    if (isConnected()) {
      profile = await UserProfile.findOne({ user: req.user._id || req.user.id });
    } else {
      profile = memoryStore.findOne('userprofiles', { user: req.user._id || req.user.id });
    }

    return res.status(200).json({
      success: true,
      user: req.user,
      profile: profile || {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      fullName,
      collegeName,
      department,
      yearOfStudy,
      preferredLanguage,
      placementGoals,
      bio,
      targetRole,
      cgpa,
      githubUrl,
      linkedinUrl,
      targetCompanies,
      dailyGoalMinutes
    } = req.body;

    // Update User
    if (isConnected()) {
      const user = await User.findById(userId);
      if (user) {
        if (fullName) user.fullName = fullName;
        if (collegeName) user.collegeName = collegeName;
        if (department) user.department = department;
        if (yearOfStudy) user.yearOfStudy = yearOfStudy;
        if (preferredLanguage) user.preferredLanguage = preferredLanguage;
        if (placementGoals) user.placementGoals = placementGoals;
        await user.save();
      }

      const profile = await UserProfile.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            bio: bio !== undefined ? bio : '',
            targetRole: targetRole || 'Software Development Engineer',
            cgpa: cgpa || 8.0,
            githubUrl: githubUrl || '',
            linkedinUrl: linkedinUrl || '',
            targetCompanies: targetCompanies || [],
            dailyGoalMinutes: dailyGoalMinutes || 60
          }
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user,
        profile
      });
    } else {
      const updateData = {};
      if (fullName) updateData.fullName = fullName;
      if (collegeName) updateData.collegeName = collegeName;
      if (department) updateData.department = department;
      if (yearOfStudy) updateData.yearOfStudy = yearOfStudy;
      if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;
      if (placementGoals) updateData.placementGoals = placementGoals;

      const updatedUser = memoryStore.findByIdAndUpdate('users', userId, updateData);

      let profile = memoryStore.findOne('userprofiles', { user: userId });
      const profileData = {
        bio: bio !== undefined ? bio : (profile?.bio || ''),
        targetRole: targetRole || profile?.targetRole || 'Software Development Engineer',
        cgpa: cgpa || profile?.cgpa || 8.0,
        githubUrl: githubUrl || profile?.githubUrl || '',
        linkedinUrl: linkedinUrl || profile?.linkedinUrl || '',
        targetCompanies: targetCompanies || profile?.targetCompanies || [],
        dailyGoalMinutes: dailyGoalMinutes || profile?.dailyGoalMinutes || 60
      };

      if (profile) {
        profile = memoryStore.updateOne('userprofiles', { user: userId }, profileData);
      } else {
        profile = memoryStore.insertOne('userprofiles', { user: userId, ...profileData });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
        profile
      });
    }
  } catch (err) {
    next(err);
  }
};

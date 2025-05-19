import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, field, mobile, password } = req.body;
  console.log("Body : ", req.body);

  if (!name || !field || !mobile || !password || !req.file) {
    res.status(400);
    throw new Error("Please fill in all fields and upload a photo");
  }

  // Check if user exists
  const userExists = await User.findOne({ mobile });

  if (userExists) {
    res.status(400);
    throw new Error("mobile already exists");
  }

  // Upload image to cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "user_photos",
  });

  const user = await User.create({
    name,
    field,
    mobile,
    password,
    photo: result.secure_url,
    cloudinaryId: result.public_id,
    role: "user", // Default role
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      field: user.field,
      photo: user.photo,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {


  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  

  if (user) {
    user.name = req.body.name || user.name;
    user.field = req.body.field || user.field;
    user.role = req.body.role || user.role;
    user.group = req.body.group || user.group;
    user.level = req.body.level || user.level;
    

    // If there's a new photo upload
    // if (req.file) {
    //   // Delete the previous image from cloudinary
    //   await cloudinary.uploader.destroy(user.cloudinaryId);
      
    //   // Upload new image
    //   const result = await cloudinary.uploader.upload(req.file.path, {
    //     folder: "user_photos",
    //   });
      
    //   user.photo = result.secure_url;
    //   user.cloudinaryId = result.public_id;
    // }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      mobile: updatedUser.mobile,
      field: updatedUser.field,
      photo: updatedUser.photo,
      role: updatedUser.role,
      level:updatedUser.level,
      group:updatedUser.group,
    });

  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(user.cloudinaryId);
    
    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update profile photo
// @route   PUT /api/users/photo
// @access  Private
const updateUserPhoto = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user && req.file) {
    // Delete the previous image from cloudinary
    await cloudinary.uploader.destroy(user.cloudinaryId);
    
    // Upload new image
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "user_photos",
    });
    
    user.photo = result.secure_url;
    user.cloudinaryId = result.public_id;

    const updatedUser = await user.save();

    res.json({
      photo: updatedUser.photo,
      message: "Photo updated successfully",
    });
  } else if (!req.file) {
    res.status(400);
    throw new Error("Please upload a photo");
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
  
// @desc    Delete profile photo
// @route   DELETE /api/users/photo
// @access  Private
const deleteUserPhoto = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Delete the image from cloudinary
    await cloudinary.uploader.destroy(user.cloudinaryId);
    
    // Set a default photo
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/v1612228187/samples/people/default-profile.jpg",
      { folder: "user_photos" }
    );
    
    user.photo = result.secure_url;
    user.cloudinaryId = result.public_id;
    
    await user.save();
    
    res.json({ message: "Photo removed and set to default" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Get Unallocated Users
const getUnallocatedUsers = async (req, res) => {
  try {
    const { group, level } = req.query;

    // const users = await User.find({
    //   $and:[
    //    { room: { $in: ["", null] }},
    //    { level: {$eq:level}},
    //    { group: {$eq:group}}
    // ]}  );

    const query = {
      room: { $in: ["", null] },
    };

    if (level) {
      query.level = level;
    }

    // Add `group` filter only if it's provided
    if (group) {
      query.group = group;
    }

    const users = await User.find(query);

    res.status(200).json({
      ok: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching unallocated users:", error);
    res.status(500).json({
      ok: false,
      message: "Server error while fetching unallocated users",
    });
  }
};

// Get Allocated Users by IDs
const getAllocatedUsers = async (req, res) => {
  try {
    const { userIds } = req.query;
    
    if (!userIds) {
      return res.status(400).json({
        ok: false,
        message: 'User IDs are required'
      });
  }
    
    // Split the comma-separated string into an array of IDs
    const userIdArray = userIds.split(',').filter(id => id.trim().length > 0);
    
    if (userIdArray.length === 0) {
      return res.status(200).json({
        ok: true,
        users: []
      });
    }
    
    // Validate that all IDs are valid MongoDB ObjectIDs
    const mongoose = await import('mongoose');
    const validIds = userIdArray.filter(id => {
      try {
        return mongoose.default.Types.ObjectId.isValid(id);
      } catch (err) {
        return false;
      }
    });
    
    if (validIds.length === 0) {
      return res.status(200).json({
        ok: true,
        users: []
      });
    }
    
    // Fetch users by their IDs
    const users = await User.find({
      _id: { $in: validIds }
    }).select('-password');
    
    res.status(200).json({
      ok: true,
      users
    });
  } catch (error) {
    console.error('Error fetching allocated users:', error);
    res.status(500).json({
      ok: false,
      message: 'Server error while fetching allocated users',
      error: error.message
    });
  }
};

export { 
  registerUser, 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  updateUserPhoto, 
  deleteUserPhoto,
  getUnallocatedUsers,
  getAllocatedUsers,
}; 

import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import cloudinary from '../config/cloudinary.js';
import jwt from 'jsonwebtoken';
import Room from '../models/roomModel.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const {name, field, mobile, password} = req.body;
  console.log('Body : ', req.body);

  if (!name || !field || !mobile || !password || !req.file) {
    res.status(400);
    throw new Error('Please fill in all fields and upload a photo');
  }

  // Check if user exists
  const userExists = await User.findOne({mobile});

  if (userExists) {
    res.status(400);
    throw new Error('mobile already exists');
  }

  // Upload image to cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'user_photos',
  });

  const user = await User.create({
    name,
    field,
    mobile,
    password,
    photo: result.secure_url,
    cloudinaryId: result.public_id,
    role: 'user', // Default role
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
    throw new Error('Invalid user data');
  }
});

// @desc    Get all users with pagination
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchTerm = req.query.search || '';
  const filterGroup = req.query.group || 'all';

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Build search query
  let query = {};

  if (searchTerm) {
    query.$or = [
      {name: {$regex: searchTerm, $options: 'i'}},
      {field: {$regex: searchTerm, $options: 'i'}},
      {mobile: {$regex: searchTerm, $options: 'i'}},
    ];
  }

  if (filterGroup !== 'all') {
    query.group = filterGroup;
  }

  // Get total count for pagination
  const total = await User.countDocuments(query);

  // Fetch paginated users
  const users = await User.find(query).
      select('-password').
      sort({createdAt: -1}).
      skip(skip).
      limit(limit);

  res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {

  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Save old room value to check if changed
    const oldRoom = user.room;
    const newRoom = req.body.room;

    // Update user fields
    user.name = req.body.name || user.name;
    user.field = req.body.field || user.field;
    user.role = req.body.role || user.role;
    user.group = req.body.group || user.group;
    user.level = req.body.level || user.level;
    user.room = req.body.room || user.room;

    // Handle room change
    if (newRoom && newRoom !== oldRoom) {
      // If user already had a room, remove from that room
      if (oldRoom) {
        // Find old room and remove user from allocatedPersons
        const oldRoomObj = await Room.findOne({roomNo: oldRoom});
        if (oldRoomObj) {
          await Room.findByIdAndUpdate(
              oldRoomObj._id,
              {
                $pull: {allocatedPersons: user._id},
              },
          );
        }
      }

      // Add user to new room
      const newRoomObj = await Room.findOne({roomNo: newRoom});
      if (newRoomObj) {
        // Check if room has capacity
        if (newRoomObj.allocatedPersons && newRoomObj.allocatedPersons.length >=
            newRoomObj.capacity) {
          res.status(400);
          throw new Error('Room has reached maximum capacity');
        }

        // Add user to room
        await Room.findByIdAndUpdate(
            newRoomObj._id,
            {
              $addToSet: {allocatedPersons: user._id},
            },
        );
      } else {
        res.status(404);
        throw new Error('Selected room not found');
      }
    } else if (oldRoom && !newRoom) {
      // User is being removed from a room
      const oldRoomObj = await Room.findOne({roomNo: oldRoom});
      if (oldRoomObj) {
        await Room.findByIdAndUpdate(
            oldRoomObj._id,
            {
              $pull: {allocatedPersons: user._id},
            },
        );
      }

      // Clear room field
      user.room = '';
    }

    // Handle photo update if a new photo is uploaded
    if (req.file) {
      try {
        // Delete the previous image from cloudinary if it exists
        if (user.cloudinaryId) {
          await cloudinary.uploader.destroy(user.cloudinaryId);
        }

        // Upload new image
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'user_photos',
        });

        user.photo = result.secure_url;
        user.cloudinaryId = result.public_id;
      } catch (error) {
        console.error('Error updating photo:', error);
        res.status(400);
        throw new Error('Error updating photo');
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      mobile: updatedUser.mobile,
      field: updatedUser.field,
      photo: updatedUser.photo,
      role: updatedUser.role,
      level: updatedUser.level,
      group: updatedUser.group,
      room: updatedUser.room,
    });

  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Only try to delete from cloudinary if cloudinaryId exists
    if (user.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(user.cloudinaryId);
      } catch (error) {
        console.error('Error deleting image from cloudinary:', error);
        // Continue with user deletion even if cloudinary deletion fails
      }
    }

    // If user has a room assigned, remove them from that room
    if (user.room) {
      const room = await Room.findOne({roomNo: user.room});
      if (room) {
        await Room.findByIdAndUpdate(
            room._id,
            {
              $pull: {allocatedPersons: user._id},
            },
        );
      }
    }

    await user.deleteOne();
    res.json({message: 'User removed'});
  } else {
    res.status(404);
    throw new Error('User not found');
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
      folder: 'user_photos',
    });

    user.photo = result.secure_url;
    user.cloudinaryId = result.public_id;

    const updatedUser = await user.save();

    res.json({
      photo: updatedUser.photo,
      message: 'Photo updated successfully',
    });
  } else if (!req.file) {
    res.status(400);
    throw new Error('Please upload a photo');
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete profile photo
// @route   DELETE /api/users/photo
// @access  Private
const deleteUserPhoto = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    try {
      // Only try to delete from cloudinary if user has a cloudinaryId
      if (user.cloudinaryId) {
        await cloudinary.uploader.destroy(user.cloudinaryId);
      }

      // Upload a default avatar to cloudinary
      const result = await cloudinary.uploader.upload(
          'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) +
          '&background=random',
          {folder: 'user_photos'},
      );

      // Update user with new default photo
      user.photo = result.secure_url;
      user.cloudinaryId = result.public_id;

      await user.save();

      res.json({
        message: 'Photo removed and set to default',
        photo: user.photo,
      });
    } catch (error) {
      console.error('Error in deleteUserPhoto:', error);
      res.status(500);
      throw new Error('Error removing photo: ' + error.message);
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Search for users
// @route   GET /api/users/search
// @access  Private/Admin
const searchUsers = asyncHandler(async (req, res) => {
  const {query, group, level} = req.query;

  if (!query && !group && !level) {
    res.status(400);
    throw new Error('Please provide a search query, group, or level');
  }

  const searchQuery = {};

  // Add unallocated filter (users without a room)
  if (req.query.unallocated === 'true') {
    searchQuery.room = {$in: ['', null]};
  }

  // Add query parameter for name, mobile, or field search
  if (query) {
    searchQuery.$or = [
      {name: {$regex: query, $options: 'i'}},
      {mobile: {$regex: query, $options: 'i'}},
      {field: {$regex: query, $options: 'i'}},
    ];
  }

  // Add group filter if provided
  if (group) {
    searchQuery.group = group;
  }

  // Add level filter if provided
  if (level) {
    searchQuery.level = level;
  }

  const users = await User.find(searchQuery).select('-password').limit(20);

  res.json(users);
});

// Get Unallocated Users
const getUnallocatedUsers = async (req, res) => {
  try {
    const {group, level} = req.query;

    // const users = await User.find({
    //   $and:[
    //    { room: { $in: ["", null] }},
    //    { level: {$eq:level}},
    //    { group: {$eq:group}}
    // ]}  );

    const query = {
      room: {$in: ['', null]},
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
    console.error('Error fetching unallocated users:', error);
    res.status(500).json({
      ok: false,
      message: 'Server error while fetching unallocated users',
    });
  }
};

// Get Allocated Users by IDs
const getAllocatedUsers = async (req, res) => {
  try {
    const {userIds} = req.query;

    if (!userIds) {
      return res.status(400).json({
        ok: false,
        message: 'User IDs are required',
      });
    }

    // Split the comma-separated string into an array of IDs
    const userIdArray = userIds.split(',').filter(id => id.trim().length > 0);

    if (userIdArray.length === 0) {
      return res.status(200).json({
        ok: true,
        users: [],
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
        users: [],
      });
    }

    // Fetch users by their IDs
    const users = await User.find({
      _id: {$in: validIds},
    }).select('-password');

    res.status(200).json({
      ok: true,
      users,
    });
  } catch (error) {
    console.error('Error fetching allocated users:', error);
    res.status(500).json({
      ok: false,
      message: 'Server error while fetching allocated users',
      error: error.message,
    });
  }
};

const getUserFromChitthiNumber = async (req, res) => {
  try {
    const {chitthiNumber} = req.params;

    if (!chitthiNumber) {
      return res.status(400).json({
        ok: false,
        message: 'chitthi number is  required',
      });
    }

    console.log('Chitthi : ', chitthiNumber, ' Len ', chitthiNumber.length);

    // Fetch users by their IDs
    const user = await User.findOne({uniqueId: chitthiNumber});

    if (!user) {
      return res.status(400).json({
        ok: false,
        message: 'user does not with givven Chitthi Number',
      });
    }
    
    if(user.room && user.room !== ''){
      return res.status(400).json({
        ok: false,
        message: `User already allocated in Room ${user.room}`,
      });
    }

    res.status(200).json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error('Error to get user from chitthi number :', error);
    res.status(500).json({
      ok: false,
      message: 'Server error while fetching  user from chitthi number',
      error: error.message,
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
  searchUsers,
  getUserFromChitthiNumber,
}; 

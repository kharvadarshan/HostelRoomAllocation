import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Please add a name'],
      },
      field: {
        type: String,
        required: [true, 'Please add a field'],
      },
      photo: {
        type: String,
        required: [true, 'Please upload a photo'],
      },
      cloudinaryId: {
        type: String,
        required: true,
      },
      mobile: {
        type: String,
        required: [true, 'Please add a mobile no.'],
        unique: true,
      },
      password: {
        type: String,
        required: [true, 'Please add a password'],
      },
      room: {
        type: String,
        default: '',
        required: false,
      },
      level: {
        type: String,
        required: false,
        enum: ['A', 'B', 'C'],
        default: 'C',
      },
      group: {
        type: String,
        enum: [
          'New A-B',
          'A. M. Naik',
          'ADIT',
          'GCET',
          'Bhaikaka',
          'Samras',
          'Square',
          'Junarkar',
          'Nehru Hall',
          'SP',
        ],
        default: 'New A-B',
      },
      role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
      },
    },
    {
      timestamps: true,
    },
);

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User; 
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  field: string;
  mobile: string;
  photo: string;
  createdAt: Date;
}

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  field: {
    type: String,
    required: [true, 'Please provide field of study'],
    trim: true,
  },
  mobile: {
    type: String,
    required: [true, 'Please provide a mobile number'],
    trim: true,
    unique: true,
  },
  photo: {
    type: String,
    required: [true, 'Please provide a photo URL'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 
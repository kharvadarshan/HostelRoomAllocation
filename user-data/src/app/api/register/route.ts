import { NextRequest } from 'next/server';
import { createApiResponse, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/api-response';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Parse form data
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const field = formData.get('field') as string;
    const mobile = formData.get('mobile') as string;
    const photo = formData.get('photo') as File;

    // Validate required fields
    if (!name || !field || !mobile || !photo) {
      return createApiResponse({
        statusCode: 400,
        message: ERROR_MESSAGES.REQUIRED_FIELDS,
      });
    }

    // Check for existing mobile number
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return createApiResponse({
        statusCode: 400,
        message: ERROR_MESSAGES.DUPLICATE_MOBILE,
      });
    }

    // Convert photo to buffer
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const photoUrl = await uploadImage(buffer);

    // Create user in database
    const user = await User.create({
      name,
      field,
      mobile,
      photo: photoUrl,
    });

    return createApiResponse({
      statusCode: 201,
      message: SUCCESS_MESSAGES.USER_CREATED,
      data: { user },
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000 && error.keyPattern?.mobile) {
      return createApiResponse({
        statusCode: 400,
        message: ERROR_MESSAGES.DUPLICATE_MOBILE,
      });
    }

    return createApiResponse({
      statusCode: 500,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
} 
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(imageBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'image',
      folder: 'hostel-users',
    };

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) return reject(error);
        return resolve(result?.secure_url || '');
      })
      .end(imageBuffer);
  });
}

export default cloudinary; 
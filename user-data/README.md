# Shreekar Hostel - User Registration

This is a simple Next.js application for collecting user registration information for Shreekar Hostel. It features a form to collect name, field of study, mobile number, and a profile photo which is uploaded to Cloudinary.

## Features

- Clean, responsive user interface
- Form validation
- Image upload to Cloudinary
- MongoDB database storage
- Success animation after form submission

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/hostel
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NODE_ENV=development
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

1. Setup environment variables on your hosting platform
2. Build the application:
   ```bash
   npm run build
   ```
3. Start the application:
   ```bash
   npm start
   ```

## Technologies Used

- Next.js
- TypeScript
- MongoDB/Mongoose
- Cloudinary
- Tailwind CSS
- React Icons
- Framer Motion (for animations)
- React Hot Toast (for notifications) 
﻿# User Data Management Application

A full-stack application to manage user data with image uploads to Cloudinary.

## Features

- Store user data with name, field, and photo
- Upload images using Cloudinary
- Responsive UI with Tailwind CSS and animations
- Full CRUD functionality (Create, Read, Update, Delete)

## Tech Stack

### Frontend
- React with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Axios for API requests
- React Hot Toast for notifications

### Backend
- Node.js and Express
- MongoDB with Mongoose
- Cloudinary for image storage
- Multer for handling file uploads

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB Atlas account or local MongoDB
- Cloudinary account

### Setup

1. Clone the repository
```bash
git clone https://github.com/kharvadarshan/HostelRoomAllocation.git
cd HostelRoomAllocation
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
yarn install

# Install frontend dependencies
cd ../frontend
yarn install
```

3. Set up environment variables
```bash
# In the backend folder, create a .env file with the following:
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Start the development servers
```bash
# In the backend folder
yarn dev

# In the frontend folder
yarn dev
```

5. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Deployment

- Frontend: Deploy to Vercel, Netlify, or any static site hosting
- Backend: Deploy to Heroku, Railway, or any Node.js hosting service
- Update the API_URL in the frontend code to point to your deployed backend

## License

This project is licensed under the MIT License.

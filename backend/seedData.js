import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from './models/roomModel.js';
import connectDB from './config/db.js';

dotenv.config();

// Connect to database
connectDB();

// Room data to be seeded
const roomsData = [
  { roomNo: "101", capacity: 3 },
  { roomNo: "102", capacity: 3 },
  { roomNo: "103", capacity: 3 },
  { roomNo: "104", capacity: 4 },
  { roomNo: "105", capacity: 3 },
  { roomNo: "106", capacity: 3 },
  { roomNo: "107", capacity: 3 },
  { roomNo: "108", capacity: 3 },
  { roomNo: "109", capacity: 2 },
  { roomNo: "110", capacity: 3 },
  { roomNo: "111", capacity: 3 },
  { roomNo: "201", capacity: 3 },
  { roomNo: "202", capacity: 3 },
  { roomNo: "203", capacity: 3 },
  { roomNo: "204", capacity: 4 },
  { roomNo: "205", capacity: 3 },
  { roomNo: "206", capacity: 3 },
  { roomNo: "207", capacity: 3 },
  { roomNo: "208", capacity: 4 },
  { roomNo: "209", capacity: 3 },
  { roomNo: "210", capacity: 4 },
  { roomNo: "211", capacity: 3 },
  { roomNo: "301", capacity: 3 },
  { roomNo: "302", capacity: 4 },
  { roomNo: "303", capacity: 3 },
  { roomNo: "304", capacity: 4 },
  { roomNo: "305", capacity: 3 },
  { roomNo: "306", capacity: 3 },
  { roomNo: "307", capacity: 3 },
  { roomNo: "308", capacity: 3 },
  { roomNo: "309", capacity: 3 },
  { roomNo: "310", capacity: 4 },
  { roomNo: "311", capacity: 3 },
  { roomNo: "R1", capacity: 4 },
  { roomNo: "R2", capacity: 3 },
  { roomNo: "R3", capacity: 3 },
  { roomNo: "R4", capacity: 3 },
  { roomNo: "R5", capacity: 2 },
  { roomNo: "R6", capacity: 2 }
];

// Function to seed rooms
const seedRooms = async () => {
  try {
    // Clear existing rooms
    await Room.deleteMany();
    console.log('Existing rooms deleted');

    // Insert new room data
    const createdRooms = await Room.insertMany(roomsData);
    
    console.log(`${createdRooms.length} rooms seeded successfully!`);
    console.log('Sample of seeded data:');
    console.log(createdRooms.slice(0, 3));

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedRooms(); 
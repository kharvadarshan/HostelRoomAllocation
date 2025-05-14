const express = require('express');
const cors=require('cors');
const mongoose = require('mongoose');
const formDataRoutes = require('./routes/infoRoutes');
const app = express();
const path = require('path');


const env = require('dotenv');
env.config();
const PORT = process.env.PORT;

mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

app.use('/uploads',express.static(path.join(__dirname,'uploads')));

app.use(cors({origin:"http://localhost:5173"}));
app.use(express.json()); // For parsing JSON
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded form data

app.use('/api',formDataRoutes);

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}....`);
})
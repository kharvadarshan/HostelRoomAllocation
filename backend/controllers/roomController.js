import Room from '../models/roomModel.js'
import User from '../models/userModel.js'
import mongoose from 'mongoose'

const CreateRoom =async(req,res)=>{
    try{
         const { roomNo,capacity}=req.body;
         console.log(req.body);
         const existingRoom = await  Room.find({roomNo:roomNo});
         console.log(existingRoom);

         if (existingRoom.length !== 0 ) {
            return res.status(400).json({ message: 'Room number already exists' });
        }

        const newRoom = new Room({
            roomNo,
            capacity
        });

        const saveRoom = await newRoom.save();

         res.status(201).json({
            ok:true,
            message: 'Room created successfully',
            room: saveRoom
        });
    }catch(error)
    {
        console.error('Error adding room:', error);
        res.status(500).json({ message: 'Server error while adding room' });
    }
}

const AllocatePerson = async(req,res)=>{
    try{
        const {newId,roomNo} = req.body;

        if (!roomNo || !newId) {
            return res.status(400).json({ message: 'Room number and user id are required' });
        }
        const id = new mongoose.Types.ObjectId(newId);

        
        const room = await Room.findOne({roomNo:roomNo});
        console.log(room);
        if(!room)
        {
            return res.status(404).json({ok:false,message:"Room not found."});
        }

        
         if (!room.allocatedPersons) {
            room.allocatedPersons = [];
        }
         console.log(room.allocatedPersons.length);
         console.log(room.capacity);

        if ( room.allocatedPersons.length >= room.capacity) {
            return res.status(400).json({ message: 'Room has reached maximum capacity' });
        }
        
        const updatedRoom = await Room.findOneAndUpdate(
            { roomNo: roomNo },
            {
                $push: { allocatedPersons: id },
            },
            { new: true } 
        );
        
        if (!updatedRoom) {
            return res.status(404).json({ ok: false, message: "Room not found." });
        }

        const updateUser = await User.findByIdAndUpdate(
            id ,
            {
                $set:{room:roomNo}
            },{ new: true }
        );
          
        console.log(updateUser);

         if (!updateUser) {
            return res.status(404).json({ ok: false, message: "User not found." });
        }
        
            res.status(200).json({
            ok:true,
            message: 'Person allocated to room successfully',
            room: updatedRoom
            });

    }catch(error)
    {
        console.error('Error allocating person', error);
        res.status(500).json({ message: 'Server error while allocating person' });
    }
}


const GetRoomById = async(req,res)=>{

    try
    {
          const {id}=req.params;
          const newId = new mongoose.Types.ObjectId(id);
          const result = await Room.findById(newId);

          if(!result)
          {
            return res.status(400).json({ok:false,message:"Room not found."})
          }
           return res.status(201).json({ok:true,room:result});

    }catch(error)
    {
        console.error('Error getting room by id', error);
        res.status(500).json({ message: 'Server error while getting room by id' });
    }
} 


const GetAllRoom = async(req,res)=>{
    try{
        const { floor} = req.query;
   
         let allrooms= await Room.find({});


        if(floor)
        {
             const floorStr = String(floor);
             allrooms = allrooms.filter(room =>{
                if(!isNaN(room.roomNo))
                {
                    return room.roomNo.startsWith(floorStr);
                }
                return false;
             })
        }

        if(!allrooms || allrooms.length === 0)
        {
            return res.status(404).json({ok:false,message:"No rooms found."});
        }
       
        return res.status(201).json({ok:true,message:"all rooms",rooms:allrooms});
    }catch(error)
    {
        return res.status(500).json({ message: "Server error", error });
    }
}

export { CreateRoom,AllocatePerson,GetRoomById,GetAllRoom};
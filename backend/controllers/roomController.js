import Room from '../models/roomModel.js'
import User from '../models/userModel.js'
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
        const {name,field, roomNo,photo} = req.body;
        if (!roomNo || !name || !field || !photo) {
            return res.status(400).json({ message: 'Room number, name, field, and photo are required' });
        }
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
                $push: { allocatedPersons: { name, field, photo } },
            },
            { new: true } 
        );

        
        if (!updatedRoom) {
            return res.status(404).json({ ok: false, message: "Room not found." });
        }

        const updateUser = await User.findOneAndUpdate(
            { name:name },
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

export { CreateRoom,AllocatePerson};
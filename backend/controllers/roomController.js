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
          const { id } = req.params;
          const room = await Room.findById(id);

          if(!room)
          {
            return res.status(404).json({ok:false, message:"Room not found."})
          }
           return res.status(200).json({ok:true, room});
    }catch(error)
    {
        console.error('Error getting room by id', error);
        res.status(500).json({ message: 'Server error while getting room by id' });
    }
} 


const GetAllRoom = async(req,res)=>{
    try{
        const { floor } = req.query;
   
        let allrooms = await Room.find({});

        if(floor) {
            // Filter rooms by floor (first digit of room number)
            allrooms = allrooms.filter(room => {
                if(room.roomNo) {
                    return room.roomNo.toString().charAt(0) === floor;
                }
                return false;
            });
        }

        // If no rooms found, return empty array instead of 404
        return res.status(200).json({
            ok: true, 
            message: "all rooms", 
            rooms: allrooms || []
        });
    } catch(error) {
        console.error('Error fetching rooms:', error);
        return res.status(500).json({ 
            ok: false,
            message: "Server error", 
            error: error.message 
        });
    }
}




const DeAllocateUser=async(req,res)=>{
    try
    {
           const {roomId , userId} = req.body;

           const uid= new mongoose.Types.ObjectId(userId);
           const rid = new mongoose.Types.ObjectId(roomId);

           const room = await Room.findById(rid);

           if(!room)
           {
            return res.status(404).json({message:"Room not found."});
           }
            
           const isPersonInRoom = room.allocatedPersons.includes(uid);

           if(!isPersonInRoom){
            return res.status(400).json({message:'User is not allocated to this room.'});
           }

           const updatedRoom = await Room.findByIdAndUpdate(
             roomId,
             {
                $pull:{allocatedPersons:uid}
             },
             {new :true}
           );

           if(updatedRoom.modifiedCount <= 0)
           {
             return res.status(404).json({ ok: false, message: "Room not found during update." });
           }

           const user  = await User.findById(uid);

           if(!user )
           {
                return res.status(404).json({message:"User not found."});
           }

           const updatedUser =  await User.findByIdAndUpdate(
            uid,
            {
                $unset:{room:""}
            },
            { new: true }
           );

           if(updatedUser.modifiedCount <= 0)
           {
               return res.status(404).json({ ok: false, message: "User not found during update." });
           }

        
            return res.status(201).json({
            ok: true,
            message: 'Person deallocated from room successfully',
            room: updatedRoom
        });


    }catch(error)
    {
         console.error('Error deallocating person', error);
        res.status(500).json({ message: 'Server error while deallocating person' });
    }
}

// Update room details
const UpdateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomNo, capacity } = req.body;
        
        // Validate inputs
        if (!roomNo || !capacity) {
            return res.status(400).json({ 
                ok: false, 
                message: 'Room number and capacity are required' 
            });
        }
        
        // Check if room exists
        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ 
                ok: false, 
                message: 'Room not found' 
            });
        }
        
        // Check if new room number already exists (if changed)
        if (roomNo !== room.roomNo) {
            const existingRoom = await Room.findOne({ roomNo });
            if (existingRoom) {
                return res.status(400).json({ 
                    ok: false, 
                    message: 'Room number already exists' 
                });
            }
        }
        
        // Update room
        const updatedRoom = await Room.findByIdAndUpdate(
            id,
            { roomNo, capacity },
            { new: true }
        );
        
        return res.status(200).json({
            ok: true,
            message: 'Room updated successfully',
            room: updatedRoom
        });
    } catch (error) {
        console.error('Error updating room:', error);
        return res.status(500).json({ 
            ok: false, 
            message: 'Server error while updating room' 
        });
    }
};

// Delete room
const DeleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if room exists
        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ 
                ok: false, 
                message: 'Room not found' 
            });
        }
        
        // Check if room has allocated users
        if (room.allocatedPersons && room.allocatedPersons.length > 0) {
            return res.status(400).json({ 
                ok: false, 
                message: 'Cannot delete room with allocated users' 
            });
        }
        
        // Delete room
        await Room.findByIdAndDelete(id);
        
        return res.status(200).json({
            ok: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting room:', error);
        return res.status(500).json({ 
            ok: false, 
            message: 'Server error while deleting room' 
        });
    }
};

export { CreateRoom,AllocatePerson,GetRoomById,GetAllRoom,DeAllocateUser,UpdateRoom,DeleteRoom};
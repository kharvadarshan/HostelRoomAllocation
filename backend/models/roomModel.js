import mongoose from 'mongoose'

// const personSchema = mongoose.Schema({
   
//    name: {
//       type: String,
//       required: true,
//     },
//     field: {
//       type: String,
//       required: true, 
//     },
//     photo: {
//       type: String,
//       required: true, 
//     },
// });


const roomSchema = mongoose.Schema({
    roomNo:{
        type: String,
        required:true,
        unique:true
    },
    capacity:{
        type:Number,
        required:true,
    },
    allocatedPersons:{
        type: [mongoose.Schema.Types.ObjectId],
    },
    group: {
        type: String,
        required: false,
    }
});


const Room = mongoose.model('Room',roomSchema);

export default Room;
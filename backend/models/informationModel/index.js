const mongoose = require('mongoose');


const informationSchema = new  mongoose.Schema({
  name:{
      type:String,
      required:true,
      trim:true
  },
  photo:{
      type:String,
      required:true
  },
  study:{
      type:String,
      required:true,
      trim:true
  },
  createdAt: {
      type: Date,
      default: Date.now(),
    },
},{
    timestamps:true,
  });

  
const Information = mongoose.model('Information',informationSchema);
module.exports=Information;
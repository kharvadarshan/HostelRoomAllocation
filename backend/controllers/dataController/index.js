
const InformationModel = require('../../models/informationModel');
exports.postFormData = async(req,res)=>{
    try{
           const {name,study}= req.body;
            const photo=req.file;

              if (!name || !study || !photo) {
            return res.status(400).json({
                ok: false,
                message: "All fields are required"
            });   }
         
            const newInfo = await InformationModel.create({
                name,
                study,
                photo:photo.filename
            });

             return res.status(201).json({
            ok: true,
            message: "Information submitted successfully",
            data: newInfo
          });
    }catch(error)
    {
          console.error(error);
        return res.status(500).json({
            ok: false,
            message: "Internal server error",
            error: error.message
        });
    }
}
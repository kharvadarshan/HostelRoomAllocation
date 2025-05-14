const express= require('express');
const multer = require('multer');
const { postFormData} = require('../../controllers/dataController');
const router = express.Router();

const storage = multer.diskStorage({
    destination: './uploads/',
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits:{fileSize:10*1024*1024}
});


router.post('/infoData',upload.single('photo'),postFormData);

module.exports = router;
import express from 'express'
const router = express.Router();
import {CreateRoom,AllocatePerson,GetRoomById,GetAllRoom} from  '../controllers/roomController.js'


router.post('/',CreateRoom);
router.post('/user',AllocatePerson);
router.get('/',GetAllRoom);
router.get('/get-roombyid/:id',GetRoomById);


export default  router;

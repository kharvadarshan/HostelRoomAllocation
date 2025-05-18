import express from 'express'
const router = express.Router();
import {CreateRoom,AllocatePerson,GetRoomById,GetAllRoom,DeAllocateUser} from  '../controllers/roomController.js'


router.post('/',CreateRoom);
router.post('/user',AllocatePerson);
router.get('/',GetAllRoom);
router.get('/get-roombyid/:id',GetRoomById);
router.delete('/',DeAllocateUser);


export default  router;

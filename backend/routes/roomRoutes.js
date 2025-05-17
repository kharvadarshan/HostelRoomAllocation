import express from 'express'
const router = express.Router();
import {CreateRoom,AllocatePerson} from  '../controllers/roomController.js'

router.post('/create-room',CreateRoom);
router.post('/allocate-person',AllocatePerson);

export default  router;

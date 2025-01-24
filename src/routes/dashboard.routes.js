import { Router } from "express";
// import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import{
    getChannelStats, 
    getChannelVideos
} from "../controllers/dashboard.controller.js"


const router=Router();

router.route("/channel-stats/:channelId").get(verifyJWT,getChannelStats);
router.route("/channel-videos/:channelId").get(verifyJWT,getChannelVideos);

export default router;
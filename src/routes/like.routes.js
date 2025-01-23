import { Router } from "express";
import{
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from "../controllers/like.controller.js"

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();


router.route("/liked-videos").get(verifyJWT,getLikedVideos);
router.route("/comment/:commentId").post(verifyJWT,toggleCommentLike);
router.route("/tweet/:tweetId").post(verifyJWT,toggleTweetLike);
router.route("/video/:videoId").post(verifyJWT,toggleVideoLike);

export default router
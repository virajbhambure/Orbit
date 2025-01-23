import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js"

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/").post(verifyJWT,createTweet);
router.route("/update-tweet/:tweetId").put(verifyJWT,updateTweet);
router.route("/delete-tweet/:tweetId").delete(verifyJWT,deleteTweet);
router.route("/user/:userId").get(verifyJWT,getUserTweets);

export default router;
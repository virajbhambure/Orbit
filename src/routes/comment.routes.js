import { Router } from "express";
import {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
} from "../controllers/comment.controller.js"

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/:videoId").get(verifyJWT,getVideoComments);
router.route("/add-comment").post(verifyJWT,addComment);
router.route("/update-comment").put(verifyJWT,updateComment);
router.route("/delete-comment").delete(verifyJWT,deleteComment);

export default router;
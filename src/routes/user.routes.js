import { Router } from "express";
import { loginUser,logoutUser,registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT } from "../middlewares/auth.middleware.js" // newly added

const router = Router();
router.route("/register").post(
  //this upload field is used as a middleware to verify image uploading
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser)

//secured routes 
router.route("/logout").post(verifyJWT,logoutUser)
export default router;

import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; // newly added

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

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser); // here we first verify user with verifyJWT middleware and then logout processed
router.route("/refresh-token").post(refreshAccessToken,)  // here we need not to worry about verifying

export default router;

import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { user } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponce } from "../utils/apiResponce.js";

const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //     massage:"Ok"
  // })

  //steps to register new user
  //1] get user details from frontend (here we will take it from postman)
  //     {here you need to enable middleware to check for image uploading part in routers}
  //2] validation (not empty)
  //3] check if already exist by: 1] username , 2] email
  //4] check for images, check for avatar
  //5] if available then upload them on cloudinary, check avatar
  //6] create user object-create entry in db
  //7] remove password and refresh token fields from responce(going to user)
  //8] check for user creation or null
  //9] return responce

  const { fullName, email, username, password } = req.body;
  console.log("email:", email);
  /* // this is normal one by one validation method
    if(fullName==="")
    {
        throw new apiError(400,"Fullname is required");
        
    }
   */

  // this is advance method
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All field are compulsary");
  }
  const existedUser = await user.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "User with email or username already exists.");
  }

  //handle image files exist or not
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
 let coverImageLocalPath;
 if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
 {
  coverImageLocalPath=req.files.coverImage[0].path
 }

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar is required");
  }

  //upload images on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);




  //again avatar field because it is required field
  if (!avatar) {
    throw new apiError(400, "Avatar is required");
  }

  //now create entry in database
  const User = await user.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username: username.toLowerCase(),
    password,
  });
  //checking user is created or not?  and //here check User , user
  const createdUser = await user
    .findById(User._id)
    .select(" -password -refreshToken "); // syntax is important to understand, here "-" sign is used to remove those fields

  if (!createdUser) {
    throw new apiError(500, "something went wrong while registring the user");
  }

  return res
    .status(201)
    .json(new apiResponce(200, createdUser, "User registered successfully"));
});

export { registerUser };

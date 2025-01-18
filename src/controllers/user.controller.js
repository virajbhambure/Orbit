import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { user } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponce } from "../utils/apiResponce.js";


//"generateRefreshAndAccessTokens" this method is created saperatly because we will need it many times to use in code
const generateRefreshAndAccessTokens=async(userId)=>
{
  try {
    const user=await user.findById(userId)
   const accessToken= user.generateAccessToken()
   const refreshToken= user.generateRefreshToken()
   user.refreshToken=refreshToken;
   await user.save({validateBeforeSave:false});
   
   return{accessToken,refreshToken}

  } catch (error) {
    throw new apiError(500,"something went wrong while refreshing refresh and access tokens")    
  }
}

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

const loginUser = asyncHandler(async(req,res)=>{
  //request body to get data
  //username or email
  //find the user
  //password check
  //access and refresh tokens 
  //send cookies

  const { email, password,username }= req.body;
  if(!email || !username)
  {
    throw new apiError(400,"Username or email is required")
  }
  //caution about user & User
//  const User=await user.findById(
//    { $or:[{username},{email}] } 
//   )

 //this is my changes
 const User = await user.findOne(
  { $or: [{ username }, { email }] } 
);



  //here we are using "User" because currently we have stored data of "user" in "User"
  if(!User){ throw new apiError(400,"User does not exist")}

  const isPasswordValid=await User.isPasswordCorrect(password)
  if(!isPasswordValid){ throw new apiError(401,"Invalid password")}

  const {accessToken, refreshToken}=await generateAccessToken(User._id)

  // now we will send only essential information in cookies to user
  const loggedInUser=await user.findById(User._id).select("-password -refreshToken")

  //now we will make cookies more secure i.e. in frontend user can only see those 
  //cokiees and cannot modify those.
  const option={
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new apiResponce(200,
      {
        user: loggedInUser,accessToken , refreshToken
      },
      "User logged in successfully"
    )
  )
})

const logoutUser= asyncHandler(async(req,res)=>{
  //to logout user we will remove cookies and also refresh token
  //for this we will design our own middleware so go on auth.middleware.js
 await user.findByIdAndUpdate(
    req.User._id,{
      $set:{ refreshToken:undefined}
    },{
      new:true
    }
  )
  const option={
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new apiResponce(200 , {} , "User logged out")
  )
})
export { 
  registerUser,
  loginUser,
  logoutUser

 };


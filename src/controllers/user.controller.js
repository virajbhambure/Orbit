import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { user } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponce } from "../utils/apiResponce.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//"generateRefreshAndAccessTokens" this method is created saperatly because we will need it many times to use in code
const generateRefreshAndAccessTokens = async (userId) => {
  try {
    const User = await user.findById(userId);
    const accessToken = User.generateAccessToken();
    const refreshToken = User.generateRefreshToken();
    User.refreshToken = refreshToken;
    await User.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "something went wrong while refreshing refresh and access tokens"
    );
  }
};

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
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
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

const loginUser = asyncHandler(async (req, res) => {
  //request body to get data
  //username or email
  //find the user
  //password check
  //access and refresh tokens
  //send cookies

  const { email, password, username } = req.body;
  if (!(email || username)) {
    throw new apiError(400, "Username or email is required");
  }
  //caution about user & User
  //  const User=await user.findById(
  //    { $or:[{username},{email}] }
  //   )

  //this is my changes
  const User = await user.findOne({ $or: [{ username }, { email }] });

  //here we are using "User" because currently we have stored data of "user" in "User"
  if (!User) {
    throw new apiError(400, "User does not exist");
  }

  const isPasswordValid = await User.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(
    User._id
  );

  // now we will send only essential information in cookies to user
  const loggedInUser = await user
    .findById(User._id)
    .select("-password -refreshToken");

  //now we will make cookies more secure i.e. in frontend user can only see those
  //cokiees and cannot modify those.
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponce(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //to logout user we will remove cookies and also refresh token
  //for this we will design our own middleware so go on auth.middleware.js
  await user.findByIdAndUpdate(
    req.user._id,
    {
      // $set:{ refreshToken:undefined}  //changed
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponce(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefershToken=req.cookies.refreshToken || req.body.refreshToken 
    if(!incomingRefershToken)
    {
      throw new apiError(401,"unauthorized access request")
    };

  try {
     const decodedToken =  jwt.verify(
          incomingRefershToken,
          process.env.REFRESH_TOKEN_SECRET
         )
       const userFound= await user.findById(decodedToken?._id)
       if(!userFound)
        {
          throw new apiError(401,"Invalid refresh token")
        };
  
        // now we have both incoming refresh token and saved refresh token in DB so now compair both tokens
        if(incomingRefershToken !==user?.refreshToken)
        {
          throw new apiError(401,"refresh token is expired or used");
  
        }
  
        //at this line we can say both tokens are same so now we can generate new token
        const options={
          httpOnly:true,
          secure:true
        }
       const{accessToken,newRefreshToken} =await generateRefreshAndAccessTokens(user._id)
  
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
          200,
          { accessToken,newRefreshToken },
          "Access Token Refreshed")
          
  } catch (error) {
   throw new apiError(401,error?.message || "Invalid refresh token")
  }
});

const changeCurrentPassword= asyncHandler(async(req,res)=>{
const{oldPassword,newPassword,confirmPassword}=req.body

if(!(newPassword===confirmPassword))
{
  throw new apiError(401,"New password and confirm password are not same")
}
const User= user.findById(req.user?._id);
const isPasswordCorrect = await User.isPasswordCorrect(oldPassword);
if(!isPasswordCorrect)
{
  throw new apiError(401,"Invalid Password");
}
//at this line old password is verified now changing the password
User.password=newPassword;
await user.save({validateBeforeSave:false});
return res
.status(200)
.json(new apiResponce(200,{},"Password Changed Successfully"));
})

const getCurrentUser= asyncHandler(async(req,res)=>{
  return res.status(200)
  .json(new apiResponce(200,req.user,"User fetched successfully"));
})

const updateAccountDetails= asyncHandler(async(req,res)=>{
 const{fullName,email,  }=req.body
 if(!(fullName || email))
 {
  throw new apiError("All fields are required");
 }

 const updatedUser= user.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName : fullName,
        email: email
      }
    },
    {new:true}

  ).select("-password")

  return res
  .status(200)
  .json(new apiResponce(200,updatedUser,"Information updated successfully"));

})

// Updating Avatars and cover images
//we need to take care of two middlewares multer, loggedin users only

const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath=req.file?.path
  if(!avatarLocalPath)
  {
    throw new apiError(400,"Avatar file is missing");
  }
 const avatar= await uploadOnCloudinary(avatarLocalPath);
 if(!avatar)
 {
  throw new apiError(400,"Error while uploading avatar");
 }

 const User=await user.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
      avatar:avatar.url
    }
  },
  {new:true}
 ).select("-password")

 return res.
 status(200)
 .json(new apiResponce(
  200,
  User,
  "Avatar updated successfully"
 ))

})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath=req.file?.path
  if(!coverImageLocalPath)
  {
    throw new apiError(400,"Cover Image is missing");
  }
 const coverImage= await uploadOnCloudinary(coverImageLocalPath);
 if(!coverImage)
 {
  throw new apiError(400,"Error while uploading Cover Image");
 }

 const User=await user.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
      coverImage:coverImage.url
    }
  },
  {new:true}
 ).select("-password")

 return res.
 status(200)
 .json(new apiResponce(
  200,
  User,
  "Cover Image updated successfully"
 ))

})

const getUserChannelProfile= asyncHandler(async(req,res)=>{
   const {username}=req.params
   if(! username?.trim())
   {
    throw new apiError(400,"Username is missing");
   }
   //at this line we should have username 
   // first way : user.find({username})
   //second and optimized way
   const channel = await user.aggregate([{
    $match:{
      username: username?.toLowerCase()
    }
   },
   {
    $lookup:{ //remember: in DB all fields gets saved in plural form and in lowercase example: Subscription --> "subscriptions"
      from: "subscriptions",   //plural and lowercase
      localField:"_id",
      foreignField:"channel",
      as:"subscribers"
    }
   },
  {
    $lookup:{
      from: "subscriptions",   //plural and lowercase
      localField:"_id",
      foreignField:"subscriber",
      as:"subscribedTo"
    }
  },
  {
    $addFields:{
    subscribersCount:{
      $size:"$subscribers"
    },
    channelsSubscribedToCount:{
      $size:"$subscribedTo"
    },
    isSubscribed:{
      $cond:{
        if:{ $in:[req.user?._id,"$subscribers.subscriber"]},
        then:true,
        else: false
      }
    }
    }
  },
  {
  //$project allows the db to share information which user wants to see not all information is shared
  // 1 is for allowing to share 
  $project:{  
    fullName: 1,
    username:1,
    subscribersCount:1,
    channelsSubscribedToCount:1,
    isSubscribed:1,
    avatar:1,
    coverImage:1,
    email:1

  }
  }])
  console.log(channel)
if(!channel?.length)
{
  throw new apiError(404,"Channel does not exists")
}
return res.status(200)
.json(
  new apiResponce(200,channel[0],"User channel fetched successfully")
);

})

const getWatchHistory=asyncHandler(async(req,res)=>{
  const User= await user.aggregate([
    {
      $match:{
         //in agregation we need to convert req.user._id which is string bydefault to proper acceptable format by mongoDB
         //out of this agregation where we have used object ids previously mongoose was converting that id from string to
         //format of mongoDB so we didnt notice it but here we need to convert it 
        _id : new mongoose.Types.ObjectId(req.user._id)   
  
      }
    },      // in above pipeline we have collected the videos watch history of current user now in next pipeline we will find 
            //information releted to each video such as owner of a video , his number of subscribers etc
    {
      $lookup:{
        from: "video",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from: "users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[{
                $project:{
                  fullName:1,
                  username:1,
                  avatar:1
                }}
              ]
            }
          },//here we have got all essential information such as owner details of each video of watch history
            // but want to do further segregation of data which make easy to work with for fronend developer
          {
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ]

      }
    }
  ])

  return res
  .status(200)
  .json(new apiResponce(200 ,User[0].watchHistory,"Watch History Fetched Successfully"))
})


export { 
  registerUser,
  loginUser, 
  logoutUser ,
  refreshAccessToken ,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory };

import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { user } from "../models/user.model.js";


export const verifyJWT=asyncHandler(async(req,res,next)=>{

  try {
    const token=  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
  
    if(!token){
      throw new apiError(401,"Unauthorized request")
    }
   const decodedToken =jwt.verify(token,ACCESS_TOKEN_SECRET)
   const foundUser =await user.findById(decodedToken?._id).select("-password -refreshToken");
   if(!foundUser){
      throw new apiError(401,"Invalid Access Token")
   }
  
   req.user=foundUser;
   next();

  } catch (error) {
    throw new apiError(401,error?.message||"Invalid access token")     
  }

})
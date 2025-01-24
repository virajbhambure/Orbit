import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { like } from "../models/like.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponce } from "../utils/apiResponce.js";
import jwt from "jsonwebtoken";
import mongoose ,{isValidObjectId}from "mongoose";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId))
    {
        throw new apiError(404,"Invalid videoId");
    }

    //check if like exist
    const isExist=await like.findOne(
        {
            video:videoId,
            likedBy:req.user._id
        }
    )

    if(isExist)
    {
        await like.deleteOne({ _id: isExist._id });
        return res
        .status(200)
        .json(new apiResponce(200,"unliked sucessfully"))

    }
    else
    {   
        await like.create(
            {
                video:videoId,
                likedBy:req.user._id
            }
        )
        return res
        .status(200)
        .json(new apiResponce(200,"Liked successfully") )
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId))
    {
        
    {
        throw new apiError(404, "Invalid comment Id");
    }}
    //check if exist 
    const existingLike= await like.findOne(
        {
            comment:commentId,
            likedBy:req.user._id
        }
    );
    if (existingLike) {
        await existingLike.deleteOne({_id:existingLike._id});
        res.status(200).json(apiResponce(200,"Comment unliked successfully"));
    } else {
        await like.create({
            comment: commentId,
            likedBy: req.user._id,
        });
        res.status(200).json(apiResponce(200,"Comment liked successfully"));
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId))
    {
        throw new apiError(404,"invalid tweetId");
    }
    const likeExist= await like.findOne(
        {
            tweet:tweetId,
            likedBy:req.user._id
        }
    )

    if(likeExist)
    {
        const status=await likeExist.deleteOne({_id:likeExist._id})
        if(!status)
        {
            throw new apiError(500,"Error in removing like from tweet");
        }
        return res
        .status(200)
        .json(new apiResponce(200,"Tweet like removed successfully"));
    }
    const status = await like.create(
        {
            tweet:tweetId,
            likedBy:req.user._id
        }
    )

    // if(!status)
    // {
    //     throw new apiError(500,"Error in creating like to the tweet")
    // }
    return res
    .status(200)
    .json(new apiResponce(200,"Like added succesfully"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    
    const userId= req.user._id;
    const likedVideos=await like.find(
        {
            likedBy:userId,
            video:{$exists:true}
        }
    ).populate('video');  //it will show only videos liked by user
    //   console.log("Liked Videos:",likedVideos)
    if(!likedVideos || likedVideos.length===0)
    {
        return res
        status(404)
        .json(new apiResponce(404,"No liked videos found"));
    }

    return res
        .status(200)
        .json(new apiResponce(200,"Liked videos fetched successfully", likedVideos));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
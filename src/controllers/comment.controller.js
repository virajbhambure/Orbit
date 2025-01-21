import mongoose from "mongoose"
import {comment} from "../models/comment.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponce} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if (!videoId) {
        throw new apiError(400,"No video Found with this id")
    }
    /*
    const findVideo = await comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        }
    ])
    */
    const comments = await comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"user",
                foreignField:"_id",
                localField:"owner",
                as:"createdBy",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                createdBy:{
                    $first:"$createdBy"
                }
            }
        },
        {
            $unwind:"$createdBy"
        },
        {
            $project:{
                content:1,
                createdBy:1
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
            $limit: parseInt(limit)
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comments,
            "comments Fetched"
        )
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}=req.params;
    const {content}=req.body;
    const userId=req.userId;

    if(!videoId)
    {
        throw new apiError(400,"Video Id is required");
    }
    if(!content || content.trim()==="")
    {
        throw new apiError(400,"Comment content is required");
    }
    //now verifying the video exist or not
    const video=await Video.findById(videoId);
    if(!video)
    {
        throw new apiError(404,"Video not found");
    }

    const newComment= await comment.create({
        content,
        video:videoId,
        owner:userId
    });

    res
    .status(200)
    .json(new apiResponce(201,"Comment added sussessfully",newComment));

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.body;
    const{content}=req.body;
    const userId=req.user.id;

    if(!commentId)
    {
        throw new apiError("Comment id is required");
    }
    if(!content || content.trim()==="")
    {
        throw new apiError(400,"updated comment content is required");
    }
    const existingComment=await comment.findById(commentId);
    if(!existingComment)
    {
        throw new apiError(400,"Comment not found");
    }

    existingComment.content=content;
    const updatedComment=await existingComment.save();
    res
    .status(200)
    .json(new apiResponce(200,"Comment updated successfully",updatedComment));
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const{commentId}=req.body;
    const userId=req.user.id;
    
    if(!commentId)
    {
        throw new apiError(400,"Comment id is required");
    }
    const existingComment=await comment.findById(commentId);

    if(!existingComment)
    {
        throw new apiError(404,"Comment not found");
    }
    if (existingComment.owner.toString() !== userId) {
        throw new apiError(404, "You are not authorized to delete this comment");
    }
   const commemtStatus= await comment.findByIdAndDelete(commentId);
   if(!commemtStatus)
   {
    throw new apiError(500,"Error while deleting comment from database");
   }
    res
    .status(200)
    .json(new apiResponce(200,"comment deleted successfully"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {user} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description,owner} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoFile=req.file?.path;
    if(!title || !description || !videoFile)
    {
        throw new apiError(400,"title or description or video is missing, all fields are required");
    }
     //at this point all information is available
     const uploadedVideo= await uploadOnCloudinary(videoFile,"videos");
     if(!uploadedVideo || !uploadedVideo.url)
     {
        throw new apiError(500,"Video upload failed");
     }
     const uploadedVideoThumbnail=await uploadOnCloudinary(videoFile,"thumbnails",{
        resource_type:"video",
        eager:[{format:"jpg",transformation:{width:300,crop:"scale"}}]
     })
     if(!uploadedVideoThumbnail || !uploadedVideoThumbnail.eager[0].url)
     {
        throw new apiError(500,"Thumbnail generation failed");
     }
     //now we have video and thumbnail url also
     const video= await video.create(
        {
            videoFile: uploadedVideo.url,
            thumbnail:uploadedVideoThumbnail.eager[0].url,
            title,
            description,
            duration:uploadedVideo.duration,
            owner
        }

     )

     res
    .status(200)
    .json(new apiResponse(200,"video published successfully",video));
 });

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
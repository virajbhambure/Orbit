import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { user } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const videos = await Video.aggregate([
    {
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: "$createdBy",
    },
    {
      $project: {
        thumbnail: 1,
        videoFile: 1,
        title: 1,
        description: 1,
        createdBy: {
          fullName: 1,
          username: 1,
          avatar: 1,
        },
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
    // Exclude videos uploaded by the current user
    {
      $match: {
        owner: { $ne: mongoose.Types.ObjectId(userId) },
      },
    },
  ]);

  return res.status(200).json(new apiResponce(200, { videos }, "All videos"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  console.log(req.body)
  const { title, description, owner } = req.body;
  // const ownerId = mongoose.Types.ObjectId.isValid(req.body.owner)
  // ? mongoose.Types.ObjectId(req.body.owner)
  // : null;
  console.log("1")

if (!owner) {
  return res.status(400).json({ error: 'Invalid owner ID' });
}
  console.log("owner: ",req.body);  
  // TODO: get video, upload to cloudinary, create video
  const { videoFile, thumbnail } = req.files;
  // console.log(videoFile[0].path, thumbnail[0].path);
  console.log(videoFile,thumbnail)
  if (!title || !description || !videoFile) {
    throw new apiError(
      400,
      "title or description or video is missing, all fields are required"
    );
  }
  //at this point all information is available
 // console.log("aa", thumbnail[0].path);
 console.log("B")

  const uploadedVideoThumbnail = await uploadOnCloudinary(thumbnail[0]?.path);
  // console.log("UplodedVideoThumbnail:",uploadedVideoThumbnail);
  if (!uploadedVideoThumbnail || !uploadedVideoThumbnail.url) {
    throw new apiError(500, "Thumbnail generation failed");
  }

  console.log("url:",uploadedVideoThumbnail.url);

  const uploadedVideo = await uploadOnCloudinary(videoFile[0]?.path);
  console.log("Video:",uploadedVideo);
  if (!uploadedVideo || !uploadedVideo.url) {
    throw new apiError(500, "Video upload failed");
  }
  // console.Console("Owner:",mongoose.Types.ObjectId(owner));
  //now we have video and thumbnail url also
  console.log("efnefnce",title,description,owner)
  const video = await Video.create({
    videoFile: uploadedVideo.url,
    thumbnail: uploadedVideoThumbnail.url,
    title,
    description,
    duration: uploadedVideo.duration,
    owner,
  });
  // console.log("Video:",video);

  res
    .status(200)
    .json(new apiResponce(200, "video published successfully", video));
});

//in getVideoById i need to provide video id in url 
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!mongoose.isValidObjectId(videoId)) {
    throw new apiError(400, "invalid video ID format");
  }
  const video = await Video.findById(videoId).populate("owner", "name email");

  if (!video) {
    throw new apiError(404, "Video not found");
  }

  res
    .status(200)
    .json(new apiResponce(200, "Video fetched successfully", video));
});
//in updateVideo i need to provide video id in url
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description, thumbnail } = req.body;

  if (!title && !description && !thumbnail) {
    throw new apiError(400, "Atleast one field is required");
  }

  //all field will be available at this point
  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found");
  }
  if (title) {
    video.title = title;
  }
  if (description) {
    video.description = description;
  }

  if (thumbnail) {
    const uploadThumbnail = await uploadOnCloudinary(thumbnail, "thumbnails", {
      resource_type: "image",
      eager: [{ format: "jpg", transformation: { width: 300, crop: "scale" } }],
    });

    if (!uploadThumbnail || !uploadThumbnail.eager[0].url) {
      throw new apiError(500, "Thumbnail upload failed");
    }
    video.thumbnail = uploadThumbnail.eager[0].url;
  }

  const updatedVideo = await video.save();
  res
    .status(200)
    .json(new apiResponce(200, "Video updated successfully", updatedVideo));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new apiError(404, "VideoId is missing");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError("Video not found");
  }
  try {
    // Example of Cloudinary URL:
    // https://res.cloudinary.com/demo/video/upload/v1618763257/sample_video.mp4
    // In this URL, 'sample_video' is the public ID and 'video/mp4' is the format.

    // Extract the public ID of the video from its Cloudinary URL
    const videoPublicId = video.videoFile.split("/").pop().split(".")[0];

    // Extract the public ID of the thumbnail from its Cloudinary URL
    const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];

    // Explanation:
    // 1. Split the URL by "/" to get the file name (e.g., "sample_video.mp4").
    // 2. Use .pop() to get the last element, which is the file name.
    // 3. Split the file name by "." and take the first part to get the public ID (e.g., "sample_video").
    const videoDeletedResult = await deleteFromCloudinary(videoPublicId);
    const thumbnailDeletedResult =
      await deleteFromCloudinary(thumbnailPublicId);

    if (!videoDeletedResult || !thumbnailDeletedResult) {
      throw new apiError(
        500,
        "Failed to delete video or thumbnail from Cloudinary"
      );
    }

    //  now delete the entry of video from database
    await Video.findByIdAndDelete(videoId);

    res.status(200).json(new apiResponce(200, "Video deleted successfully"));
  } catch (error) {
    throw new apiError(
      500,
      "Error in deleting video or thumbnail from cloudinary",
      error.message
    );
  }
});

//togglePublishStatus need videoId to be provided in url
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  console.log(videoId);
  if (!videoId) {
    throw new apiError(404, "Video Id is missing");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new apiError(400, "Invalid Video ID format");
  }
  const video = await Video.findById(videoId);
  console.log(video);
  if (!video) {
    throw new apiError(404, "Video not found");
  }

  //Toggle the publish status (if true, set to false; if false, set to true)
  video.isPublished = !video.isPublished;
  const updatedVideo = await video.save();
  res
    .status(200)
    .json(
      new apiResponce(
        200,
        "Video published status toggled successfully",
        updatedVideo
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

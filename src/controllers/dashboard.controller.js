
import mongoose,{isValidObjectId} from "mongoose"
import {like}from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {subscription} from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponce} from "../utils/apiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params;
    if(!isValidObjectId(channelId))

        {
            throw new apiError(400,"Invalid channel Id");
        }
    
        const totalLikes = await Video.aggregate([
            { $match: { channelId} },  // { $match: { channelId: mongoose.Types.ObjectId(channelId) } },
            { $group: { _id: null, totalLikes: { $sum: "$likes" } } }
        ]);

        const totalViews = await Video.aggregate([
            { $match: { channelId } },  // { $match: { channelId: mongoose.Types.ObjectId(channelId) } },
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]);
        // Step 1: Filter videos for the specific channelId
        // $match filters the documents (videos) where channelId matches the given channelId.
        // Example: If the channelId is 'channel123', it will only fetch videos uploaded by 'channel123'.

        // Step 2: Group all matched videos and calculate total views
        // $group combines all the filtered videos into one group (_id: null means a single group) 
        // and calculates the sum of the "views" field using $sum.
        // Example: If the views of videos are [100, 200, 150], the totalViews will be 450.
    
    const totalSubscribers= await subscription.countDocuments({channelId});
    const totalVideos= await Video.countDocuments({owner:channelId});

    res.status(200).json(

       new apiResponce(200, "Channel stats fetched successfully", {
            totalVideos,
            totalLikes: totalLikes.length > 0 ? totalLikes[0].totalLikes : 0,
            totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0,
            totalSubscribers
        })
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const{channelId}=req.params;

    // console.log("ChannelID: ",channelId);
    if(!isValidObjectId(channelId))
    {
        throw new apiError(400,"Invalid channelId");
    }
    const videos = await Video.find({ owner: channelId });
    if (videos.length === 0) {
        return res
        .status(404)
        .json(new apiResponce(404, "No videos found for this channel"));
    }

    res
    .status(200)
    .json(new apiResponce(200, "Videos fetched successfully", videos));
})

export {
    getChannelStats, 
    getChannelVideos
    }
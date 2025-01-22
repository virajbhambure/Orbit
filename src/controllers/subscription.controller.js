import mongoose, {isValidObjectId} from "mongoose"
import {user} from "../models/user.model.js"
import { subscription } from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponce} from "../utils/apiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!channelId || !isValidObjectId(channelId)){
        throw new apiError(400,"Provide channel id")
    }

    const channelExist = await user.findById(channelId)

    if(!channelExist){
        throw new apiError(404,"provided id does not exist")
    }

    const isExist = await subscription.findOne({subscriber:req.user._id,channel:channelId})

    if(!isExist){
       try {
         await subscription.create({
             subscriber:req.user._id,
             channel:channelId
         })

         return res
         .status(200)
         .json(new apiResponce(200,"subscribed",{isSubscribed:true}))
       } catch (error) {
        throw new apiError(500,"something went wrong when adding your subscription")
       }
    }else{
        try {
            await subscription.findByIdAndDelete(isExist._id)

            return res
            .status(200)
            .json(new apiResponce(200,"subscription removed",{isSubscribed:false}))
        } catch (error) {
            throw new apiError(500,"something went wrong when removing your subscription")
        }
    }
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    console.log(req.params)
    const {channelId} = req.params

    if(!isValidObjectId(channelId))
    {
        throw new apiError(404,"invalid channel ID");
    }

    const subscribers= await subscription
    .find({channel:channelId})
    .populate("subscriber","name email")
    .exec();

    if(!subscribers || subscribers.length===0)
    {
        res.status(200).json({
            success: true,
            message: "No subscribers found for this channel",
            data:{}
          });
    }

    res.status(200).json({
        success: true,
        message: "Subscribers fetched successfully",
        data: { subscribers }
      });


})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    console.log(req.params);
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new apiError(404, "Invalid subscriberId");
    }

    const subscriptions = await subscription
        .find({ subscriber: subscriberId })
        .populate("channel", "name description") 
        .exec();

    if (!subscriptions || subscriptions.length === 0) {
        // throw new apiError(404, "No subscribed channels found for this user");
        return res
        .status(200)
        .json(new apiResponce(200, "No subscribed channels found for this user"));
    }
    const subscribedChannels = subscriptions.map(sub => sub.channel);

    return res
        .status(200)
        .json(new apiResponce(200, "Successfully fetched subscribed channels", { subscribedChannels }));
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
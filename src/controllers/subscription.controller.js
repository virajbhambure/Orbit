import mongoose, {isValidObjectId} from "mongoose"
import {user} from "../models/user.model.js"
import { subscription } from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { userId } = req.user;  

    
    if (!isValidObjectId(channelId) || !isValidObjectId(userId)) {
        throw new apiError(404, "Invalid userId or channelId");
    }

    
    if (userId === channelId) {
        throw new apiError(400, "You cannot subscribe to your own channel");
    }

    
    const existingSubscription = await subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });

    if (existingSubscription) {
        // If already subscribed, unsubscribe the user by deleting the subscription
        const status = await subscription.findByIdAndDelete(existingSubscription._id);
        if (!status) {
            throw new apiError(500, "Error while unsubscribing from the channel");
        }
        // return apiResponce( 200, {isSubscribed:false}, "Successfully unsubscribed from the channel");
        return res
        .status(200)
        .json(new apiResponce(200,"Successfully unsubscribed from the channel",{isSubscribed:false}))
    } else {
        // If not subscribed, create a new subscription
        const newSubscription = new subscription({
            subscriber: userId,
            channel: channelId,
        });
        await newSubscription.save();
        return res
        .status(200)
        .json(new apiResponce(200,"Successfully subscribed to the channel",{isSubscribed:true}))
    }
});

// controller to return subscriber list of a channel
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
        throw new apiError(404, "No subscribed channels found for this user");
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
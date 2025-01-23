import mongoose,{isValidObjectId} from "mongoose"
import {tweet} from "../models/tweet.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponce} from "../utils/apiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"



const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const userId=req.user._id;
    const {content}=req.body;
    if(!isValidObjectId(userId))
    {
        throw new apiError(404,"invalid userId");
    }
    if(!content || content.trim()==="")
    {
        throw new apiError(404,"Content is required");
    }

    const newTweet=await tweet.create(
        {
            content:content.trim(),
            owner:userId
        }
    );
    return res
    .status(200)
    .json(new apiResponce(200,"Tweet created successfully",{ tweet:newTweet})) 
    


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user._id;
    if(!isValidObjectId(userId))
    {
        throw new apiError(400,"Invalid userId");
    }
    const userTweets = await tweet.find({ owner: userId }).sort({ createdAt: -1 });  //letest first
    if (!userTweets || userTweets.length === 0) {
        throw new apiError(404, "No tweets found for this user");
    }

    return res
    .status(200)
    .json(new apiResponce(200,"Tweets fetched successfully",{tweets:userTweets}));


})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
  const userId= req.user._id;
  const {tweetId}=req.params;
  const {content}=req.body;
  if(!isValidObjectId(tweetId))
  {
    throw new apiError(400,"Invalid tweetId");
  }
  if (!content || content.trim() === "") {
    throw new apiError(400, "Content is required");
  }

  const existingTweet = await tweet.findOne({ _id: tweetId, owner: userId });
    if (!existingTweet) {
        throw new apiError(404, "Tweet not found ");
    }
    existingTweet.content = content.trim();
    await existingTweet.save();

    return res
    .status(200)
    .json( new apiResponce(200,"Tweet updated successfully",{tweet:existingTweet}));


})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const userId=req.user._id;
    const {tweetId}=req.params;

    if(!isValidObjectId(tweetId))
    {
        throw new apiError(400,"Invalid tweet id");
    }
    const existingTweet=tweet.findOne({_id:tweetId,owner:userId});
    if (!existingTweet) {
        throw new apiError(404, "Tweet not found");
    }

    await tweet.deleteOne(existingTweet);
    return res
    .status(200)
    .json(new apiResponce(200,"Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
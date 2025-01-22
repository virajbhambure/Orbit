import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels} from "../controllers/subscription.controller.js"

    import { verifyJWT } from "../middlewares/auth.middleware.js";
    const router=Router();
    router.route("/toggle-subscription").post(verifyJWT,toggleSubscription);
    router.route("/subscribers/:channelId").get(verifyJWT, getUserChannelSubscribers);
    router.route("/subscribed-channels/:subscriberId").get(verifyJWT,getSubscribedChannels);
    export default router;
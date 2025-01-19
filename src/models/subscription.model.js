
import mongoose ,{Schema}from "mongoose"

const subscriptionSchema=new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,  //one who is subscribing
        ref:"user"
    },
    channel:{
        type:Schema.Types.ObjectId,  //user who is owner of a channer
        ref:"user"
    }

},{timestamps:true})

export const subscription= mongoose.model("subcription",subscriptionSchema);
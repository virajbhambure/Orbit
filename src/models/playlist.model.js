import { SchemaTypes } from "mongoose"
import mongoose,{Schema} from mongoose

const playlistSchema=new Schema({
    name:{
        type:String,
        type:required
    },
   discription:{
        type:String,
        type:required
    },
    videos:[
        { 
            type:Schema.Types.ObjectId,
            ref:"video"
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user"
    }

},{timestamps:true})
export const playlist=mongoose.model("playlist",playlistSchema)
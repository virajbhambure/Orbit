import mongoose,{Schema} from "mongoose"
// import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema=new Schema(
    {
        content:{
            type:String,
            required:true,

        },
      video:  {
        type:Schema.Types.ObjectId,
        ref:"Video",

        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"user"
        }
        

    },
    {
        timestamps:true
    }
)//"mongooseAggregatePaginate" plugin Breaks down large datasets: The plugin breaks down large datasets into smaller, more manageable chunks
commentSchema.plugin(mongooseAggregatePaginate)  // this plugin is used for generating sections of comments to show page by page
export const comment=mongoose.model("comment",commentSchema);
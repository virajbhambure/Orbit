import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB=async()=>{
 console.log(process.env.DB_URL)
    try {
       const connectionInstance= await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`);
       console.log(`MongoDB Connected!!! DB HOST: ${connectionInstance.connection.host}` )
        
    } catch (error) {
        console.log("Error: ",error);
        process.exit(1);  // revise on internet
    }
}

export default connectDB;
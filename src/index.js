// require('dotenv').config()   //this is right but it hampered the concistancy of code
import dotenv from "dotenv"
import {app} from "./app.js"

import connectDB from "./db/index.js";

dotenv.config()

connectDB()
.then(()=>{   
    app.listen(process.env.PORT||8000),()=>{
    console.log(`server is running at ${process.env.PORT}`);
}})
.catch((err)=>{console.log("MongoDB connect failed!!,Error: ",err)})




/*  // shortcut approch to connect to MongoDB but not preffered by proffessionals
import express from "express"

const app=express();

(async ()=>{
    try {
       await mongoose.connect(`${process.env.DB_URL}`/${DB_NAME});
       app.on("Error",(error)=>{
        console.log("Error: ",error)
       })
       
       app.listen(process.env.PORT,()=>{
        `App is listening on port ${process.env.PORT}`
       })
    } catch (error) {
        console.log("Error: ",error);
    }
})()

*/

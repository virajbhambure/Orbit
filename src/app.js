import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'


const app= express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
//when data will come from differnt sources such as in form of json,from urls, in form of pictures etc for that 
//we use middlewares and middlewares are use as "app.use()"  like this
app.use(express.json({limit:"16kb"}))
app,use(express.urlencoded({extended:true , limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
export { app }
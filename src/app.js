import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
//when data will come from differnt sources such as in form of json,from urls, in form of pictures etc for that
//we use middlewares and middlewares are use as "app.use()"  like this
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//Routes importing
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"
//routes decleration

app.use("/api/v1/users", userRouter);
//we have saperated routes so for using it we neet to use middlewares so we used app.use()

app.use("/api/v1/videos", videoRouter)
// http://localhost:8000/api/v1/users/register
export { app };

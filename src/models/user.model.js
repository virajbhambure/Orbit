import mongoose,{Schema} from "mongoose";
import jwt from 'jsonwebtoken';  //jwt
import bcrypt from "bcrypt";


const userSchema=new Schema({
    username:{
        type:String,
        required: true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true  //it is used for searching in db
    },
    email:{
        type:String,
        required: true,
        unique:true,
        lowercase:true,
        trim:true,
       
    },
    fullName:{
        type:String,
        required: true,
        lowercase:true,
        trim:true,
        index:true  //it is used for searching in db
    },
    avatar:{
        type:String,  //cloudinary url
        required:true
    },
    coverImage:{
        type:String,  //cloudinary url
        
    },
    watchHistory:[{
        type: Schema.Types.ObjectId,
        ref:"Video"
    }],
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String
    }
},{timestamps:true});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next()

   /* {
        this.password= await bcrypt.hash(this.password,10)  //10 is number of rounds of encryption
        next();

    }
    else{
        return next();
    } */
})

userSchema.methods.isPasswordCorrect= async function(password)
{
  return await bcrypt.compare(password,this.password)   //check the password given by user and encrypted passwords
}

userSchema.methods.generateAccessToken=function(){
   return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },
     process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id:this._id,
       
    },
     process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const user=mongoose.model("user",userSchema);
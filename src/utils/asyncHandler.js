const asyncHandler=(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}   //this is one way
export {asyncHandler}

// const asyncHandler=()=>{}
// const asyncHandler=(func)=>{()=>{}}
// const asyncHandler=(func)=>{async()=>{}}   //this is explanation of following function

// const asyncHandler = (func)=>async(req,res,next)=>{
//     try {
//         await func(req,res,next)
        
//     } catch (error) {
//         res.status(error.code||500).json({
//             success: false,
//             massage:error.massage   
//         });
//     }
// }
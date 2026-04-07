const AppError = require("../utils/AppError.js")

const errorMiddlware = (err, req, res, next) => {
    console.log("Error: ", err);
    if(err instanceof AppError){
      return res.status(err.statusCode).json({message:err.message})
    }
    if(err.name==="ValidationError"){
      return res.status(400).json({message:err.message})
    }
    if(err.code === 11000){
      const faild = Object.keys(err.keyPattern)[0]
      return res.status(400).json({message:`duplicate value ${faild}`})
    }
    if(err.name === "CastError"){
      return res.status(400).json({message:"invalid id format"})
    }
    if(err.name === "TokenExpiredError"){
      return res.status(401).json({message:"invalid token"})
    }
    if(err.name === "JsonWebTokenError"){
      return res.status(401).json({message:"invalid token"})
    }
    res.status(500).json({ message: "Interal server error"});
  }

module.exports = errorMiddlware
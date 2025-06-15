import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required :true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    Name:{
        type:String,
        required:true,
    },
    Gender:{
        type:String,
        required:true,
    },
    Address:{
        type:String,
        required:true,
    },
    DOB:{
        type:Date,
        required:true,
    },
    City:{
        type:String,
        required:true,
    },
    State:{
        type:String,
        required:true,
    },
    Contact :{
        type:Number,
        required:true,
    },
    role:{
        type:String,
        enum:["admin","Manager-Admin","user"],
        default:"user",
    },
   
    },

    
{
    timestamps:true
})

const User = mongoose.model("User",UserSchema);
export default User;

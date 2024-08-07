const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const User=require("../models/user.js");

const dpSchema=new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    bio:{
        type:String,
    },
    profilePicture:{
        url:String,
    },
    story:{
        url:String,
    }, 
    followers: [String],
    following: [String],
    requested: [String],
});
// followers:{
//     type:Number,
//     default: 0,
// },
// following:{
//     type:Number,
//     default: 0,
// }, 
// strings: [String],
// trk: [{lat:Number, lng:Number}]
const DpListing=mongoose.model("DpListing",dpSchema);
module.exports=DpListing;
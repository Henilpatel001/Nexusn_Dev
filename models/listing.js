const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const User=require("../models/user.js");

const listingSchema=new Schema({
   owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    description:{
        type:String,
        required: true,
    },
    img:{
        url:String,
        filename:String,
        likes: [String],
        comments: [{
            _id: false,
            username: {
              type: String,
              required: true
            },
            text: {
              type: String,
              required: true
            },
            createdAt: {
              type: Date,
              default: Date.now
            },
          }]
    },
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;
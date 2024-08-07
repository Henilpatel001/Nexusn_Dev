const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const chatSchema=new Schema(
    {
        members:Array,
    },
    {
        timestamps:true,
    }
);

const chatListing=mongoose.model("chatListing",chatSchema);
module.exports=chatListing;
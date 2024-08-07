const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Joi = require('joi');

const eventListingSchema=new Schema({
    eventName:{
        type:String,
        required: true,
    },
    location:{
        type:String,
        required: true,
    },
    description:{
        type:String,
        required: true,
    },
    img:{
        url:String,
        filename:String,
    },
    geometry:{
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      }
});

const eventListing=mongoose.model("eventListing",eventListingSchema);
module.exports=eventListing;
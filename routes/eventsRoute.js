const express = require("express");
const router = express.Router({mergeParams:true});
const {listingSchema}=require("../models/Reqschema.js");//to use server side validation
const ExpressError=require("../utills/ExpressError.js");//to throw error
const wrapAsync=require("../utills/wrapAsync.js");//to handle error
const Listing=require("../models/listing.js");
const eventListing=require("../models/eventListing.js");
const multer  = require('multer');//use for take input as image and store to our file then render  it
// const storage = multer.diskStorage({//use for take image name which is store in our file
//     destination: function (req, file, cb) {
//         return cb(null, './public/uploads/')
//     },
//     filename: function (req, file, cb) {
//         return cb(null, `${Date.now()}-${file.originalname}`);
//     }
// })
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage: storage })//to upload file 
const fs = require('fs');//to remove uploading file
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


// show Events listing
router.get("/", wrapAsync(async(req, res,next) => {
    const allListings=await eventListing.find({});
    res.render("./listings/events.ejs",{allListings});
}));

router.get("/:id", wrapAsync(async(req, res,next) => {
    let {id}=req.params;
    let eveView=await eventListing.findById(id);
    res.render("./listings/eventView",{eveView});
}));

// post Events
router.post("/",upload.single('eventListing[img]'), wrapAsync(async(req, res,next) => {
    let respose=await geocodingClient
        .forwardGeocode({
            query:req.body.eventListing.location,
            limit:1,
        })
        .send()

    const url=req.file.path;
    const filename=req.file.filename;
    const newListing=new eventListing({
        eventName:req.body.eventListing.eventName,
        location:req.body.eventListing.location,
        description:req.body.eventListing.description,
        img:{url,filename},
        geometry:respose.body.features[0].geometry,
    });
    await newListing.save();
    req.flash("success","New Event Created");
    res.redirect("/events");
}));

 //event edit
 router.get("/:id/edit", wrapAsync(async(req, res,next) => {
   let {id}=req.params;
   let chat=await eventListing.findById(id);

   let oriImg=chat.img.url;
   oriImg=oriImg.replace("/upload","/upload/w_200");
   res.render("./listings/eventEdit.ejs",{chat,oriImg});
}));


//event update
router.put("/:id",upload.single('img'), wrapAsync(async(req, res,next) => {
    let {id}=req.params;
    let {eventName}=req.body;
    let {location}=req.body;
    let {description}=req.body;
    let eveLis=await eventListing.findByIdAndUpdate(id,{eventName:eventName,location:location,description:description});

    if (typeof req.file !=="undefined") {   
        const url=req.file.path;
        const filename=req.file.filename;
        eveLis.img={url,filename};
        await eveLis.save();
    }
    req.flash("success","Post updated");
   res.redirect("/events");
}));

//event delete
router.delete("/:id", wrapAsync(async(req, res,next) => {
    let { id } = req.params;
    let chat=await eventListing.findById(id);
    // const filepath = "../Expressdir/public/uploads/"+chat.img;
    // fs.unlink(filepath, (err) => {
    //     if (err) {
    //         console.error(err)
    //         return
    //     }
    //     //file removed
    // })
    await eventListing.findByIdAndDelete(id);
    req.flash("success","Post Deleted");
    res.redirect("/events");
}));


module.exports=router;



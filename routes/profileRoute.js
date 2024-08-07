const express = require("express");
const router = express.Router({mergeParams:true});
const {listingSchema}=require("../models/Reqschema.js");//to use server side validation
const ExpressError=require("../utills/ExpressError.js");//to throw error
const wrapAsync=require("../utills/wrapAsync.js");//to handle error
const Listing=require("../models/listing.js");

const User=require("../models/user.js");
const multer  = require('multer');//use for take input as image and store to our file then render  it
const fs = require('fs');//to remove uploading file
const { isOwner, validateListing } = require("../middleware.js");
const DpListing = require("../models/DpListing.js");
const { request } = require("http");
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
  


// show listing
router.get("/", wrapAsync(async(req, res) => {
    let {username}=req.params;
    let owner=await User.find({username});
    let listings=await Listing.find({owner:owner}).populate("owner");
    let profileInfo=await DpListing.findOne({owner});
    
    let self=req.user.username;
    let selfOwner=await User.find({username:self});
    let selfInfo=await DpListing.findOne({owner:selfOwner});
    res.render("./listings/profile.ejs",{listings,owner,profileInfo,selfInfo});
 }));

// update followers count 
 router.post('/follow', async(req, res) => {
    let {username} = req.body;
    let owner1=await User.find({username});
    let DpList=await DpListing.findOne({owner:owner1});
    DpList.followers.push(req.user.username);
    
    let owner2=await User.find({username:req.user.username});
    let myself=await DpListing.findOne({owner:owner2});
    myself.following.push(username);

    
    await DpList.save();
    await myself.save();
    
    await DpListing.updateOne({owner:owner2},{ $pull: { requested: username }});
    // res.json({ username });
});
router.delete('/unfollow', async(req, res) => {
    let {username} = req.body;
    let owner1=await User.find({username});
    await DpListing.updateOne({owner:owner1},{$pull:{ followers: req.user.username }});
    
    let owner2=await User.find({username:req.user.username});
    await DpListing.updateOne({owner:owner2},{$pull:{ following: username }});
    
});

// this is deleted of self remove followers
router.delete('/unfollow/myself', async(req, res) => {
    let {username} = req.body;
    let owner1=await User.find({username});
    await DpListing.updateOne({owner:owner1},{$pull:{ following: req.user.username }});
    
    let owner2=await User.find({username:req.user.username});
    await DpListing.updateOne({owner:owner2},{$pull:{ followers: username }});
    
});

// Endpoint to check follow status
router.get('/followsCheck', async (req, res) => {
    const { username } = req.params;
    try {
      let owner=await User.find({username});
      const user = await DpListing.findOne({ owner });
      res.json(user || { followers: [] });
    } catch (error) {
      res.status(500).send('Error retrieving data');
    }
  });

  
router.get('/requestCheck', async (req, res) => {

    let owner = await User.find({ username: req.user.username });
    let myself = await DpListing.findOne({ owner });
    res.json( myself || { requested: []  });
});
router.post('/requested', async (req, res) => {
    let { username } = req.body;

    let owner = await User.find({ username: req.user.username });
    let myself = await DpListing.findOne({ owner });
    myself.requested.push(username);

    await myself.save();

    res.json({ myself });
});
router.delete('/requestedDelete', async (req, res) => {
    let {username}=req.body;
    let owner = await User.find({ username: req.user.username });
    await DpListing.updateOne({owner},{ $pull: { requested: username }});
    // res.json({ username });
});
router.get('/requestCheck', async (req, res) => {
      let owner=await User.find({username:req.user.username});
      const user = await DpListing.findOne({ owner });
      res.json(user);
});


router.post('/comment', async (req, res) => {
    let username = req.user.username;
    let { commentText, listId } = req.body;
    const newComment = {
        username,
        text: commentText,
        createdAt: new Date() 
    };

    let j=await Listing.findByIdAndUpdate(
        listId,
        { $push: { 'img.comments': newComment } }
    );
});
router.get('/comment/:listId', async (req, res) => {
    let {listId}=req.params;
    const comment = await Listing.findOne({_id: listId });
    res.json(comment);
});


 // show post
 router.get("/:id", wrapAsync(async(req, res) => {
    let {id}=req.params;
    let listing=await Listing.findById(id).populate("owner");
    let profileInfo=await DpListing.findOne({owner:listing.owner._id});
    res.render("./listings/showPost.ejs",{listing,profileInfo});
 }));

 // edit
 router.get("/:id/edit", wrapAsync(async(req, res) => {
    let {id}=req.params;
    let chat=await Listing.findById(id).populate("owner");
    if(!chat){throw new ExpressError(401,"somthing went wrong");}
    res.render("./listings/edit.ejs",{chat});
 }));
 
 // update
 router.put("/:id",validateListing,isOwner, wrapAsync(async(req, res) => {
    let {id}=req.params; 
    let {listing}=req.body;
    await Listing.findByIdAndUpdate(id,{description:listing.description});
    req.flash("success","Post updated");
     res.redirect("/");
 }));
 
 // delete
 router.delete("/:id", wrapAsync(async(req, res) => {
     let { id } = req.params;
    //  const filepath = "../Expressdir/public/uploads/"+chat.img;
    //  fs.unlink(filepath, (err) => {
    //      if (err) {
    //          console.error(err)
    //          return
    //      }
    //      //file removed
    //  })
     await Listing.findByIdAndDelete(id);
     req.flash("success","Post Deleted");
     res.redirect("/");
 }));
     
 // post 
 router.post("/",upload.single('listing[img]'), wrapAsync(async(req, res) => {
    const url=req.file.path;
    const filename=req.file.filename;
     const newListing=new Listing({
         description:req.body.listing.description,
         img:{url,filename},
     });
     newListing.owner=req.user._id;
     await newListing.save();
     req.flash("success","New Post Created");
     res.redirect("/");
 }),validateListing);
 

 module.exports=router;

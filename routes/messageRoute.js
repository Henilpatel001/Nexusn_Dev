const express = require("express");
const router = express.Router({mergeParams:true});
const User=require("../models/user.js");
const chatListing=require("../models/chatListing");
const messageListing=require("../models/messageListing");

router.get("/",async(req, res) => {
    const users=await User.find({});
    res.render("./listings/message.ejs",{users});
});

// createChat
router.post("/",async(req,res)=>{
    const {Id:secondId}=req.body;
    const firstId=req.user.id;
    const chat=await chatListing.findOne({
        members:{$all:[firstId,secondId]}
    })
    if(chat) return res.json(chat);

    const newChat=new chatListing({
        members:[firstId,secondId],
    })
    const response=await newChat.save();
    res.json(response);
});


// findUserChats
router.get("/:userId",async(req,res)=>{
    const userId=req.params.userId;
    const chat=await chatListing.find({
        members:{$in:[userId]}
    })
    res.json(chat);
});


// findChat
router.get("/find/firstId/:secondId",async(req,res)=>{
    const {secondId}=req.params;
    const firstId=req.user.id;
    const chat=await chatListing.findOne({
        members:{$all:[firstId,secondId]},
    })
    res.json(chat);
});

// create message
router.post('/chat',async(req,res)=>{
    const {chatId,text}=req.body;
    senderId=req.user.id;
    const message=new messageListing({
        chatId,senderId,text
    })
    const response=await message.save();
    res.json(response);
});

// get message
router.get('/chat/:chatId',async(req,res)=>{
    const {chatId}=req.params;
    const message=await messageListing.find({chatId});
    res.json(message);
});


module.exports=router;


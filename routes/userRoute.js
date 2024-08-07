const express = require("express");
const router = express.Router();
const User=require("../models/user.js");
const wrapAsync=require("../utills/wrapAsync.js");//to handle error
const passport=require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const DpListing = require("../models/DpListing.js");


router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
})

router.post("/signup",wrapAsync(async( req, res)=>{
    let {username, email, password}= req.body;
    const newUser=new User({email,username});
    const registereUser=await User.register(newUser,password);
    const newDpListing=new DpListing({
        owner:registereUser._id
    });
    await newDpListing.save();

    req.login(registereUser,(err)=>{
        if (err) {
            return next(err);
        }
        req.flash("success","Welcome to Nexusn");
        res.redirect("/");
    });
}));

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

router.post("/login",saveRedirectUrl,
passport.authenticate("local", { failureRedirect: '/login',failureFlash:true }),  
    async( req, res)=>{
        req.flash("success","Welcome back to Nexusn");
        
        // let redirectUrl=res.locals.redirectUrl || "/";
        res.redirect("/");
});

router.get("/logout",( req, res,next)=>{
    req.logout((err)=>{
        if (err) {
           return next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/");
    });
});


module.exports=router;


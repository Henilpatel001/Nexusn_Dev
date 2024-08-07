const Listing = require("./models/listing");
const {listingSchema}=require("./models/Reqschema.js");//to use server side validation

module.exports.isLoggedIn=(req,res,next)=>{//to check users is login or not
    if (!req.isAuthenticated()) {
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create listings");
        return res.redirect("/login");  
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{//store sperately because of passport has no authenticare to access locals locals store data longerly,session not store data longer
    if (req.session.redirectUrl) {
        res.locals.redirectUrl=req.session.redirectUrl; 
    }
    next();
}

module.exports.isOwner=async(req,res,next)=>{//store sperately because of passport has no authenticare to access locals locals store data longerly,session not store data longer
   let {id}=req.params;
   let listing=await Listing.findById(id);
   if(!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error","you don't have permission");
        return res.redirect("/");
   }
    next();
}

module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if (error) {
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}
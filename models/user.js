const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");//to take more features when we used mongodb database\

const userSchema=new Schema({
    //passportLocalMongoose added automatically like username,hased and salted password
    email:{
        type:String,
        require:true
    }
})


userSchema.plugin(passportLocalMongoose);//this is added function like username,hased and salted password
module.exports=mongoose.model("User",userSchema);
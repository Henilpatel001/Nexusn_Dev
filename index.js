if (process.env.NODE_ENV!="production") {
    require("dotenv").config();
}

const express = require("express");
const axios = require("axios");//// for message chat
const cors = require("cors");//// for message chat
const app = express();
const methodOverride = require("method-override");//use for send reqesut patch/delete 
const Listing=require("./models/listing.js");
const DpListing = require("./models/DpListing.js");
const eventListing=require("./models/eventListing.js");
const mongoose=require("mongoose");
const path = require('path');
const ejsMate=require("ejs-mate");
const cookieParser=require("cookie-parser");

const ExpressError=require("./utills/ExpressError.js");//to throw error
const wrapAsync=require("./utills/wrapAsync.js");//to handle error

const session=require("express-session");
const MongoStore=require("connect-mongo");//MongoDB based session store
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const profileRoute=require("./routes/profileRoute.js");
const eventsRoute=require("./routes/eventsRoute.js");
const messageRoute=require("./routes/messageRoute.js");
const userRoute=require("./routes/userRoute.js");
const { isLoggedIn, saveRedirectUrl } = require("./middleware.js");
const multer  = require('multer');//use for take input as image and store to our file then render  it
// const storage = multer.diskStorage({//use for take image name which is store in our file
//     destination: function (req, file, cb) {
//         return cb(null, './public/uploads/')
//     },
//     filename: function (req, file, cb) {
//         return cb(null, `${Date.now()}-${file.originalname}`);
//     }
// })
const {storage}=require("./cloudConfig.js");
const upload = multer({ storage: storage })//to upload file



const MONGO_URL="mongodb://127.0.0.1:27017/nexusn";
const dbUrl=process.env.ATLASDB_URL;

async function main(){
    await mongoose.connect(dbUrl);
    // await mongoose.connect(MONGO_URL);
}

main()
.then(() => {
    console.log("connected to Data-Base");
}).catch((err) => {
    console.log(err);
});

app.set("view engine", "ejs"); //this is use when we set ejs file 
app.use(cors({ origin: true }));// for message chat
app.set("views",path.join(__dirname,"views")); 
app.use(express.urlencoded({ extended: true }));//that convert to parse data to readable format when we use post request
app.use(express.json());//post request when send json data then use
app.use(methodOverride("_method"));//using send patch reqesut insted of post/get reqeust
app.use(express.static(path.join(__dirname, "/public")));//using for showing public file
app.engine("ejs",ejsMate);//using for showing ejs file
app.use(cookieParser());//use of parse cookies
app.use(flash());//using for flash message and this flash message trigerrd one time 

const store=MongoStore.create({
    mongoUrl:MONGO_URL,
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600
});
store.on("error",()=>{
    console.log("error in MONGO SESSION STORE",err);
});
app.use(
    session({
        store,
        secret:process.env.SECRET,
        resave:false,
        saveUninitialized:true,
        cookie:{
            expires:Date.now()+7*24*60*60*1000,
            maxAge:7*24*60*60*1000,
            httpOnly:true,
        }
    })
);
app.use(passport.initialize());//that middleware that initialize passport
app.use(passport.session());//ability to identify users as the browse from page to page
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());//use to store data realted user
passport.deserializeUser(User.deserializeUser());//use to deserialize data realted user


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`app is listening on port`);
});


app.post("/authenticate", async (req, res) => {//for message chat
    const { username } = req.body;
    return res.json({ username: username, secret: "Nexusn123" });
  });

  
app.post("/authenticate", async (req, res) => {//for message chat
    const { username } = req.body;
    // Get or create user on Chat Engine!
    try {
      const r = await axios.put(
        "https://api.chatengine.io/users/",
        { username: username, secret: username, first_name: username },
        { headers: { "Private-Key": "9cbef24a-a65f-4f0b-88b6-3b6884376b79" } }
      );
      return res.status(r.status).json(r.data);
    } catch (e) {
      return res.status(e.response.status).json(e.response.data);
    }
  });


app.get("/",saveRedirectUrl, wrapAsync(async(req, res,next) => {
    const allListings=await Listing.find({}).populate("owner");
    const eveLists=await eventListing.find({});
    const DpLists=await DpListing.find({}).populate("owner");
    res.render("./listings/index.ejs",{allListings,eveLists,DpLists});
}));


app.get("/leaderboard",isLoggedIn, (req, res) => {
    res.render("./listings/leaderboard.ejs");
 });

app.get("/leaderboard/freefire",(req, res) => {
    res.render("./listings/freefire.ejs");
 });
 
 
app.get("/notification",isLoggedIn,(req, res) => {
     res.render("./listings/notification.ejs");
    });


// follower
app.get("/followers",isLoggedIn,async(req, res) => {
    const Users=await User.find({});
    const DpLists=await DpListing.find({});

    let self=req.user.username;
    let selfOwner=await User.find({username:self});
    let selfInfo=await DpListing.findOne({owner:selfOwner});
    res.render("./listings/followers.ejs",{Users,DpLists,selfInfo});
});


app.get("/accounts/edit",(req, res) => {
    res.render("./listings/editProfile.ejs");
});

 // update
 app.put("/accounts/edit/:id",upload.single('profilePicture'), wrapAsync(async(req, res) => {
    let {id}=req.params;
    let {profileBio}=req.body;
    let dpId = await DpListing.find({ owner: id });
     if (profileBio) {
         await DpListing.findByIdAndUpdate(dpId[0]._id, { bio: profileBio });
     }
     if (typeof req.file !== "undefined") {
         let url = req.file.path;
         await DpListing.findByIdAndUpdate(dpId[0]._id, { profilePicture: { url } });
     }
    req.flash("success","Profile updated");
    res.redirect("/");
 }));

 // update story
 app.put("/story/:id",upload.single('storyImg'), wrapAsync(async(req, res) => {
    let {id}=req.params;
    let url=req.file.path;
    let dpId=await DpListing.find({owner:id});
    await DpListing.findByIdAndUpdate(dpId[0]._id,{story:{url}});
    req.flash("success","story Created");
    res.redirect("/");
 }));

// story
app.get("/stories/:username",async(req, res) => {
    let {username}=req.params;
    let userId=await User.find({username:username});
    const DpLists=await DpListing.find({owner:userId}).populate("owner");
    res.render("./listings/story.ejs",{DpLists});
});

//check likes count 
app.get('/:imgId/likes', async(req, res) => {
   let {imgId}=req.params;
   let likes=await Listing.findOne({_id:imgId});
   res.json(likes || { likes: [] });
});
//update likes count 
app.post('/likes', async(req, res) => {
   let {id}=req.body;
   let a=await Listing.updateOne({_id:id},{ $push: { 'img.likes': req.user.username }});
});
app.delete('/unlikes', async(req, res) => {
   let {id}=req.body;
   await Listing.updateOne({_id:id},{ $pull: { 'img.likes': req.user.username }});
});

app.use("/message",messageRoute);
app.use("/events",eventsRoute);
app.use("/",userRoute);
app.use("/:username",isLoggedIn,profileRoute);




app.all("*",(req,res,next)=>{
    next(new ExpressError(401,"somthing went wrong"));
})

app.use((err,req,res,next)=>{//middleware
    let {status=500,message="Some error occured"}=err;
    // throw new ExpressError(401,"some error");
    // res.status(status).send(message);
    res.render("./listings/error.ejs",{err});
})



// const io = require('socket.io')({
//     cors:{
//         origin:'http://localhost:3000'
//     }
// });
// const users={};
// io.on('connection',(socket)=>{
//     console.log('A user connected');
//     // socket.on('user-joined',name=>{
//     //     users[socket.id]=name;
//     //     socket.broadcast.emit('user-joined',name);
//     // })
//     socket.on('register', (userId) => {
//         users[userId] = socket.id;
//         console.log(users);
//       });

//       socket.on('chat message', (data) => {
//         const { to, message } = data;
//         const targetSocketId = users[to];
//         if (targetSocketId) {
//           io.to(targetSocketId).emit('chat message', { from: socket.id, message });
//         }
//       });
//       socket.on('disconnect', () => {
//         console.log('A user disconnected');
//         for (const [userId, socketId] of Object.entries(users)) {
//           if (socketId === socket.id) {
//             delete users[userId];
//             break;
//           }
//         }
//       });

//     // socket.on('send',(message)=>{
//     //     socket.broadcast.emit('receive',{message:message,name:user[socket.id]});
//     // })
// })


// ////////////////////////////////////////////////////////////////////
// let posts = [
//     {
//         id: uuidv4(),
//         username: "ApnaCollege",
//         content: "i love coding"
//     },
//     {
//         id: uuidv4(),
//         username: "Henil patel",
//         content: "Hard work is important"
//     },
//     {
//         id: uuidv4(),
//         username: "Rahul patel",
//         content: "i gol selected for my 1st internship"
//     }
// ]


// app.post("/posts", (req, res) => {
//     let { username, content } = req.body;
//     let id = uuidv4();
//     posts.push({ id, username, content });
//     res.redirect("/posts");
// });

// app.get("/posts/:id", (req, res) => {
//     let { id } = req.params;
//     let post = posts.find((p) => id === p.id);
//     res.render("show.ejs", { post });
// });

// app.patch("/posts/:id", (req, res) => {
//     let { id } = req.params;
//     let newContent = req.body.content;
//     let post = posts.find((p) => id === p.id);
//     post.content = newContent;
//     res.redirect("/posts");
// });

// app.get("/posts/:id/edit", (req, res) => {
//     let { id } = req.params;
//     let post = posts.find((p) => id === p.id);
//     res.render("edit.ejs", { post });
// });

// app.delete("/posts/:id", (req, res) => {
//     let { id } = req.params;
//     posts = posts.filter((p) => id !== p.id);
//     res.redirect("/posts");
// });


// app.get("/ig/:username", (req, res) => {
//     let { username } = req.params;
//     const instaData = require("./data.json");
//     const data = instaData[username];
//     res.render("instagram.ejs", { data });
// });



// app.get("*", (req, res) => {
//     res.send("<h2>!Sorry this path does not exist</h2>");
// });



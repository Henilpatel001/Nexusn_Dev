module.exports=(fn)=>{// to handle error
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    };
};
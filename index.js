const express = require('express');
const usermodel = require('./models/user')
const postmodel = require('./models/post')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('./config/imagesconfig');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv').config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine", "ejs");

app.get("/",function(req,res){
    res.render("regsitration");
})
app.post("/singup", async function(req,res){
    let {name,email,password} = req.body;

    let user = await usermodel.findOne({email});
    if(user) return res.status(500).send("user already create");
    
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                let user = await usermodel.create({
                    name,
                    email,
                    password : hash
                });
                // let token = jwt.sign({id : user._id}, "shhhh");
                // console.log(token.id);
                // res.cookie("token",token);
                res.redirect("/login");
            }); 
        });
});

app.post("/singin", async function(req,res){
    let {email,password} = req.body;

    let user = await usermodel.findOne({email});
    // console.log(user);
    if(!user) return res.status(500).send("somethin went wrong");

    bcrypt.compare(password, user.password, function(err, result){
        if(result){
            let token = jwt.sign({id : user._id}, process.env.SECRET_KEY);
            res.cookie("token",token);
            res.redirect("/profile");
        }
        else{
            res.send("somethin went wrong");

        }
        // console.log(result);
    })
    
     
});
app.get("/profile",islogedin, async function(req,res){
    let user = await usermodel.findOne({email : req.user.email}).populate("posts");


    console.log(req.user.id);
    // res.render("profile",{user});
})
app.post("/createpost",islogedin ,async function(req,res){
    let user = await usermodel.findOne({email : req.user.email});

    let {content} = req.body;

    let post = await postmodel.create({
        user : user._id,
        content, 
    })

    user.posts.push(post._id);
    user.save();
    res.redirect("/profile");
    // console.log(req.user);
})
app.get("/like/:id",islogedin,async function(req,res){
    let post = await postmodel.findOne({_id : req.params.id}).populate("users");

    if(post.like.indexOf(req.user.id) === -1){

        post.like.push(req.user.id);
    }
    else{
        post.like.splice(post.like.indexOf(req.user.id),1);
    }
    // console.log(req.user.id);
    await post.save();
    res.redirect("/profile")

})

app.get("/profileimg",function(req,res){
    res.render("profileimg");
})

app.post("/upload",islogedin,upload.single("img"),async function(req,res){
    // console.log(req.file.filename);
    let user = await usermodel.findOne({email : req.user.email});
    user.profile = req.file.filename;
    await user.save();
    res.redirect("/profile");
})
app.get("/login",function(req,res){
    res.render("login");
})
app.get("/logout",function(req,res){
    res.cookie("token", "");
    res.redirect("/login");
})

function islogedin(req,res,next){
    if(req.cookies.token == ""){
        res.redirect("/login");
    }
    else{
        let data = jwt.verify(req.cookies.token,process.env.SECRET_KEY);
        req.user = data;
        next();
    }
}

app.listen(process.env.PORT || 3000);
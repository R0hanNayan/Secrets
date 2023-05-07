//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const app = express();
// const md5 = require('md5'); //MD5 Hashing 
// const encrypt = require('mongoose-encryption');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

//Initialize Session
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));

//Initialize Passport
app.use(passport.initialize());
app.use(passport.session());    //Initialize Passport to use Session

const connection = mongoose.createConnection(`mongodb+srv://rohannayan405:${process.env.MONGO_PASS}@cluster0.1qehh9x.mongodb.net/usersDB`);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//Mongoose-Encryption
// userSchema.plugin(encrypt, {secret: process.env.SECRET_KEY, encryptedFields: ['password']});

//Initialize Passport local
userSchema.plugin(passportLocalMongoose);
const User = connection.model("User", userSchema);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
});
app.get("/login", function(req, res){
    res.render("login");
});
app.get("/register", function(req, res){
    res.render("register");
});

app.get("/secrets", function(req, res){
    //If redirecting to /secrets, check if user is logged in
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout", function(req, res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/");
        }
    });
});

app.post("/register", function(req,res){

    //Hash using Bcrypt
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash
    //     });
    //     try{
    //         newUser.save();
    //         res.render("secrets");
    //     }catch(err){
    //         console.log(err);
    //     };
    // });

    //Authenticate User
    User.register({username: req.body.username}, req.body.password, function(err, result){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })
});

app.post("/login", function(req, res){
    // const username = req.body.username;
    // const password = req.body.password;

    // User.findOne({email:username}).then(user=>{
    //     //Compare Password while login
    //     bcrypt.compare(password, user.password, function(err, result){
    //         if(result===true){
    //             res.render("secrets");
    //         }
    //         else{
    //             res.send("Invalid Credentials");
    //         }
    //     })
        
    // });

    //Passport Login
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/secrets")
        }

    })

});

app.listen(3000, function(){
    console.log("Server started on port 3000");
})
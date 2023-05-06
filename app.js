//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const connection = mongoose.createConnection(`mongodb+srv://rohannayan405:${process.env.MONGO_PASS}@cluster0.1qehh9x.mongodb.net/usersDB`);

const app = express();

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//Mongoose-Encryption
// const secretKey = "This is a Secret";
userSchema.plugin(encrypt, {secret: process.env.SECRET_KEY, encryptedFields: ['password']});

const User = connection.model("User", userSchema);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", function(req, res){
    res.render("home");
});
app.get("/login", function(req, res){
    res.render("login");
});
app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req,res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })
    try{
        newUser.save();
        res.render("secrets");
    }catch(err){
        console.log(err);
    };
});

app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username}).then(user=>{
        if(user.password==password){
            res.render("secrets");
        }
        else{
            res.send("Invalid Credentials");
        }
    })
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
})
//imports
//server framework
const express = require('express');
//for handling req.body
const bodyparser = require('body-parser')
//helps with works with a directory 
const path = require('path')
//to create db object
const mongoose = require('mongoose');
//user object schema 
const Users = require('./models/Users')
//to hash password
const bcrypt = require('bcryptjs');
//embeded js templating
const ejs = require('ejs')
//for hidden .env file
require('dotenv').config()

//create the server
const app = express();
//tells express to use the body-parser
app.use(bodyparser.json())
//allows u to use path in views folder
app.use(express.static(path.join(__dirname, 'views')));

//connects to db
mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost:27017/4braincells',  { useNewUrlParser: true,useUnifiedTopology: true })

//tell the server to listen to request at this port
app.listen(process.env.PORT || 3000,()=>{
    console.log("Server is listening on port " + 3000)
})

//loads the login.ejs page
app.get("/login",(req,res)=>{
    res.render('login.ejs')
})

//loads the dashboard.ejs page
app.get("/dashboard",(req,res)=>{
    res.render('dashboard.ejs')
})

//loads the signup.ejs page
app.get("/signup",(req,res)=>{
    res.render('signup.ejs')
})

//user register
app.post("/signup", async(req,res) =>{
    //get the email, password, fname, lname from the post req
    email = req.body.email
    password = req.body.password
    fname = req.body.firstname
    lname = req.body.lastname
    try{
      //wait and check to see if user exist
      let exist = await Users.findOne({ email });

      //if the user exist send an error and stop running this req
      if(exist){
       return res.status(400).send("User Already Exist")
      }else{
        //hash the password
        hashedPassword = await bcrypt.hashSync(password,10)
        //create a new user object 
        const newUser = new Users();
        //add in the given fields
        newUser.email = email
        newUser.password = hashedPassword
        newUser.firstname = fname
        newUser.lastname = lname
        //wait for adding the user to the database and then return the user
        const user = await newUser.save();
        res.status(201).send(user)
      }
      
    }catch(err){
      console.log("trigger")
      res.send(err)
    }
  
})

//user Login
app.post("/login", async(req,res) =>{
    //email and password
    email = req.body.email
    password = req.body.password
    try{
      //get the user based on email
      let userToGet = await Users.find({email:email})
      //check to see if the given password matches with the hashed password
      let isUser = await bcrypt.compareSync(password,userToGet[0].password)
      
      //if it matches, send the user id 
      if(isUser){ 
        return res.status(200).send({success:userToGet[0]._id})
      }
      // if user doesnt exist send null
      res.send({sucess:null})
    }catch(err){
      res.send(err)
    }
  
})
const express = require("express");
const app= express();
const cors =require("cors");

const mongoose = require("mongoose")
const User = require("./models/user.model")
const jwt = require('jsonwebtoken');
const bcrypt =require("bcrypt");
const nodemailer = require('nodemailer');

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/mern-stack")

app.get("/", (req,res)=>{
    res.send("Welcome To the Node js project!")
})

app.post("/api/signup", async(req,res)=>{
    const newPassword = await bcrypt.hash(req.body.password,6)
    console.log(req.body.name,req.body.email,newPassword)
    try{
        await User.create({
            name:req.body.name,
            email:req.body.email,
            password:newPassword,
        })
        res.json({status:"ok"})
    }catch(e){
        res.json({status:"error", error:"duplicate email address"})
    }

})


app.post("/api/login", async(req,res)=>{
    console.log(req.body.email)
    const user = await User.findOne({
        email:req.body.email,
       })
    console.log(user)
    if(!user){
        res.json({status:"error", error:"invalid Email"})
    }else{
            const isPasswordValid = await bcrypt.compare(req.body.password,user.password)
            if(isPasswordValid){
                const token= jwt.sign({
                    name:user.name,
                    email:user.email,
                    },"secret123")
                res.json({status:"ok",user:token})
            }else{
                res.json({status:"error", user:false, error:"invalid password"})
            }
    }

})

app.post("/api/forget-password", async(req,res)=>{
    try{
        const user = await User.findOne({email:req.body.email,})
        if(!user){
        res.json({message:"user not registered"})
        }else{
            const token= jwt.sign({id:user._id,},"secret123")
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                user: 'yellapuv23@gmail.com',
                pass: 'fzffonhenvzrlcrk'
                }
            });
      
            const mailOptions = {
                from: 'yellapuv23@gmail.com',
                to: req.body.email,
                subject: 'Reset password',
                text: `http://http://localhost:3000/ResetPassword/${token}`
            };
      
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    return res.json({message:"user not registered"})
                } else {
                    return res.json({ status:"ok", message:"email send"});
                }
            });
        }
    }catch(e){
        console.log(e)
    }
})


app.post("/api/reset-password/:token", async(req,res)=>{
    const token = req.params.token
    const password = req.body.password
    try{
        const decode= jwt.verify(token, "secret123")
        const id = decode.id
        const hashPassword =bcrypt.hash(password,4)
        const result = await User.findByIdAndUpdate({_id:id, password:hashPassword})
        return res.json({status:true, message:"updated password"})
    

    }catch(e){
        return res.json({message:"invalid token"})
    }

})

app.listen(1337, ()=>{
    console.log("server running on port 1337");
})
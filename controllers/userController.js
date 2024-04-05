const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
//@desc register a user
//@route post /api/users/register
//access public
const registerUser = asyncHandler(async (req,res) => {
    const {username, email, password} = req.body;
    if(!username || !email || !password){
        res.status(400);
        throw new Error("All fiels are mandatory!");
    }
    const userAvailable = await User.findOne({email});
    if(userAvailable){
        res.status(400);
        throw new Error("User already registerd!");
    }
    //hash password
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        email,
        password: hashPassword
    });
    if(user){
        res.status(201).json({_id: user.id, email: user.email})
    }else{
        res.status(400)
        throw new Error("User data not valid")
    }
    res.json({message: "Register the User"})
})

//@desc login a user
//@route post /api/users/login
//access public
const loginUser = asyncHandler(async (req,res) => {
    const {email, password} = req.body;
    if(!email || !password){
        res.status(400);
        throw new Error("All fiels are mandatory")
    }
    
    const user = await User.findOne({email});
    console.log("aa",user)
    //compare password with hash password
    if(user && bcrypt.compare(password, user.password)){
        const accessToken = jwt.sign({
            user:{
                username:user.username,
                email:user.email,
                id: user.id
            },
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "12m"}
        );
        res.status(200).json({accessToken})
    }else{
        res.status(401)
        throw new Error("email or password is not valid")
    }
    res.json({message: "Login the User"})
})

//@desc current user
//@route post /api/users/current
//access private
const currentUser = asyncHandler(async (req,res) => {
    res.json(req.user)
})

module.exports = {registerUser, loginUser, currentUser}
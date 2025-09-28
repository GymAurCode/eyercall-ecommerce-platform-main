// Auth Controller
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

// Register User
export const registerUser = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return res.status(400).json({success: false, errors:errors.array()});

    const {name, email, password} = req.body;

    try{
        //Check if user exists
        const existingUser = await User.findOne({email});
        if(existingUser)
            return res.status(400).json({sucess: false, message:"Email already registered"});

        //Hash Password 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        
        //create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role:"User", //default role
        });

        //Generate JWT
        const token = jwt.sign({id:user._id, role:user.role}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        });

        res.status(201).json({success: true, token, user:{id:user._id, name,email, role:user.role}});        
    }
    catch(err){
        console.error(err);
        res.status(500).json({success:false, message:"Server Error"});
    }
};

//Login User
export const loginUser = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return res.status(400).json({success:false, errors:errors.array()});

    const {email , password} = req.body;

    try{
        const user = await User.findOne({email});
        if (!user)
            return res.status(400).json({success:false, message:"Invalid credentials"});

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch)
            return res.status(400).json({success:false, message: "Invalid credentials"});


        const token = jwt.sign({id:user._id, role:user.role}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",     
        });

        res.status(200).json({success:true, token, user:{id: user._id, name:user.name, email: user.email, role: user.role}})

    }catch(err){
        console.error(err);
        res.status(500).json({success: false , message: "Server Error"});

} 
};

// Get Logged-in user profile
export const getProfile = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select("-password");
        if(!user)
            return res.status(404).json({success: false, message: "User not found"});
        

        res.status(200).json({success: true, user});
    }catch (err){
        console.error(err);
        res.status(500).json({success: false, message: "Server Error"});
    }
};
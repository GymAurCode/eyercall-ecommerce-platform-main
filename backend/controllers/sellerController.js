// Seller Controller
import Seller from "../models/Seller.js";
import {validationResult} from "express-validator";

// Create Seller Request
export const createSeller = async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return res.status(400).json({success:false, errors:errors.array() });

    try{
        const {name, email, shopName, phone , address} = req.body;

        //check if seller already exists
        const existing = await Seller.findOne({email});
        if(existing){
            return res
            .status(400)
            .json({success: false, message: "Seller already registered"});
        }

        const seller = await Seller.create({
            name,
            email,
            shopName,
            phone,
            address,
            user: req.user.id,
        });

        res.status(201).json({success: true, seller});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};

// Get All Sellers (Admin only)

export const getAllSellers = async (req, res) => {
    try {
        const sellers = await Seller.find().populate("user", "name email role");
        res.json({success: true, sellers});
    }catch(error){
        res.status(500).json({success: false, message: error.message});
    }
};

// Get single Seller

export const getSellerById = async (req,res) => {
    try{
        const seller = await Seller.findById(req.params.id).populate(
            "user",
            "name email role"
        );
        if(!seller)
            return res
        .status(404)
        .json({success: false, message: "Seller not found"});

        res.json({success: true, seller});
    } catch (error) {
        res.status(500).json({success: false, message:error.message});
    }
};

//Update Seller (Only owner or admin)
export const updateSeller = async (req, res) => {
    try{
        const seller = await Seller.findById(req.params.id);
        if(!seller)
            return res
        .status(404)
        .json({success: false, message: "Seller no found"});


        // only admin or the same user can update
        if (seller.user.toString() !== req.user.id && req.user.role !== "Admin"){
            return res
            .status(403)
            .json({success: false, message: "Not authorized"});
        }

        const updates = req.body;
        const updatedSeller = await Seller.findByIdAndUpdate(
            req.params.id,
            updates,
            {new: true}
        );

        res.json({success: true, seller: updatedSeller});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};

// Delete Seller (Admin only)
export const deleteSeller = async (req, res) => {
    try{
        const seller = await Seller.findById(req.params.id);
        if(!seller)
            return res
        .status(404)
        .json({success: false, message: "Seller not found"});

        await seller.deleteOne();
        res.json({success: true, message: "Seller deleted"});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};
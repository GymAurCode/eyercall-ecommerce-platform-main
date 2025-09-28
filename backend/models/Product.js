// Product Model
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, trim: true}, 
        description: {type: String, trim: true}, 
        price: {type: Number, required: true, min: 0},
        stock: {type: Number, required: true, min: 0}, 
        category: {type: String, trim: true},
        image: {type: String}, // Cloudinary URL/ local path
        
        seller:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Seller",
            required: true,
        },
    },
    {timestamps : true}
);

export default mongoose.model("product", ProductSchema);
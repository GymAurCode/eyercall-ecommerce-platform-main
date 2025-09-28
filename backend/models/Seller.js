import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    shopName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    isApproved: { type: Boolean, default: false }, // Admin approval
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// **Important:** create model from schema
const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;

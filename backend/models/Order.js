// Order Model
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  name: { type: String, required: true },        // snapshot: product name
  price: { type: Number, required: true },       // snapshot: price at order time
  qty: { type: Number, required: true, min: 1 },
  subTotal: { type: Number, required: true },    // price * qty
});

const paymentSchema = new mongoose.Schema({
    method: {type: String},
    providerReference: { type: String }, // tx id from gateway
    paidAt: {type: Date},
    status: {type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending"},
});

const orderSchema = new mongoose.Schema(
    {
     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
     items: [orderItemSchema],
     shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    payment: paymentSchema,
    totalAmount: {type: Number, require: true, min: 0},
    status: {
        type: String,
        enum: ["Pending", "Paid", "Processing", "Shipped", "Delivered", "cancelled", "Refunded"],
        default: "Pending",
    },
sellerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Seller" }], // convenience
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import { validationResult } from "express-validator";

// 📌 Create Product (Seller only)
export const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { name, description, price, stock, category, image } = req.body;

    // Check if user is seller
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) {
      return res
        .status(403)
        .json({ success: false, message: "Only sellers can add products" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      image,
      seller: seller._id,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get All Products (Public - for customers)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("seller", "name shopName");
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get Seller's Own Products
export const getSellerProducts = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    const products = await Product.find({ seller: seller._id });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get Product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name shopName"
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Update Product (Only seller who owns it)
export const updateProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    const product = await Product.findById(req.params.id);

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (!seller || product.seller.toString() !== seller._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const updates = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Delete Product (Only seller who owns it)
export const deleteProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    const product = await Product.findById(req.params.id);

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (!seller || product.seller.toString() !== seller._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

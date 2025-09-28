// Product Routes
import express from "express";
import {body} from "express-validator";
import authMiddleware from "../middlewares/authMiddleware.js";
import { 
  createProduct,
  getAllProducts,
  getSellerProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

//Seller adds Product
router.post(
    "/",
    authMiddleware,
    [
        body("name").notEmpty().withMessage("Product name is required"),
        body("price").isFloat({gt:0}).withMessage("Valid price required"),
        body("stock").isInt({min:0}).withMessage("Stock must be 0 or more"),
    ],
    createProduct
);

// get all products (Public)
router.get("/", getAllProducts);

// get seller's products
router.get("/my", authMiddleware, getSellerProducts);

// get single product by ID
router.get("/:id", getProductById);

// update product
router.put("/:id", authMiddleware, updateProduct);

// delete product
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
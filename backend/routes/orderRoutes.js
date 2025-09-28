// routes/orderRoutes.js
import express from "express";
import { body, param, query } from "express-validator";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrdersForSeller,
} from "../controllers/orderController.js";

const router = express.Router();

// Create order (authenticated user)
router.post(
  "/",
  authMiddleware,
  [
    body("items").isArray({ min: 1 }).withMessage("Items array is required"),
    body("items.*.productId").isMongoId().withMessage("Valid productId required"),
    body("items.*.qty").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("shippingAddress.fullName").notEmpty(),
    body("shippingAddress.phone").notEmpty(),
    body("shippingAddress.addressLine1").notEmpty(),
    body("shippingAddress.city").notEmpty(),
    body("shippingAddress.postalCode").notEmpty(),
    body("shippingAddress.country").notEmpty(),
    body("paymentMethod").optional().isString(),
  ],
  createOrder
);

// Get logged-in user's orders
router.get("/my", authMiddleware, getMyOrders);

// Get single order (auth)
router.get("/:id", authMiddleware, [param("id").isMongoId()], getOrderById);

// Cancel order (user or admin)
router.delete("/:id", authMiddleware, [param("id").isMongoId()], cancelOrder);

// Update order status (seller or owner/admin)
router.put("/:id/status", authMiddleware, [param("id").isMongoId(), body("status").notEmpty()], updateOrderStatus);

// Admin: get all orders
router.get("/", authMiddleware, getAllOrders);

// Seller: get orders containing seller's products
router.get("/seller/my", authMiddleware, getOrdersForSeller);

export default router;

import express from "express";
import { body } from "express-validator";
import {
  createPayment,
  getPaymentByOrder,
  getAllPayments,
} from "../controllers/paymentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create Payment
router.post(
  "/",
  authMiddleware,
  [
    body("order", "Order ID is required").notEmpty(),
    body("amount", "Amount must be a number").isFloat({ min: 1 }),
    body("method", "Valid payment method is required").isIn(["JazzCash", "Easypaisa", "COD"]),
    body("transactionId", "Transaction ID is required").notEmpty(),
  ],
  createPayment
);

// Get Payment by Order (User)
router.get("/order/:orderId", authMiddleware, getPaymentByOrder);

// Get All Payments (Admin)
router.get("/", authMiddleware, getAllPayments);

export default router;

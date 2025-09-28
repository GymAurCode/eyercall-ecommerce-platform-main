import Payment from "../models/Payment.js";
import { validationResult } from "express-validator";

// Create Payment
export const createPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { order, amount, method, transactionId, notes } = req.body;

    // Check if transactionId already exists
    const existing = await Payment.findOne({ transactionId });
    if (existing)
      return res.status(400).json({ success: false, message: "Transaction ID already exists" });

    const payment = await Payment.create({
      user: req.user.id,
      order,
      amount,
      method,
      transactionId,
      notes,
      status: method === "COD" ? "Pending" : "Completed",
      paidAt: method === "COD" ? null : new Date(),
    });

    res.status(201).json({ success: true, payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Payment by Order (User)
export const getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId, user: req.user.id });
    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found" });

    res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get All Payments (Admin)
export const getAllPayments = async (req, res) => {
  try {
    if (req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const payments = await Payment.find().populate("user", "name email").populate("order");
    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

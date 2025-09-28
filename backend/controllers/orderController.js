// Order Controller
// controllers/orderController.js
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";

/**
 * Helper: validation errors
 */
const validationErrors = (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    return res.status(400).json({ success: false, errors: errs.array() });
  }
  return null;
};

/**
 * POST /api/order
 * Create a new order (from cart)
 * Body:
 *  {
 *    items: [{ productId, qty }],
 *    shippingAddress: { fullName, phone, addressLine1, city, postalCode, country },
 *    paymentMethod: "cash" | "jazzcash" | "easypaisa" | ...
 *  }
 */
export const createOrder = async (req, res) => {
  const invalid = validationErrors(req, res);
  if (invalid) return;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, paymentMethod, note } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "No items provided" });
    }

    // Build order items, check stock, and compute totals
    const orderItems = [];
    let totalAmount = 0;
    const sellerSet = new Set();

    for (const it of items) {
      const { productId, qty } = it;
      if (!productId || !qty || qty < 1) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: "Invalid item format" });
      }

      const product = await Product.findById(productId).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: `Product ${productId} not found` });
      }

      if (product.stock < qty) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: `Not enough stock for ${product.name}` });
      }

      // decrement stock atomically
      product.stock = product.stock - qty;
      await product.save({ session });

      const subTotal = product.price * qty;
      totalAmount += subTotal;

      // Make sure product.seller exists
      if (!product.seller) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: `Product ${product.name} has no seller` });
      }

      sellerSet.add(String(product.seller));

      orderItems.push({
        product: product._id,
        seller: product.seller,
        name: product.name,
        price: product.price,
        qty,
        subTotal,
      });
    }

    // Build order doc
    const order = await Order.create(
      [
        {
          user: req.user.id,
          items: orderItems,
          shippingAddress,
          payment: {
            method: paymentMethod,
            status: paymentMethod === "cash" ? "Pending" : "Pending", // payment flow handled separately
          },
          totalAmount,
          sellerIds: Array.from(sellerSet),
          note,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, order: order[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("createOrder:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/order/my
 * Get orders of logged-in user
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("getMyOrders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/order/:id
 * Get order by id (only owner of order, seller involved, or admin/owner role)
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name price")
      .populate("items.seller", "name shopName");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Authorization: user who placed order OR a seller included OR owner/admin
    const isOwner = String(order.user._id) === String(req.user.id);
    const isSeller = order.sellerIds.map(String).includes(String(req.user?.sellerId || req.user?.id));
    const isAdmin = req.user.role === "Owner" || req.user.role === "Admin";

    // For sellers we check if user's linked seller id is included (some apps link user->seller)
    // If you store seller.user mapping, you may fetch req.user.sellerId during auth middleware.

    if (!isOwner && !isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("getOrderById:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/order/ (Admin/Owner) - list all orders with pagination and filters
 * Query: page, limit, status, from, to, sellerId
 */
export const getAllOrders = async (req, res) => {
  try {
    // only Owner/Admin allowed
    if (!(req.user.role === "Owner" || req.user.role === "Admin")) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const page = Math.max(1, parseInt(req.query.page || 1, 10));
    const limit = Math.min(parseInt(req.query.limit || 20, 10), 100);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.sellerId) filter["items.seller"] = req.query.sellerId;
    if (req.query.from || req.query.to) filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name email");

    res.json({ success: true, meta: { total, page, limit }, orders });
  } catch (err) {
    console.error("getAllOrders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PUT /api/order/:id/status
 * Update order status (Seller can update status for their items -> shipping, Owner/Admin can update globally)
 * Body: { status: "Shipped" | "Delivered" | "Cancelled" } and optionally providerReference for payment
 */
export const updateOrderStatus = async (req, res) => {
  const allowed = ["Pending", "Paid", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];
  const { status, providerReference } = req.body;

  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // If seller trying to update: ensure seller is part of order
    const isAdmin = req.user.role === "Owner" || req.user.role === "Admin";
    let isSeller = false;

    // If you keep sellerId on req.user via auth middleware, use it. Else check by querying Seller model.
    // Safer approach: check if any item belongs to a seller whose user maps to req.user.id
    if (!isAdmin) {
      // Find seller records for this user (if exists)
      const seller = await Seller.findOne({ user: req.user.id });
      if (!seller) return res.status(403).json({ success: false, message: "Access denied" });

      isSeller = order.sellerIds.map(String).includes(String(seller._id));
      if (!isSeller) return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Apply status change
    order.status = status;

    // If payment provider reference provided, store/payment status update
    if (providerReference) {
      order.payment.providerReference = providerReference;
      if (status === "Paid") {
        order.payment.status = "Paid";
        order.payment.paidAt = new Date();
      }
    }

    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("updateOrderStatus:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * DELETE /api/order/:id
 * Cancel order (User can cancel if not shipped; Admin/Owner can delete)
 */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const isOwner = String(order.user) === String(req.user.id);
    const isAdmin = req.user.role === "Owner" || req.user.role === "Admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Only allow user cancel if not shipped/delivered and payment not completed (business logic)
    if (isOwner && ["Shipped", "Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({ success: false, message: "Cannot cancel at this stage" });
    }

    // If canceling, we should restore stock for items
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // restore product stock
      for (const it of order.items) {
        await Product.findByIdAndUpdate(it.product, { $inc: { stock: it.qty } }, { session });
      }

      order.status = "Cancelled";
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.json({ success: true, message: "Order cancelled", order });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("cancelOrder inner:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  } catch (err) {
    console.error("cancelOrder:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/order/seller (Seller: view orders that include their products)
 */
export const getOrdersForSeller = async (req, res) => {
  try {
    // find seller record for this user
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) return res.status(403).json({ success: false, message: "Not a seller" });

    // find orders where items.seller == seller._id
    const orders = await Order.find({ "items.seller": seller._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("getOrdersForSeller:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

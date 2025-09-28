// Owner Controller

import { validationResult } from "express-validator";
import Seller from "../models/Seller.js"
import User from "../models/User.js"
import Order from "../models/Order.js"


/**
 * Helper: Send validation errors
 */

const handleValidation = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({success: false, errors: errors.array()});
    }
  return null;
};

/**
 * GET /api/owner/sellers
 * Paginated sellers list with optional approval filter
 */

export const getAllSellers = async (req,res) => {
    const invalid = handleValidation(req, res);
    if (invalid) return;

    try{
        const page = req.query.page || 1;
        const limit = Math.min(req.query.limit || 20, 100);
        const approved = req.query.approved; // boolean or undefined
        const filter = {};

        if (typeof approved === "boolean") filter.isApproved = approved;

        const total = await Seller.countDocument(filter);
        const sellers = await Seller.find(filter)
        .sort({createAt: -1})
        .skip((page -1) * limit)
        .limit(limit)
        .populate("user", "name email role");


        res.json({success: true, meta: {total, page, limit}, sellers});
    } catch (err) {
        console.error("getAllSellers:", err);
        res.status(500).json({success: false, message: "Server error"});
    }
};

/**
 * GET /api/owner/sellers/:id
 */

export const getSellerById = async (req, res) => {
    const invalid = handleValidation( req, res);
    if (invalid) return;

    try{
        const seller = await Seller.findById(req.params.id).populate("user", "name email role");
        if(!seller) return res.status(404).json({success: false, message: "Seller not found"});
        res.json({success: true, seller});
    } catch (err) {
        console.error("getSellerById:", err);
        res.status(500).json({success : false, message: "Server error"});
    }
};

/**
 * POST /api/owner/sellers/:id/approve
 * Approve seller (owner action)
 */

export const approveSeller = async (req, res) => {
    const invalid = handleValidation (req, res);
    if (invalid) return;
    try{
        const seller = await Seller.findById(req.params.id);
        if(!seller) return res.status(404).json({success: false, message: "Seller not found"});

        if(seller.isApproved) {
            return res.status(400).json({success: false, message: "Seller already approved"});
        }

        seller.isApproved = true;
        await seller.save();

        //Optional update linked user's role to Seller if you follow that pattern

        if (seller.user) {
            await User.findByIdAndUpdate(seller.user, {role: "Seller"});
        }

        res.json({success: true, message: "Seller approved", seller});
    } catch(err) {
        console.error("approveSeller:" , err);
        res.status(500).json({success: false, message: "Server error"});
    }
};

/**
 * POST /api/owner/sellers/:id/reject
 * Reject a seller — store reason (optional)
 */

export const rejectSeller = async (req,res) => {
    const invalid = handleValidation(req, res);
    if(invalid) return;

    try{
        const {reason} = req.body;
        const seller = await Seller.findById(req.params.id);
        if(!seller) return res.status(404).json({success: false, message: "Seller not found"});

        // Here we delete or mark rejected - choose app behavior. We'll mark rejected and keep record.

        seller.isApproved = false;
        seller.rejection = {reason: reason || "Rejected by owner", rejectedAt: new Date(), by:req.user.id};
        await seller.save();

        //Optionally downgrade linked user role
        if(seller.user) {
            await User.findByIdAndUpdate(seller.user, {role: "User"});
        }

        res.json({success: true, message: "Seller rejected", seller});
    } catch (err) {
        console.error("rejectSeller:", err);
        res.status(500).json({success: false, message:"Server error"});
    }
};

/**
 * GET /api/owner/users
 * Paginated users list with optional role filter
 */


export const getAllUsers = async (req, res) => {
    const invalid = handleValidation(req, res);
    if(invalid) return;

    try{
        const page = req.query.page || 1;
        const limit = Math.min(req.query.limit || 20,100);
        const role = req.query.role;
        const filter = {};
        if (role) filter.role = role;

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
        .sort({createAt: -1})
        .skip((page - 1)* limit)
        .limit(limit)
        .select("-password");

        res.join({success: true, meta: {total, page, limit }, users});
    } catch (err) {
        console.error("getAllUsers:", err);
        res.status(500).json({success: false, message: "Server error"});
    }
};

/**
 * GET /api/owner/reports/sales
 * Aggregate orders to produce sales report.
 * Query: from, to (ISO strings), groupBy = day|month
 */

export const getSalesReport = async (req, res) => {
    const invalid = handleValidation(req, res);
    if(invalid) return;

    try{
        const { from, to, groupBy = 'day'} = req.query;
        const match = {status: "Paid"}; // only paid / completed orders , adjust as per your order statuses

        if(from || to) match.createAt = {};
        if(from) match.createAt.$gte = new Date(from);
        if (to) match.createAt.$lte = new Date(to);

        //group by day or month
        const dateFormat = groupBy === "month" ? {$dateToString : { format: "%Y-%m", date: "$createdAt"}} : {$dateToString: { format: "%Y-%m-%d", date: "$createdAt"}};

       const pipeline = [
        {$match : match },
        {
            $group: {
                _id: dateFormat,
                totalSales: {$sum: "$totalAmount"},
                orders: {$sum : 1},
            },
        },
        {$sort : {_id: 1}},
       ];

       const result = await Order.aggregate(pipeline);

       res.json({ success: true, meta: {groupBy}, report: result});

    } catch (err) {
        console.error("getSalesReport:", err);
        res.status(500).json({success: false, message: "Server error"});
    }
};

/**
 * GET /api/owner/reports/sellers/:id/sales
 * Sales for a specific seller (aggregation on orders containing seller's products).
 * Assumes Order schema has items array with product + seller reference and totalAmount, e.g:
 * items: [{ product: ObjectId, seller: ObjectId, price, qty, subTotal }]
 */

export const getSellerSales = async (req, res) => {
  const invalid = handleValidation(req, res);
  if (invalid) return;
  try {
    const sellerId = req.params.id;
    const { from, to } = req.query;
    const match = { "items.seller": sellerId, status: "Paid" };

    if (from || to) match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);

    const pipeline = [
      { $match: match },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerId } },
      {
        $group: {
          _id: "$items.seller",
          totalSales: { $sum: "$items.subTotal" },
          totalOrders: { $addToSet: "$_id" }, // will be an array of orderIds
          totalItemsSold: { $sum: "$items.qty" },
        },
      },
      {
        $project: {
          totalSales: 1,
          totalOrders: { $size: "$totalOrders" },
          totalItemsSold: 1,
        },
      },
    ];

    const result = await Order.aggregate(pipeline);
    res.json({ success: true, sellerId, report: result[0] || { totalSales: 0, totalOrders: 0, totalItemsSold: 0 } });
  } catch (err) {
    console.error("getSellerSales:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
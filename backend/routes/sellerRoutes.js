// Seller Routes
import express from "express";
import {body} from "express-validator";
import {
    createSeller,
    getAllSellers,
    getSellerById,
    updateSeller,
    deleteSeller,
} from "../controllers/sellerController.js";

import authMiddleware from "../middlewares/authMiddleware.js"; 

const router = express.Router();

// create seller (Logged-in user)
router.post(
    "/",
    authMiddleware,
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("shopName").notEmpty().withMessage("Shop name is required"),
        body("phone").notEmpty().withMessage("Phone is required"),
    ],
    createSeller
);


// Get all sellers (Admin only)
router.get("/", authMiddleware, getAllSellers);

// Get single seller
router.get("/:id", authMiddleware, getSellerById);

// Update seller
router.put("/:id", authMiddleware, updateSeller);

//  Delete seller (Admin only)
router.delete("/:id", authMiddleware, deleteSeller);

export default router;



/*
Seller Dashboard Options (Frontend)

Profile / Seller Info Section

Seller ka naam, shop name, phone, email, address.

Profile update option (edit details).

Product Management

Add Product Form → (Title, Description, Price, Category, Stock, Image Upload).

Product List → seller ke apne products ka list with edit/delete buttons.

Edit Product → existing product update karne ka page/modal.

Delete Product → product remove karne ka option.

Orders Management

My Orders Page → sirf us seller ke products ke orders list dikhaye.

Order details (customer name, product, quantity, payment status, delivery status).

Option to mark order as Shipped / Delivered.

Reports / Analytics

Total Products.

Total Orders.

Total Sales (with date filter).

Earnings report (weekly/monthly).

Notifications

Jab koi naya order aaye to notification.

Admin approval/rejection updates.

Settings

Change password.

Shop settings (like logo, banner, shop description).

📊 Example Seller Dashboard Sidebar Menu

🏠 Dashboard Overview (stats cards: sales, orders, products)

📦 Products → (Add, List, Edit/Delete)

🛒 Orders → (View & Manage Orders)

📈 Reports → (Sales report, earnings, charts)

⚙️ Settings → (Profile, Shop info, Password change)

👉 Tumhari app ka flow ye hoga:

Seller login karega → usay Seller Dashboard milega.

Wahan se wo apna shop manage karega (products + orders + sales).

*/
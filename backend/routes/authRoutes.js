// Auth Routes
import express from "express";
import {body} from "express-validator";
import {registerUser, loginUser, getProfile} from "../controllers/authController.js"
import authMiddleware from "../middlewares/authMiddleware.js"

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc  Register new user (default role: User)
 * @access Public
 */

router.post(
    "/register",
    [
        body("name", "Name is required").notEmpty(),
        body("email", "Valid email is required").isEmail(),
        body("password", "Password must be 6+ characters").isLength({min:6}),
    ],
    registerUser
);

/**
 * @route POST /api/auth/login
 * @desc  Login user and get JWT token
 * @access Public
 */

router.post(
    "/login",
    [
        body("email", "Valid email is required").isEmail(),
        body("password", "Password is required").exists(),
    ],
    loginUser
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get logged-in user's profile
 * @access  Private
 */

router.get("/profile", authMiddleware,getProfile);
export default router;







// Owner Routes
import express from "express"
import {query, param, body} from "express-validator";
import authMiddleware from "../middlewares/authMiddleware.js";
import ownerMiddleware from "../middlewares/ownerMiddleware.js"
import {
    getAllSellers,
    getAllUsers,
    getSellerById,
    approveSeller,
    rejectSeller,
    getSalesReport,
    getSellerSales,
}from "../controllers/ownerController.js";

const router = express.Router();

//All owner routes require auth + owner role
router.use(authMiddleware, ownerMiddleware);
/**
 * GET /api/owner/sellers
 * Query params: page, limit, approved (true/false)
 * Admin/owner list all sellers with pagination & approval filter
 */

router.get(
    "/sellers",
    [
        query("page").optional().isInt({min:1}).toInt(),
        query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
        query("approved").optional().isBoolean().toBoolean(),
    ],
    getAllSellers
);

/**
 * GET /api/owner/sellers/:id
 * Get single seller by id
 */

router.get("/sellers/:id", [param("id").isMongoId()], approveSeller);

/**
 * POST /api/owner/sellers/:id/reject
 * Reject a seller (optionally store reason)
 */

router.post(
    "/sellers/:id/reject",
    [param("id").isMongoId(), body("reason").optional().isString().trim().isLength({max:500})],
    rejectSeller
);

/**
 * GET /api/owner/users
 * Query params: page, limit, role
 */

router.get(
    "/users",
    [
        query("page").optional().isInt({min:1}).toInt(),
        query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
        query("role").optional().isIn(["User", "Seller", "Owner", "Admin"]),
    ],
    getAllUsers
);

/**
 * GET /api/owner/reports/sales
 * Query params: from, to, groupBy (day|month)
 * Overall sales report (aggregation)
 */

router.get(
    "/report/sales",
    [
        query("from").optional().isISO8601(),
        query("to").optional().isISO8601(),
        query("groupBy").optional().isIn(["day", "month"]),
    ],
    getSalesReport
);

/**
 * GET /api/owner/reports/sellers/:id/sales
 * Sales for a specific seller
 */

router.get(
    "/reports/sellers/:id/sales",
    [param("id").isMongoId(), query("from").optional().isISO8601(), query("to").optional().isISO8601()],
    getSellerSales
);

export default router;
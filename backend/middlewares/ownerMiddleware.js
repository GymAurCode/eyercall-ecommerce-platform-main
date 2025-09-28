
// Ensures the authenticated user has Owner (or Admin) role.
const ownerMiddleware = (req, res, next) => {
    try{
        const role = req.user?.role;
        if(!role || (role !== "Owner" && role !== "Admin")) {
            return res.status(403).json({success: false, message:"Access denied"});
        }
        next();
    } catch(err) {
        next(err);
    }
};

export default ownerMiddleware;
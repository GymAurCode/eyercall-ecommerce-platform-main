// Auth Middleware
import jwt from "jsonwebtoken";
const authMiddleware = (req,res,next) => {
    const token = req.headers.authorization?.split(" ")[1];  // Bearer token


    if(!token)
        return res.status(401).json({success: false, message: "No token, authorization denied"});

   try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // {id, role}
    next();
   }catch (err){
    return res.status(401).json({success: false, message: "Token is not valid"});
   }
};

export default authMiddleware;
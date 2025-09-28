// Server Entry Point
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

//Import routes
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";


dotenv.config();
const app = express();

// sercurity + Middlewares 
app.use(helmet());
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));
app.use(compression());
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({status: 'Ok', uptime: process.uptime()});
});


// Routes 
app.use('/api/auth' , authRoutes);
app.use('/api/order' , orderRoutes);
app.use('/api/owner' , ownerRoutes);
app.use('/api/product' , productRoutes);
app.use('/api/seller' , sellerRoutes);
app.use("/api/payment", paymentRoutes);

// 404 Handler
app.use((req,res,next) =>{
    res.status(404).json({message: 'Route not found'});
});

// Error Handler (Centralized)
app.use((err,req,res,next) =>{
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});


//Database connection & Server Start
const startServer = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch(err){
        console.error('MongoDB connection Failed:' , err.message);
        process.exit(1);
    }
};

startServer();
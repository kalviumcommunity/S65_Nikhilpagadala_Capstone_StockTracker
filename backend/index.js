import express from "express";
import connectDB from "./db.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import router from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 5000

// Middleware
app.use(express.json());


// Routes
app.use('/api', router);


const startServer = async () => {
    try {
        await connectDB();
        console.log('MongoDB connected');

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Server startup error:', error.message);
        process.exit(1);
    }
};
startServer();

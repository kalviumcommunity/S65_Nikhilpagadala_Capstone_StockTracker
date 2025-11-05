import User from "../Models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const loginUser = async (req, res) => {
    try {
        const { email, password } = {
            email: req.body.email?.trim(),
            password: req.body.password?.trim()
        };

        // Validation
        if (!email || !password) {
            console.log("Validation failed - Email:", email, "Password present:", !!password);
            return res.status(400).json({ error: "Email and password are required." });
        }

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(400).json({ error: "Invalid credentials." }); // Generic message for security
        }

        // Debug logging (remove in production)
        console.log('Login attempt for user:', user.email);
        console.log('Input password:', password);
        console.log('Stored hash:', user.password);

        // Password comparison
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('Password mismatch for user:', user.email);
            return res.status(400).json({ error: "Invalid Password" });
        }

        // Token generation
        const accessToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_accessLogIn_SECRET || 'your-secure-access-token-secret-2024',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_RefreshLogin_SECRET || 'your-secure-refresh-token-secret-2024',
            { expiresIn: '30d' }
        );

        // Remove password from response
        user.password = undefined;

        console.log("Successful login for user:", user.email);
        return res.status(200).json({ 
            message: "Login successful!", 
            user, 
            accessToken, 
            refreshToken 
        });

    } catch (error) {
        console.error("Login error:", {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        return res.status(500).json({ 
            error: "Authentication failed", 
            details: process.env.NODE_ENV === 'development' ? error.message : null 
        });
    }
};

export default loginUser;
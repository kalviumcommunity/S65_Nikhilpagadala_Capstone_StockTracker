import User from "../Models/userModel.js";
import jwt from "jsonwebtoken";export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        // Let the model's pre-save hook handle hashing
        const user = new User({ username, email, password });
        await user.save();

        // Generate tokens
        const accessToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_accessSignUp_SECRET || 'your-secure-refresh-token-secret-2024',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_RefreshSignUp_SECRET || 'your-secure-refresh-token-secret-2024',
            { expiresIn: '30d' }
        );

        // Remove password from response
        user.password = undefined;

        return res.status(201).json({
            message: 'Registration successful',
            user,
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Registration failed',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};
import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers['authorization'];
  const token = tokenHeader?.startsWith('Bearer ') ? tokenHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_accessLogIn_SECRET || 'your-secure-access-token-secret-2024');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export default verifyToken;

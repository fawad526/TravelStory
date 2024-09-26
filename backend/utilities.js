import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // No token provided
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Extract userId from the token's payload (e.g., decoded.userId)
        req.user = { userId: decoded.userId }; // Ensure only userId is passed
        next();
    });
}

export default authenticateToken;

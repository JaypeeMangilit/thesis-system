import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = (req, res, next) => {
    //1. Get Token
    const authHeader = req.headers.authorization;
    console.log("Auth Header Received", authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Access Denied.'});
    }

    const token = authHeader.split(' ')[1];

    try {
        //2. Verify and Decode the Token
        const decoded = jwt.verify(token, JWT_SECRET);

        
        req.user = decoded;
        next();

    } catch (ex) {
        //Token is Invalid
        res.status(401).json({message: 'Invalid Token.'});
    }
};

// Middleware to Restrict Access Based on user Role.
export const restrictTo = (allowedRoles) => {
    return (req, res, next) => {

        if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({message: 'Forbidden: you do not have the required role to access this resource.' });
        }
        next();
    };
};
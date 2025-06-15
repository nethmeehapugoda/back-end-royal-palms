
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Authentication failed: No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Debug: Log the decoded token to see what's inside
   

   
    const userId = decoded.id || decoded.userId; 


    const user = await User.findById(userId).select("-password");


    if (!user) {
      return res.status(401).json({
        message: "Authentication failed: User not found",
        debug: {
          tokenPayload: decoded,
        },
      });
    }

    // Ensure user object has the id property
    req.user = {
      ...user.toObject(),
      id: user._id.toString(),
    };

   
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Authentication failed: Token expired",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Authentication failed: Invalid token",
      });
    }
    if (error.name === "CastError") {
      return res.status(401).json({
        message: "Authentication failed: Invalid user ID in token",
      });
    }
    res.status(401).json({
      message: "Authentication failed: Token validation error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

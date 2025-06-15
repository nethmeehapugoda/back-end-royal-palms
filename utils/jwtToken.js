
import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  // Use 'id' instead of 'userId' to match the middleware expectation
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default generateToken;

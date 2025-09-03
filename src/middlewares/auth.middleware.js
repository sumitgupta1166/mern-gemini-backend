import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
export const requireAuth = async (req, res, next) => {
try {
const token = req.headers["authorization"]?.replace("Bearer ", "") ||
req.cookies?.token;
if (!token) throw new ApiError(401, "Unauthorized");
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(decoded._id).select("-password");
if (!user) throw new ApiError(401, "Invalid token user");
req.user = user;
next();
} catch (err) {
next(new ApiError(401, err.message || "Unauthorized"));
}
};
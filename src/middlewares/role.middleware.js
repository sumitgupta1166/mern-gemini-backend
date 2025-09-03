import { ApiError } from "../utils/ApiError.js";
export const requireRole = (role) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, "Unauthorized"));
  if (req.user.role !== role && req.user.role !== "admin") {
    return next(new ApiError(403, "Forbidden: insufficient role"));
  }
  next();
};

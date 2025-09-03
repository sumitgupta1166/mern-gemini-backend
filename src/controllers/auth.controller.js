import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
const signToken = (user) =>
  jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || "7d",
  });
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    throw new ApiError(400, "name, email, password required");
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(400, "User already exists");
  const user = await User.create({ name, email, password });
  const token = signToken(user);
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        },
        "Registered"
      )
    );
});
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new ApiError(400, "email and password required");
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "Invalid credentials");
  const ok = await user.verifyPassword(password);
  if (!ok) throw new ApiError(400, "Invalid credentials");
  const token = signToken(user);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        },
        "Login successful"
      )
    );
});
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  return res.status(200).json(new ApiResponse(200, user, "Me"));
});

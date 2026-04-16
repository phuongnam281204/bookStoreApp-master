import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const issueToken = (res, user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    secret,
    { expiresIn: "7d" },
  );

  res.cookie("token", token, cookieOptions);
  return true;
};

export const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const adminEmail = process.env.ADMIN_EMAIL
      ? String(process.env.ADMIN_EMAIL).trim().toLowerCase()
      : null;

    const hashPassword = await bcryptjs.hash(password, 10);
    const createdUser = await User.create({
      fullname: String(fullname).trim(),
      email: normalizedEmail,
      password: hashPassword,
      role: adminEmail && normalizedEmail === adminEmail ? "admin" : "user",
    });

    if (!issueToken(res, createdUser)) {
      return res.status(500).json({ message: "Server misconfigured" });
    }

    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: createdUser._id,
        fullname: createdUser.fullname,
        email: createdUser.email,
        role: createdUser.role,
      },
    });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    if (!issueToken(res, user)) {
      return res.status(500).json({ message: "Server misconfigured" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.status(200).json({ message: "Logged out" });
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "fullname email role",
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

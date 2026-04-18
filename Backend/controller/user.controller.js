import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const SESSION_TTL_MINUTES_RAW = process.env.SESSION_TTL_MINUTES;
const SESSION_TTL_MINUTES = Number(
  SESSION_TTL_MINUTES_RAW === undefined ? 5 : SESSION_TTL_MINUTES_RAW,
);
const sessionTtlMinutes =
  Number.isFinite(SESSION_TTL_MINUTES) && SESSION_TTL_MINUTES > 0
    ? SESSION_TTL_MINUTES
    : 5;
const sessionMaxAgeMs = sessionTtlMinutes * 60 * 1000;

const RESET_TTL_MINUTES_RAW = process.env.RESET_TTL_MINUTES;
const RESET_TTL_MINUTES = Number(
  RESET_TTL_MINUTES_RAW === undefined ? 15 : RESET_TTL_MINUTES_RAW,
);
const resetTtlMinutes =
  Number.isFinite(RESET_TTL_MINUTES) && RESET_TTL_MINUTES > 0
    ? RESET_TTL_MINUTES
    : 15;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: sessionMaxAgeMs,
};

const issueToken = (res, user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    secret,
    { expiresIn: `${sessionTtlMinutes}m` },
  );

  res.cookie("token", token, cookieOptions);
  return true;
};

const VOUCHER_TTL_DAYS_RAW = process.env.VOUCHER_TTL_DAYS;
const VOUCHER_TTL_DAYS = Number(
  VOUCHER_TTL_DAYS_RAW === undefined ? 3 : VOUCHER_TTL_DAYS_RAW,
);
const voucherTtlDays =
  Number.isFinite(VOUCHER_TTL_DAYS) && VOUCHER_TTL_DAYS > 0
    ? VOUCHER_TTL_DAYS
    : 3;

const generateVoucherCode = () => {
  // Short, human-friendly code
  const rand = crypto.randomBytes(5).toString("hex").toUpperCase();
  return `BS${rand}`;
};

const createVoucherForNewUser = async () => {
  const expiresAt = new Date(Date.now() + voucherTtlDays * 24 * 60 * 60 * 1000);
  for (let i = 0; i < 5; i++) {
    const code = generateVoucherCode();
    const exists = await User.findOne({ "voucher.code": code }).select("_id");
    if (!exists) {
      return {
        code,
        discountPercent: 5,
        expiresAt,
        usedAt: null,
      };
    }
  }
  return {
    code: null,
    discountPercent: 5,
    expiresAt,
    usedAt: null,
  };
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

    const voucher = await createVoucherForNewUser();
    const createdUser = await User.create({
      fullname: String(fullname).trim(),
      email: normalizedEmail,
      password: hashPassword,
      role: adminEmail && normalizedEmail === adminEmail ? "admin" : "user",
      voucher,
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

export const getMyVoucher = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "voucher.code voucher.discountPercent voucher.expiresAt voucher.usedAt",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const v = user.voucher || {};
    if (!v.code) {
      return res.status(404).json({ message: "No voucher" });
    }

    return res.status(200).json({
      voucher: {
        code: v.code,
        discountPercent: v.discountPercent || 5,
        expiresAt: v.expiresAt,
        usedAt: v.usedAt,
      },
    });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const validateMyVoucher = async (req, res) => {
  try {
    const code = String(req.body?.code || "")
      .trim()
      .toUpperCase();
    if (!code) return res.status(400).json({ message: "Missing code" });

    const user = await User.findById(req.user.userId).select(
      "voucher.code voucher.discountPercent voucher.expiresAt voucher.usedAt",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const v = user.voucher || {};
    if (!v.code || String(v.code).toUpperCase() !== code) {
      return res.status(400).json({ message: "Invalid voucher" });
    }
    if (v.usedAt) {
      return res.status(400).json({ message: "Voucher already used" });
    }
    if (v.expiresAt && new Date(v.expiresAt) <= new Date()) {
      return res.status(400).json({ message: "Voucher expired" });
    }

    return res.status(200).json({
      voucher: {
        code: v.code,
        discountPercent: v.discountPercent || 5,
        expiresAt: v.expiresAt,
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

export const listUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("fullname email role");
    return res.status(200).json({ users });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (role !== "user" && role !== "admin") {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (String(req.user.userId) === String(id) && role !== "admin") {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true },
    ).select("fullname email role");

    if (!updated) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user: updated });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(req.user.userId) === String(id)) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    const deleted = await User.findByIdAndDelete(id).select(
      "fullname email role",
    );
    if (!deleted) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "User deleted", user: deleted });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    const user = normalizedEmail
      ? await User.findOne({ email: normalizedEmail })
      : null;

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordTokenHash = resetHash;
      user.resetPasswordExpiresAt = new Date(
        Date.now() + resetTtlMinutes * 60 * 1000,
      );
      await user.save();

      const frontendOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
      const resetLink = `${frontendOrigin.replace(/\/$/, "")}/reset-password?token=${resetToken}`;

      return res.status(200).json({
        message: "If the email exists, a reset link has been created",
        ...(process.env.NODE_ENV === "production" ? {} : { resetLink }),
      });
    }

    return res.status(200).json({
      message: "If the email exists, a reset link has been created",
    });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(String(token))
      .digest("hex");

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashPassword = await bcryptjs.hash(String(password), 10);
    user.password = hashPassword;
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: "Password updated" });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

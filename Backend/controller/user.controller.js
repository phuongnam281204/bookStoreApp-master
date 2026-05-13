import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

const SESSION_TTL_MINUTES_RAW = process.env.SESSION_TTL_MINUTES;
const SESSION_TTL_MINUTES = Number(
  SESSION_TTL_MINUTES_RAW === undefined ? 15 : SESSION_TTL_MINUTES_RAW,
);
const sessionTtlMinutes =
  Number.isFinite(SESSION_TTL_MINUTES) && SESSION_TTL_MINUTES > 0
    ? SESSION_TTL_MINUTES
    : 15;
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

const getGoogleClientId = () => {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
  return clientId || null;
};

const getResetBaseUrl = () => {
  const explicit = String(process.env.RESET_PASSWORD_URL || "").trim();
  if (explicit) return explicit;
  const origin = String(
    process.env.CORS_ORIGIN || "http://localhost:5173",
  ).trim();
  return `${origin.replace(/\/$/, "")}/reset-password`;
};

const getSmtpConfig = () => {
  const host = String(process.env.SMTP_HOST || "").trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();
  const from = String(process.env.SMTP_FROM || user || "").trim();
  const secureEnv = String(process.env.SMTP_SECURE || "").toLowerCase();
  const secure = secureEnv ? secureEnv === "true" : port === 465;

  if (!host || !user || !pass) return null;
  return { host, port, user, pass, from, secure };
};

const sendResetEmail = async (toEmail, resetLink) => {
  const smtp = getSmtpConfig();
  if (!smtp) {
    throw new Error("SMTP not configured");
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  const subject = "Reset your password";
  const text = `You requested a password reset.\n\nReset link: ${resetLink}\n\nThis link expires in ${resetTtlMinutes} minutes.`;
  const html = `
    <p>You requested a password reset.</p>
    <p><a href="${resetLink}">Reset your password</a></p>
    <p>This link expires in ${resetTtlMinutes} minutes.</p>
  `;

  await transporter.sendMail({
    from: smtp.from,
    to: toEmail,
    subject,
    text,
    html,
  });
};

const issueToken = (res, user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
    },
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

export const loginWithGoogle = async (req, res) => {
  try {
    const credential = String(req.body?.credential || "").trim();
    if (!credential) {
      return res.status(400).json({ message: "Missing credential" });
    }

    const clientId = getGoogleClientId();
    if (!clientId) {
      return res.status(500).json({ message: "Server misconfigured" });
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    const emailRaw = payload?.email || "";
    const emailVerified = payload?.email_verified;
    const googleId = payload?.sub || null;
    const fullName = payload?.name || "";
    const avatarUrl = payload?.picture || null;

    if (!emailRaw || !googleId) {
      return res.status(400).json({ message: "Invalid Google token" });
    }
    if (emailVerified === false) {
      return res.status(400).json({ message: "Email not verified" });
    }

    const email = String(emailRaw).trim().toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL
      ? String(process.env.ADMIN_EMAIL).trim().toLowerCase()
      : null;

    let user = await User.findOne({ email });
    if (!user) {
      const voucher = await createVoucherForNewUser();
      const randomPassword = crypto.randomBytes(24).toString("hex");
      const hashPassword = await bcryptjs.hash(randomPassword, 10);

      user = await User.create({
        fullname: fullName ? String(fullName).trim() : email.split("@")[0],
        email,
        password: hashPassword,
        role: adminEmail && email === adminEmail ? "admin" : "user",
        authProvider: "google",
        googleId,
        avatarUrl,
        voucher,
      });
    } else if (user.googleId && user.googleId !== googleId) {
      return res.status(400).json({ message: "Google account mismatch" });
    } else {
      let shouldSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        shouldSave = true;
      }
      if (!user.avatarUrl && avatarUrl) {
        user.avatarUrl = avatarUrl;
        shouldSave = true;
      }
      if (fullName && user.fullname !== fullName) {
        user.fullname = String(fullName).trim();
        shouldSave = true;
      }
      if (shouldSave) await user.save();
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

export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }).select("_id");
    if (user) {
      const resetBaseUrl = getResetBaseUrl();
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      const expiresAt = new Date(Date.now() + resetTtlMinutes * 60 * 1000);

      await User.findByIdAndUpdate(user._id, {
        $set: {
          resetPasswordTokenHash: tokenHash,
          resetPasswordExpiresAt: expiresAt,
        },
      });

      const resetLink = `${resetBaseUrl}${resetBaseUrl.includes("?") ? "&" : "?"}token=${rawToken}`;
      await sendResetEmail(email, resetLink);
    }

    return res
      .status(200)
      .json({ message: "If the email exists, a reset link was sent" });
  } catch (error) {
    console.log("Error: " + error.message);
    if (error.message === "SMTP not configured") {
      return res.status(500).json({ message: "Email service not configured" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const token = String(req.body?.token || "").trim();
    const password = String(req.body?.password || "");

    if (!token || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    user.password = hashPassword;
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpiresAt = null;
    user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    await user.save();

    res.clearCookie("token", cookieOptions);
    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
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

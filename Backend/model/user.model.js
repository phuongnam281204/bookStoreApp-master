import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: { type: String, default: null },
    discountPercent: { type: Number, default: 5, min: 0, max: 100 },
    expiresAt: { type: Date, default: null },
    usedAt: { type: Date, default: null },
  },
  { _id: false },
);

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  tokenVersion: {
    type: Number,
    default: 0,
  },

  resetPasswordTokenHash: {
    type: String,
    default: null,
  },
  resetPasswordExpiresAt: {
    type: Date,
    default: null,
  },

  voucher: {
    type: voucherSchema,
    default: () => ({}),
  },
});

userSchema.index({ "voucher.code": 1 }, { unique: true, sparse: true });

const User = mongoose.model("User", userSchema);
export default User;

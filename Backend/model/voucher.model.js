import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

voucherSchema.index({ code: 1 }, { unique: true });

const Voucher = mongoose.model("Voucher", voucherSchema);

export default Voucher;

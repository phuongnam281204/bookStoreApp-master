import Voucher from "../model/voucher.model.js";

const parseExpiryDate = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
};

export const validateVoucher = async (req, res) => {
  try {
    const code = String(req.body?.code || "")
      .trim()
      .toUpperCase();
    if (!code) return res.status(400).json({ message: "Missing code" });

    const now = new Date();
    const voucher = await Voucher.findOne({
      code,
      active: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).select("code discountPercent expiresAt usageLimit usedCount");

    if (!voucher) {
      return res.status(400).json({ message: "Invalid voucher" });
    }

    if (
      Number.isFinite(voucher.usageLimit) &&
      voucher.usageLimit !== null &&
      voucher.usedCount >= voucher.usageLimit
    ) {
      return res.status(400).json({ message: "Voucher exhausted" });
    }

    return res.status(200).json({
      voucher: {
        code: voucher.code,
        discountPercent: voucher.discountPercent || 0,
        expiresAt: voucher.expiresAt,
      },
    });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ vouchers });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createVoucher = async (req, res) => {
  try {
    const code = String(req.body?.code || "")
      .trim()
      .toUpperCase();
    const discountPercent = Number(req.body?.discountPercent ?? 0);
    const expiresAt = parseExpiryDate(req.body?.expiresAt);
    const active =
      req.body?.active !== undefined ? Boolean(req.body.active) : true;
    const usageLimitRaw = req.body?.usageLimit;
    const usageLimit =
      usageLimitRaw === "" ||
      usageLimitRaw === null ||
      usageLimitRaw === undefined
        ? null
        : Number(usageLimitRaw);

    if (!code) return res.status(400).json({ message: "Code is required" });
    if (
      !Number.isFinite(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      return res.status(400).json({ message: "Invalid discount percent" });
    }
    if (expiresAt === undefined) {
      return res.status(400).json({ message: "Invalid expiresAt" });
    }
    if (
      usageLimit !== null &&
      (!Number.isFinite(usageLimit) || usageLimit < 1)
    ) {
      return res.status(400).json({ message: "Invalid usage limit" });
    }

    const created = await Voucher.create({
      code,
      discountPercent,
      expiresAt,
      active,
      usageLimit,
      usedCount: 0,
    });

    return res.status(201).json({ voucher: created });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Voucher code already exists" });
    }
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Invalid voucher id" });

    const voucher = await Voucher.findById(id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    const patch = {};
    if (req.body?.code !== undefined) {
      const code = String(req.body.code || "")
        .trim()
        .toUpperCase();
      if (!code) return res.status(400).json({ message: "Code is required" });
      patch.code = code;
    }

    if (req.body?.discountPercent !== undefined) {
      const discountPercent = Number(req.body.discountPercent);
      if (
        !Number.isFinite(discountPercent) ||
        discountPercent < 0 ||
        discountPercent > 100
      ) {
        return res.status(400).json({ message: "Invalid discount percent" });
      }
      patch.discountPercent = discountPercent;
    }

    if (req.body?.expiresAt !== undefined) {
      const expiresAt = parseExpiryDate(req.body.expiresAt);
      if (expiresAt === undefined) {
        return res.status(400).json({ message: "Invalid expiresAt" });
      }
      patch.expiresAt = expiresAt;
    }

    if (req.body?.usageLimit !== undefined) {
      const usageLimitRaw = req.body.usageLimit;
      const usageLimit =
        usageLimitRaw === "" || usageLimitRaw === null
          ? null
          : Number(usageLimitRaw);
      if (
        usageLimit !== null &&
        (!Number.isFinite(usageLimit) || usageLimit < 1)
      ) {
        return res.status(400).json({ message: "Invalid usage limit" });
      }
      if (usageLimit !== null && usageLimit < (voucher.usedCount || 0)) {
        return res
          .status(400)
          .json({ message: "Usage limit below used count" });
      }
      patch.usageLimit = usageLimit;
    }

    if (req.body?.active !== undefined) {
      patch.active = Boolean(req.body.active);
    }

    const updated = await Voucher.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ voucher: updated });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Voucher code already exists" });
    }
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Invalid voucher id" });

    const deleted = await Voucher.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    return res.status(200).json({ message: "Voucher deleted" });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

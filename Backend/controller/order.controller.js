import mongoose from "mongoose";
import Order from "../model/order.model.js";
import Book from "../model/book.model.js";
import User from "../model/user.model.js";

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export const createOrder = async (req, res) => {
  let reservedAdjusted = [];
  let voucherConsumedAt = null;
  let voucherCodeNormalized = "";
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      invoiceRequested,
      voucherCode,
    } = req.body;

    const userId = req.user.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const normalizedItems = items.map((x) => ({
      bookId: String(x.bookId || "").trim(),
      qty: Number(x.qty),
    }));

    for (const it of normalizedItems) {
      if (!it.bookId) {
        return res.status(400).json({ message: "Invalid order item" });
      }
      if (!Number.isFinite(it.qty) || it.qty < 1) {
        return res.status(400).json({ message: "Invalid item qty" });
      }
    }

    const addr = shippingAddress || {};
    const normalizedAddress = {
      fullName: String(addr.fullName || "").trim(),
      phone: String(addr.phone || "").trim(),
      email: String(addr.email || "").trim(),
      addressLine: String(addr.addressLine || "").trim(),
      ward: String(addr.ward || "").trim(),
      district: String(addr.district || "").trim(),
      city: String(addr.city || "").trim(),
      note: String(addr.note || "").trim(),
    };

    if (
      !normalizedAddress.fullName ||
      !normalizedAddress.phone ||
      !normalizedAddress.addressLine ||
      !normalizedAddress.city
    ) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    const pm = String(paymentMethod || "COD").toUpperCase();
    if (!new Set(["COD", "MOMO", "CARD"]).has(pm)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const rawVoucher = String(voucherCode || "").trim();
    voucherCodeNormalized = rawVoucher ? rawVoucher.toUpperCase() : "";

    // Load books to compute server-side prices/totals.
    const bookIds = normalizedItems.map((x) => x.bookId);
    for (const id of bookIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid bookId" });
      }
    }

    const books = await Book.find({ _id: { $in: bookIds } }).select(
      "name price stock reserved",
    );
    const bookById = new Map(books.map((b) => [b._id.toString(), b]));

    const pricedItems = normalizedItems.map((it) => {
      const b = bookById.get(it.bookId);
      return {
        bookId: it.bookId,
        name: b?.name ? String(b.name) : "",
        price: Number(b?.price),
        qty: it.qty,
      };
    });

    for (const it of pricedItems) {
      if (!it.name) return res.status(400).json({ message: "Book not found" });
      if (!Number.isFinite(it.price) || it.price < 0) {
        return res.status(400).json({ message: "Invalid book price" });
      }
    }

    const subtotal = round2(
      pricedItems.reduce((sum, x) => sum + x.qty * x.price, 0),
    );

    // Inventory check + reserve (compensating on partial failure)
    reservedAdjusted = [];
    for (const it of pricedItems) {
      const updated = await Book.findOneAndUpdate(
        {
          _id: it.bookId,
          $expr: {
            $gte: [{ $subtract: ["$stock", "$reserved"] }, it.qty],
          },
        },
        { $inc: { reserved: it.qty } },
        { new: true },
      );

      if (!updated) {
        for (const done of reservedAdjusted) {
          await Book.findByIdAndUpdate(done.bookId, {
            $inc: { reserved: -done.qty },
          });
        }
        return res.status(400).json({
          message: `Not enough stock for: ${it.name}`,
        });
      }
      reservedAdjusted.push({ bookId: it.bookId, qty: it.qty });
    }

    let appliedDiscountPercent = 0;
    let discountAmount = 0;
    if (voucherCodeNormalized) {
      const now = new Date();
      const updatedUser = await User.findOneAndUpdate(
        {
          _id: userId,
          "voucher.code": voucherCodeNormalized,
          "voucher.usedAt": null,
          "voucher.expiresAt": { $gt: now },
        },
        { $set: { "voucher.usedAt": now } },
        { new: true },
      ).select("voucher.discountPercent voucher.code voucher.usedAt");

      if (!updatedUser) {
        for (const done of reservedAdjusted) {
          await Book.findByIdAndUpdate(done.bookId, {
            $inc: { reserved: -done.qty },
          });
        }
        return res.status(400).json({ message: "Invalid voucher" });
      }

      voucherConsumedAt = updatedUser.voucher?.usedAt || now;
      appliedDiscountPercent = Number(
        updatedUser.voucher?.discountPercent || 5,
      );
      if (
        !Number.isFinite(appliedDiscountPercent) ||
        appliedDiscountPercent <= 0
      ) {
        appliedDiscountPercent = 5;
      }

      discountAmount = round2(subtotal * (appliedDiscountPercent / 100));
      if (discountAmount < 0) discountAmount = 0;
      if (discountAmount > subtotal) discountAmount = subtotal;
    }

    const totalNumber = round2(subtotal - discountAmount);

    const order = await Order.create({
      userId,
      items: pricedItems,
      subtotal,
      discountPercent: appliedDiscountPercent,
      discountAmount,
      voucherCode: voucherCodeNormalized,
      total: totalNumber,
      shippingAddress: normalizedAddress,
      paymentMethod: pm,
      paymentStatus: pm === "COD" ? "unpaid" : "pending",
      invoiceRequested: Boolean(invoiceRequested),
      status: "placed",
    });

    return res.status(201).json({ message: "Order created", order });
  } catch (error) {
    // Best-effort rollback if inventory was reserved but order creation failed.
    try {
      if (Array.isArray(reservedAdjusted) && reservedAdjusted.length) {
        for (const done of reservedAdjusted) {
          await Book.findByIdAndUpdate(done.bookId, {
            $inc: { reserved: -done.qty },
          });
        }
      }
    } catch (rollbackErr) {
      console.log("Rollback error: " + rollbackErr.message);
    }

    // Best-effort rollback for consumed voucher
    try {
      if (voucherCodeNormalized && voucherConsumedAt) {
        await User.updateOne(
          {
            _id: req.user?.userId,
            "voucher.code": voucherCodeNormalized,
            "voucher.usedAt": voucherConsumedAt,
          },
          { $set: { "voucher.usedAt": null } },
        );
      }
    } catch (voucherRollbackErr) {
      console.log("Voucher rollback error: " + voucherRollbackErr.message);
    }
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 200);
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(Number.isFinite(limit) ? limit : 200)
      .populate("userId", "fullname email");
    return res.status(200).json(orders);
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isAdmin = req.user?.role === "admin";
    if (!isAdmin && order.userId?.toString() !== req.user?.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }
    if (order.paymentStatus === "paid") {
      return res
        .status(400)
        .json({ message: "Paid order cannot be cancelled" });
    }

    if (Array.isArray(order.items) && order.items.length) {
      for (const it of order.items) {
        await Book.findByIdAndUpdate(it.bookId, {
          $inc: { reserved: -Number(it.qty || 0) },
        });
      }
    }

    order.status = "cancelled";
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "failed";
    }
    await order.save();

    return res.status(200).json({ message: "Order cancelled", order });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const nextStatus = String(req.body?.status || "")
      .trim()
      .toLowerCase();
    const nextPayment = String(req.body?.paymentStatus || "")
      .trim()
      .toLowerCase();

    if (nextStatus && !["placed", "paid", "cancelled"].includes(nextStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (
      nextPayment &&
      !["unpaid", "pending", "paid", "failed"].includes(nextPayment)
    ) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    if (nextStatus === "cancelled") {
      if (order.paymentStatus === "paid") {
        return res
          .status(400)
          .json({ message: "Paid order cannot be cancelled" });
      }
      if (Array.isArray(order.items) && order.items.length) {
        for (const it of order.items) {
          await Book.findByIdAndUpdate(it.bookId, {
            $inc: { reserved: -Number(it.qty || 0) },
          });
        }
      }
      order.status = "cancelled";
      order.paymentStatus = "failed";
      await order.save();
      return res.status(200).json({ message: "Order cancelled", order });
    }

    const markPaid = nextStatus === "paid" || nextPayment === "paid";
    if (markPaid) {
      if (order.paymentStatus === "paid") {
        return res.status(400).json({ message: "Order already paid" });
      }

      const adjusted = [];
      if (Array.isArray(order.items) && order.items.length) {
        for (const it of order.items) {
          const qty = Number(it.qty || 0);
          if (!Number.isFinite(qty) || qty <= 0) continue;

          const updated = await Book.findOneAndUpdate(
            {
              _id: it.bookId,
              reserved: { $gte: qty },
              stock: { $gte: qty },
            },
            { $inc: { reserved: -qty, stock: -qty } },
            { new: true },
          );

          if (!updated) {
            for (const done of adjusted) {
              await Book.findByIdAndUpdate(done.bookId, {
                $inc: { reserved: done.qty, stock: done.qty },
              });
            }
            return res.status(400).json({
              message: "Not enough stock to mark paid",
            });
          }
          adjusted.push({ bookId: it.bookId, qty });
        }
      }

      order.paymentStatus = "paid";
      order.status = "paid";
      await order.save();
      return res.status(200).json({ message: "Order paid", order });
    }

    if (nextStatus) order.status = nextStatus;
    if (nextPayment) order.paymentStatus = nextPayment;
    await order.save();

    return res.status(200).json({ message: "Order updated", order });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

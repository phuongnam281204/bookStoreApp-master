import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../model/order.model.js";
import Book from "../model/book.model.js";
import Voucher from "../model/voucher.model.js";

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const getVnpayConfig = () => {
  const tmnCode = String(process.env.VNPAY_TMN_CODE || "").trim();
  const hashSecret = String(process.env.VNPAY_HASH_SECRET || "").trim();
  const vnpUrl = String(process.env.VNPAY_URL || "").trim();
  const returnUrl = String(process.env.VNPAY_RETURN_URL || "").trim();
  const ipnUrl = String(process.env.VNPAY_IPN_URL || "").trim();
  const frontendOrigin = String(
    process.env.CORS_ORIGIN || "http://localhost:5173",
  ).trim();

  return {
    tmnCode,
    hashSecret,
    vnpUrl,
    returnUrl,
    ipnUrl,
    frontendOrigin,
    ok: Boolean(tmnCode && hashSecret && vnpUrl && returnUrl),
  };
};

const formatVnpDate = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};

const sortVnpParams = (params) => {
  const sorted = {};
  const keys = Object.keys(params).sort();
  for (const key of keys) {
    sorted[key] = encodeURIComponent(String(params[key])).replace(/%20/g, "+");
  }
  return sorted;
};

const buildQueryString = (params) =>
  Object.keys(params)
    .map((k) => `${k}=${params[k]}`)
    .join("&");

const signVnpParams = (params, secret) => {
  const sorted = sortVnpParams(params);
  const signData = buildQueryString(sorted);
  const hash = crypto
    .createHmac("sha512", secret)
    .update(signData)
    .digest("hex");
  return { hash, signData, sorted };
};

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  const raw = req.socket?.remoteAddress || "127.0.0.1";
  if (raw === "::1" || raw === "::ffff:127.0.0.1") return "127.0.0.1";
  return raw;
};

const markOrderPaid = async (order) => {
  if (order.paymentStatus === "paid") return { ok: true, order };

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
        { $inc: { reserved: -qty, stock: -qty, soldCount: 1 } },
        { new: true },
      );

      if (!updated) {
        for (const done of adjusted) {
          await Book.findByIdAndUpdate(done.bookId, {
            $inc: { reserved: done.qty, stock: done.qty },
          });
        }
        return { ok: false, message: "Not enough stock to mark paid" };
      }
      adjusted.push({ bookId: it.bookId, qty });
    }
  }

  order.paymentStatus = "paid";
  order.status = "paid";
  await order.save();
  return { ok: true, order };
};

const rollbackVoucherUse = async (voucherCode) => {
  const code = String(voucherCode || "")
    .trim()
    .toUpperCase();
  if (!code) return;
  await Voucher.updateOne(
    { code, usedCount: { $gt: 0 } },
    { $inc: { usedCount: -1 } },
  );
};

const rollbackOrderPayment = async (order) => {
  if (!order) return;
  if (order.paymentStatus === "paid") return;

  if (Array.isArray(order.items) && order.items.length) {
    for (const it of order.items) {
      const qty = Number(it.qty || 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;
      await Book.findByIdAndUpdate(it.bookId, {
        $inc: { reserved: -qty },
      });
    }
  }

  if (order.voucherCode) {
    await rollbackVoucherUse(order.voucherCode);
  }

  order.paymentStatus = "failed";
  order.status = "cancelled";
  await order.save();
};

const createVnpayPaymentUrl = (order, req) => {
  const config = getVnpayConfig();
  if (!config.ok) return null;

  const now = new Date();
  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: Math.round(Number(order.total) * 100),
    vnp_CurrCode: "VND",
    vnp_TxnRef: order._id.toString(),
    vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: getClientIp(req),
    vnp_CreateDate: formatVnpDate(now),
    vnp_ExpireDate: formatVnpDate(new Date(now.getTime() + 15 * 60 * 1000)),
  };

  const signed = signVnpParams(params, config.hashSecret);
  const query = buildQueryString(
    sortVnpParams({
      ...params,
      vnp_SecureHashType: "HmacSHA512",
      vnp_SecureHash: signed.hash,
    }),
  );

  if (String(process.env.VNPAY_DEBUG || "").toLowerCase() === "true") {
    console.log("[VNPAY] params:", params);
    console.log("[VNPAY] signData:", signed.signData);
    console.log("[VNPAY] secureHash:", signed.hash);
  }
  return `${config.vnpUrl}?${query}`;
};

const verifyVnpaySignature = (query, secret) => {
  const params = { ...query };
  const secureHash = String(params.vnp_SecureHash || "");
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;
  if (!secureHash) return false;
  const expected = signVnpParams(params, secret).hash;
  return secureHash.toLowerCase() === expected.toLowerCase();
};

export const createOrder = async (req, res) => {
  let reservedAdjusted = [];
  let voucherCodeNormalized = "";
  let voucherUsedIncremented = false;
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
    if (!new Set(["COD", "MOMO", "CARD", "VNPAY"]).has(pm)) {
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
      const voucher = await Voucher.findOneAndUpdate(
        {
          code: voucherCodeNormalized,
          active: true,
          $and: [
            { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
            {
              $or: [
                { usageLimit: null },
                { usageLimit: { $exists: false } },
                { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
              ],
            },
          ],
        },
        { $inc: { usedCount: 1 } },
        { new: true },
      ).select("code discountPercent expiresAt usedCount usageLimit");

      if (!voucher) {
        for (const done of reservedAdjusted) {
          await Book.findByIdAndUpdate(done.bookId, {
            $inc: { reserved: -done.qty },
          });
        }
        return res.status(400).json({ message: "Invalid voucher" });
      }

      voucherUsedIncremented = true;
      appliedDiscountPercent = Number(voucher.discountPercent || 0);
      if (
        !Number.isFinite(appliedDiscountPercent) ||
        appliedDiscountPercent < 0
      ) {
        appliedDiscountPercent = 0;
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

    const paymentUrl =
      pm === "VNPAY" ? createVnpayPaymentUrl(order, req) : null;
    if (pm === "VNPAY" && !paymentUrl) {
      await Order.findByIdAndDelete(order._id);
      if (Array.isArray(reservedAdjusted) && reservedAdjusted.length) {
        for (const done of reservedAdjusted) {
          await Book.findByIdAndUpdate(done.bookId, {
            $inc: { reserved: -done.qty },
          });
        }
      }
      if (voucherCodeNormalized && voucherUsedIncremented) {
        await rollbackVoucherUse(voucherCodeNormalized);
      }
      return res.status(500).json({ message: "Payment gateway unavailable" });
    }

    return res
      .status(201)
      .json({ message: "Order created", order, paymentUrl });
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
      if (voucherCodeNormalized && voucherUsedIncremented) {
        await rollbackVoucherUse(voucherCodeNormalized);
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
    if (order.voucherCode) {
      await rollbackVoucherUse(order.voucherCode);
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
      if (order.voucherCode) {
        await rollbackVoucherUse(order.voucherCode);
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

      const result = await markOrderPaid(order);
      if (!result.ok) {
        return res.status(400).json({ message: result.message });
      }

      return res
        .status(200)
        .json({ message: "Order paid", order: result.order });
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

export const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
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

    return res.status(200).json({ order });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const vnpayReturn = async (req, res) => {
  const config = getVnpayConfig();
  const frontend = `${config.frontendOrigin.replace(/\/$/, "")}/payment-result`;
  if (!config.ok) {
    return res.redirect(`${frontend}?payment=failed&reason=config`);
  }

  const query = req.query || {};
  const txnRef = String(query.vnp_TxnRef || "").trim();
  if (!verifyVnpaySignature(query, config.hashSecret)) {
    return res.redirect(`${frontend}?payment=failed&reason=signature`);
  }
  if (!txnRef || !mongoose.Types.ObjectId.isValid(txnRef)) {
    return res.redirect(`${frontend}?payment=failed&reason=order`);
  }

  const order = await Order.findById(txnRef);
  if (!order) {
    return res.redirect(`${frontend}?payment=failed&reason=order`);
  }

  const amount = Number(query.vnp_Amount || 0);
  const expectedAmount = Math.round(Number(order.total) * 100);
  if (!Number.isFinite(amount) || amount !== expectedAmount) {
    await rollbackOrderPayment(order);
    return res.redirect(`${frontend}?payment=failed&reason=amount`);
  }

  const isSuccess =
    query.vnp_ResponseCode === "00" && query.vnp_TransactionStatus === "00";

  if (!isSuccess) {
    await rollbackOrderPayment(order);
    return res.redirect(`${frontend}?payment=failed&reason=response`);
  }

  const result = await markOrderPaid(order);
  if (!result.ok) {
    await rollbackOrderPayment(order);
    return res.redirect(`${frontend}?payment=failed&reason=stock`);
  }

  return res.redirect(`${frontend}?payment=success&orderId=${order._id}`);
};

export const vnpayIpn = async (req, res) => {
  const config = getVnpayConfig();
  if (!config.ok) {
    return res.status(200).json({ RspCode: "97", Message: "Config error" });
  }

  const query = req.query || {};
  if (!verifyVnpaySignature(query, config.hashSecret)) {
    return res.status(200).json({ RspCode: "97", Message: "Invalid hash" });
  }

  const txnRef = String(query.vnp_TxnRef || "").trim();
  if (!txnRef || !mongoose.Types.ObjectId.isValid(txnRef)) {
    return res.status(200).json({ RspCode: "01", Message: "Order not found" });
  }

  const order = await Order.findById(txnRef);
  if (!order) {
    return res.status(200).json({ RspCode: "01", Message: "Order not found" });
  }

  const amount = Number(query.vnp_Amount || 0);
  const expectedAmount = Math.round(Number(order.total) * 100);
  if (!Number.isFinite(amount) || amount !== expectedAmount) {
    await rollbackOrderPayment(order);
    return res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
  }

  const isSuccess =
    query.vnp_ResponseCode === "00" && query.vnp_TransactionStatus === "00";
  if (!isSuccess) {
    await rollbackOrderPayment(order);
    return res.status(200).json({ RspCode: "02", Message: "Failed" });
  }

  if (order.paymentStatus === "paid") {
    return res.status(200).json({ RspCode: "00", Message: "OK" });
  }

  const result = await markOrderPaid(order);
  if (!result.ok) {
    await rollbackOrderPayment(order);
    return res.status(200).json({ RspCode: "05", Message: "Stock error" });
  }

  return res.status(200).json({ RspCode: "00", Message: "OK" });
};

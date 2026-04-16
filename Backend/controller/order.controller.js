import mongoose from "mongoose";
import Order from "../model/order.model.js";

export const createOrder = async (req, res) => {
  try {
    const { items, total } = req.body;

    const userId = req.user.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const normalizedItems = items.map((x) => ({
      bookId: String(x.bookId || "").trim(),
      name: String(x.name || "").trim(),
      price: Number(x.price),
      qty: Number(x.qty),
    }));

    for (const it of normalizedItems) {
      if (!it.bookId || !it.name) {
        return res.status(400).json({ message: "Invalid order item" });
      }
      if (!Number.isFinite(it.price) || it.price < 0) {
        return res.status(400).json({ message: "Invalid item price" });
      }
      if (!Number.isFinite(it.qty) || it.qty < 1) {
        return res.status(400).json({ message: "Invalid item qty" });
      }
    }

    const totalNumber = Number(total);
    if (!Number.isFinite(totalNumber) || totalNumber < 0) {
      return res.status(400).json({ message: "Invalid total" });
    }

    const order = await Order.create({
      userId,
      items: normalizedItems,
      total: totalNumber,
      status: "placed",
    });

    return res.status(201).json({ message: "Order created", order });
  } catch (error) {
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

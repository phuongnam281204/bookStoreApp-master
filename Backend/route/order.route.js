import express from "express";
import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrdersByUser,
  updateOrderStatus,
} from "../controller/order.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, createOrder);
router.post("/:id/cancel", requireAuth, cancelOrder);
router.get("/", requireAuth, requireAdmin, getAllOrders);
router.patch("/:id/status", requireAuth, requireAdmin, updateOrderStatus);
router.get("/my", requireAuth, getMyOrders);
router.get("/user/:userId", requireAuth, requireAdmin, getOrdersByUser);

export default router;

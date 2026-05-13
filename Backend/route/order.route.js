import express from "express";
import {
  cancelOrder,
  createOrder,
  getOrderDetail,
  getAllOrders,
  getMyOrders,
  getOrdersByUser,
  updateOrderStatus,
  vnpayIpn,
  vnpayReturn,
} from "../controller/order.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, createOrder);
router.get("/vnpay/return", vnpayReturn);
router.get("/vnpay/ipn", vnpayIpn);
router.post("/:id/cancel", requireAuth, cancelOrder);
router.get("/detail/:id", requireAuth, getOrderDetail);
router.get("/", requireAuth, requireAdmin, getAllOrders);
router.patch("/:id/status", requireAuth, requireAdmin, updateOrderStatus);
router.get("/my", requireAuth, getMyOrders);
router.get("/user/:userId", requireAuth, requireAdmin, getOrdersByUser);

export default router;

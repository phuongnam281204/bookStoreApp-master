import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrdersByUser,
} from "../controller/order.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, createOrder);
router.get("/my", requireAuth, getMyOrders);
router.get("/user/:userId", requireAuth, requireAdmin, getOrdersByUser);

export default router;

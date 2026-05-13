import express from "express";
import {
  createVoucher,
  deleteVoucher,
  listVouchers,
  updateVoucher,
  validateVoucher,
} from "../controller/voucher.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/validate", validateVoucher);
router.get("/", requireAuth, requireAdmin, listVouchers);
router.post("/", requireAuth, requireAdmin, createVoucher);
router.patch("/:id", requireAuth, requireAdmin, updateVoucher);
router.delete("/:id", requireAuth, requireAdmin, deleteVoucher);

export default router;

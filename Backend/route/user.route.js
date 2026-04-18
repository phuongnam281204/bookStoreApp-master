import express from "express";
import {
  deleteUser,
  forgotPassword,
  getMyVoucher,
  listUsers,
  login,
  logout,
  me,
  resetPassword,
  signup,
  updateUserRole,
  validateMyVoucher,
} from "../controller/user.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, me);

router.get("/voucher/my", requireAuth, getMyVoucher);
router.post("/voucher/validate", requireAuth, validateMyVoucher);

router.get("/", requireAuth, requireAdmin, listUsers);
router.patch("/:id/role", requireAuth, requireAdmin, updateUserRole);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);

export default router;

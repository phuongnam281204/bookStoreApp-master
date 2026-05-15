import express from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
  getBestSellers,
  getBookReviews,
  getInventoryLogs,
  getMyBookReview,
  updateBook,
  updateInventory,
  upsertBookReview,
} from "../controller/book.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getBooks);
router.get("/bestsellers", getBestSellers);
router.get("/:id/inventory-logs", requireAuth, requireAdmin, getInventoryLogs);
router.get("/:id/reviews", getBookReviews);
router.get("/:id/reviews/me", requireAuth, getMyBookReview);
router.post("/:id/reviews", requireAuth, upsertBookReview);
router.get("/:id", getBookById);
router.post("/", requireAuth, requireAdmin, createBook);
router.put("/:id", requireAuth, requireAdmin, updateBook);
router.post("/:id/inventory", requireAuth, requireAdmin, updateInventory);
router.delete("/:id", requireAuth, requireAdmin, deleteBook);

export default router;

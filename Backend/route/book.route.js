import express from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
  updateBook,
} from "../controller/book.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", requireAuth, requireAdmin, createBook);
router.put("/:id", requireAuth, requireAdmin, updateBook);
router.delete("/:id", requireAuth, requireAdmin, deleteBook);

export default router;

import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
  updateBook,
} from "../controller/book.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", requireAuth, requireAdmin, upload.single("image"), createBook);
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  updateBook,
);
router.delete("/:id", requireAuth, requireAdmin, deleteBook);

export default router;

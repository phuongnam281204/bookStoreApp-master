import mongoose from "mongoose";
import Book from "../model/book.model.js";
import InventoryLog from "../model/inventoryLog.model.js";
import Order from "../model/order.model.js";
import Review from "../model/review.model.js";

const isValidUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
};

const normalizeRating = (value) => {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return null;
  if (rating < 1 || rating > 5) return null;
  return rating;
};

export const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    return res.status(200).json(books);
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createBook = async (req, res) => {
  try {
    const {
      name,
      price,
      quantity,
      stock,
      reserved,
      lowStockThreshold,
      category,
      genres,
      ageGroup,
      image,
      images,
      title,
      supplier,
      author,
      translator,
      publisher,
      publishYear,
      weightGr,
      packageSize,
      pages,
    } = req.body;

    const parseImagesField = (value) => {
      if (Array.isArray(value)) {
        return value.map((v) => String(v || "").trim()).filter(Boolean);
      }
      const raw = String(value || "").trim();
      if (!raw) return [];
      if (raw.startsWith("[")) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.map((v) => String(v || "").trim()).filter(Boolean);
          }
        } catch (err) {
          return [];
        }
      }
      return raw
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    };

    const bodyImage = String(image || "").trim();
    const bodyImages = parseImagesField(images);

    if (!bodyImage || !isValidUrl(bodyImage)) {
      return res.status(400).json({ message: "Main image URL is required" });
    }
    if (bodyImages.some((img) => !isValidUrl(img))) {
      return res.status(400).json({ message: "Invalid gallery image URL" });
    }

    const book = await Book.create({
      name: String(name || "").trim(),
      price: Number(price),
      quantity:
        quantity === undefined || quantity === null || quantity === ""
          ? 0
          : Number(quantity),
      stock:
        stock === undefined || stock === null || stock === ""
          ? quantity === undefined || quantity === null || quantity === ""
            ? 0
            : Number(quantity)
          : Number(stock),
      reserved:
        reserved === undefined || reserved === null || reserved === ""
          ? 0
          : Number(reserved),
      lowStockThreshold:
        lowStockThreshold === undefined ||
        lowStockThreshold === null ||
        lowStockThreshold === ""
          ? 5
          : Number(lowStockThreshold),
      category: String(category || "").trim(),
      genres: Array.isArray(genres)
        ? genres.map((g) => String(g || "").trim()).filter(Boolean)
        : String(genres || "")
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean),
      ageGroup: String(ageGroup || "").trim(),
      image: bodyImage,
      images: bodyImages,
      title: String(title || "").trim(),
      supplier: String(supplier || "").trim(),
      author: String(author || "").trim(),
      translator: String(translator || "").trim(),
      publisher: String(publisher || "").trim(),
      publishYear:
        publishYear === undefined || publishYear === null || publishYear === ""
          ? 0
          : Number(publishYear),
      weightGr:
        weightGr === undefined || weightGr === null || weightGr === ""
          ? 0
          : Number(weightGr),
      packageSize: String(packageSize || "").trim(),
      pages:
        pages === undefined || pages === null || pages === ""
          ? 0
          : Number(pages),
    });

    return res.status(201).json({ message: "Book created", book });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const parseImagesField = (value) => {
      if (Array.isArray(value)) {
        return value.map((v) => String(v || "").trim()).filter(Boolean);
      }
      const raw = String(value || "").trim();
      if (!raw) return [];
      if (raw.startsWith("[")) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.map((v) => String(v || "").trim()).filter(Boolean);
          }
        } catch (err) {
          return [];
        }
      }
      return raw
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    };

    const updates = {};
    for (const key of [
      "name",
      "price",
      "quantity",
      "stock",
      "reserved",
      "lowStockThreshold",
      "category",
      "genres",
      "ageGroup",
      "image",
      "images",
      "title",
      "supplier",
      "author",
      "translator",
      "publisher",
      "publishYear",
      "weightGr",
      "packageSize",
      "pages",
    ]) {
      if (!Object.prototype.hasOwnProperty.call(req.body, key)) continue;

      if (
        key === "price" ||
        key === "quantity" ||
        key === "stock" ||
        key === "reserved" ||
        key === "lowStockThreshold" ||
        key === "publishYear" ||
        key === "weightGr" ||
        key === "pages"
      ) {
        const raw = req.body[key];
        updates[key] =
          raw === "" || raw === null || raw === undefined ? 0 : Number(raw);
        continue;
      }

      if (key === "image") {
        const trimmed = String(req.body[key] || "").trim();
        if (trimmed) {
          if (!isValidUrl(trimmed)) {
            return res.status(400).json({ message: "Invalid main image URL" });
          }
          updates.image = trimmed;
        }
        continue;
      }

      if (key === "images") {
        const parsedImages = parseImagesField(req.body[key]);
        if (parsedImages.some((img) => !isValidUrl(img))) {
          return res.status(400).json({ message: "Invalid gallery image URL" });
        }
        updates.images = parsedImages;
        continue;
      }

      if (key === "genres") {
        const parsedGenres = Array.isArray(req.body[key])
          ? req.body[key]
          : String(req.body[key] || "")
              .split(",")
              .map((g) => g.trim())
              .filter(Boolean);
        updates.genres = parsedGenres.map((g) => String(g || "").trim());
        continue;
      }

      updates[key] = String(req.body[key] || "").trim();
    }

    Object.assign(book, updates);
    await book.save();

    return res.status(200).json({ message: "Book updated", book });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await Book.findByIdAndDelete(id);

    return res.status(200).json({ message: "Book deleted" });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const { type, quantity, note } = req.body;
    const qty = Number(quantity);
    if (!type || !Number.isFinite(qty) || qty < 0) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const stock = Number(book.stock || 0);
    const reserved = Number(book.reserved || 0);
    const available = Math.max(0, stock - reserved);

    if (type === "in") {
      book.stock = stock + qty;
    } else if (type === "out") {
      if (qty > stock) {
        return res.status(400).json({ message: "Not enough stock" });
      }
      book.stock = stock - qty;
    } else if (type === "reserve") {
      if (qty > available) {
        return res.status(400).json({ message: "Not enough available" });
      }
      book.reserved = reserved + qty;
    } else if (type === "release") {
      if (qty > reserved) {
        return res.status(400).json({ message: "Not enough reserved" });
      }
      book.reserved = reserved - qty;
    } else if (type === "adjust") {
      book.stock = qty;
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    await book.save();

    await InventoryLog.create({
      bookId: book._id,
      type,
      quantity: qty,
      note: String(note || "").trim(),
      createdBy: req.user?.userId,
    });

    return res.status(200).json({ message: "Inventory updated", book });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getInventoryLogs = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const limit = Number(req.query.limit || 30);
    const logs = await InventoryLog.find({ bookId: id })
      .sort({ createdAt: -1 })
      .limit(Number.isFinite(limit) ? limit : 30);
    return res.status(200).json(logs);
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookReviews = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const limit = Number(req.query.limit || 20);
    const reviews = await Review.find({ bookId: id })
      .sort({ createdAt: -1 })
      .limit(Number.isFinite(limit) ? limit : 20)
      .populate("userId", "fullname");

    return res.status(200).json(reviews);
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyBookReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const review = await Review.findOne({
      bookId: id,
      userId: req.user?.userId,
    }).populate("userId", "fullname");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json(review);
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const upsertBookReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const rating = normalizeRating(req.body?.rating);
    if (!rating) {
      return res.status(400).json({ message: "Invalid rating" });
    }

    const comment = String(req.body?.comment || "").trim();

    const book = await Book.findById(id).select("_id");
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (req.user?.role !== "admin") {
      const hasPurchased = await Order.findOne({
        userId: req.user?.userId,
        "items.bookId": id,
        status: { $ne: "cancelled" },
      }).select("_id");

      if (!hasPurchased) {
        return res
          .status(403)
          .json({ message: "Bạn cần mua sách trước khi đánh giá" });
      }
    }

    let review = await Review.findOne({
      bookId: id,
      userId: req.user?.userId,
    });

    if (review) {
      const delta = rating - Number(review.rating || 0);
      review.rating = rating;
      review.comment = comment;
      await review.save();

      if (delta !== 0) {
        await Book.findByIdAndUpdate(id, { $inc: { ratingSum: delta } });
      }
    } else {
      review = await Review.create({
        bookId: id,
        userId: req.user?.userId,
        rating,
        comment,
      });
      await Book.findByIdAndUpdate(id, {
        $inc: { ratingSum: rating, ratingCount: 1 },
      });
    }

    const updated = await Book.findById(id).select("ratingSum ratingCount");
    const avg = updated?.ratingCount
      ? Number((updated.ratingSum / updated.ratingCount).toFixed(2))
      : 0;
    await Book.findByIdAndUpdate(id, { rating: avg });

    return res.status(200).json({
      message: "Review saved",
      review,
      rating: avg,
      ratingCount: updated?.ratingCount || 0,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

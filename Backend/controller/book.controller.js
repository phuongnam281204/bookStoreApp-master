import mongoose from "mongoose";
import Book from "../model/book.model.js";

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
      category,
      image,
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

    const uploadedImage = req.file ? `/uploads/${req.file.filename}` : "";
    const imageValue = uploadedImage || String(image || "").trim();

    const book = await Book.create({
      name: String(name || "").trim(),
      price: Number(price),
      quantity:
        quantity === undefined || quantity === null || quantity === ""
          ? 0
          : Number(quantity),
      category: String(category || "").trim(),
      image: imageValue,
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

    const updates = {};
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }
    for (const key of [
      "name",
      "price",
      "quantity",
      "category",
      "image",
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
        if (trimmed) updates.image = trimmed;
        continue;
      }

      updates[key] = String(req.body[key] || "").trim();
    }

    const book = await Book.findByIdAndUpdate(id, updates, { new: true });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

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

    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({ message: "Book deleted" });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

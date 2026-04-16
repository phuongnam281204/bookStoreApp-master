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
    const { name, price, category, image, title } = req.body;

    const book = await Book.create({
      name: String(name || "").trim(),
      price: Number(price),
      category: String(category || "").trim(),
      image: String(image || "").trim(),
      title: String(title || "").trim(),
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
    for (const key of ["name", "price", "category", "image", "title"]) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] =
          key === "price"
            ? Number(req.body[key])
            : String(req.body[key] || "").trim();
      }
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

import mongoose from "mongoose";

const bookSchema = mongoose.Schema({
  name: String,
  price: Number,
  quantity: { type: Number, default: 0, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  reserved: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5, min: 0 },
  category: String,
  image: String,
  images: [String],
  title: String,
  supplier: String,
  author: String,
  translator: String,
  publisher: String,
  publishYear: Number,
  weightGr: Number,
  packageSize: String,
  pages: Number,
});
const Book = mongoose.model("Book", bookSchema);

export default Book;

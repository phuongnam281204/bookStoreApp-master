import mongoose from "mongoose";

const bookSchema = mongoose.Schema({
  name: String,
  price: Number,
  quantity: { type: Number, default: 0, min: 0 },
  category: String,
  image: String,
  title: String,
});
const Book = mongoose.model("Book", bookSchema);

export default Book;

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true },
);

reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;

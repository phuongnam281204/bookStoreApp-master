import mongoose from "mongoose";

const inventoryLogSchema = mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    type: {
      type: String,
      enum: ["in", "out", "reserve", "release", "adjust"],
      required: true,
    },
    quantity: { type: Number, required: true },
    note: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

const InventoryLog = mongoose.model("InventoryLog", inventoryLogSchema);

export default InventoryLog;

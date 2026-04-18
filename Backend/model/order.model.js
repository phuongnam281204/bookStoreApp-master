import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0, min: 0 },
    voucherCode: { type: String, default: "" },
    total: { type: Number, required: true, min: 0 },

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: "" },
      addressLine: { type: String, required: true },
      ward: { type: String, default: "" },
      district: { type: String, default: "" },
      city: { type: String, required: true },
      note: { type: String, default: "" },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "MOMO", "CARD"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed"],
      default: "unpaid",
    },

    invoiceRequested: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["placed", "paid", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;

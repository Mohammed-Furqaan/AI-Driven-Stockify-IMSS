import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending",
  },
  orderDate: { type: Date, default: Date.now },
});

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;

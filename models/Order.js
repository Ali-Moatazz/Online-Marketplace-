const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1
        }
      }
    ],
    totalPrice: {
      type: Number,
      required: false
    },
    status: {
  type: String,
  enum: ["pending", "shipping", "delivered", "cancelled"], // allowed values
  required: true,                                        // make it mandatory
  default: "pending"                                     // default value
}

  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

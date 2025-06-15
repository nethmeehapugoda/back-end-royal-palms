import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "LKR",
  },
  features: [
    {
      label: { type: String, required: true },
      icon: { type: String, required: true },
    },
  ],
  popular: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Category", categorySchema);

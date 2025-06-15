import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
    unique: true,
  },
  images: [
    {
      url: { type: String, required: true },
      filename: { type: String, required: true },
    },
  ],
  status: {
    type: String,
    enum: ["available", "occupied", "maintenance"],
    default: "available",
  },
});

const Room = mongoose.model("Room", roomSchema);
export default Room;

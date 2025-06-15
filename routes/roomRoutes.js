// RoomRoutes.js
import express from "express";
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from "../controllers/RoomControllers.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  uploadMultiple,
  handleUploadError,
} from "../middlewares/uplodeMiddleware.js";

const router = express.Router();

// Routes with upload middleware and error handling
router.post("/", protect, uploadMultiple, handleUploadError, createRoom);
router.get("/", getRooms);
router.get("/:id", getRoomById);
router.put("/:id", protect, uploadMultiple, handleUploadError, updateRoom);
router.delete("/:id", protect, deleteRoom);

export default router;

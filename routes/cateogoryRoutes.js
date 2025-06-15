import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/CategoryControllers.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;

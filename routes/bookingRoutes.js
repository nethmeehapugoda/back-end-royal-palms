import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  checkRoomAvailability,
  getUserBookings,
  getMonthlyRevenue,
} from "../controllers/BookingControllers.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/check-availability", checkRoomAvailability);

// Protected routes - ADD protect middleware to createBooking
router.post("/", protect,  createBooking);
router.get("/", protect, getBookings);
router.get("/user", protect, getUserBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id", protect, updateBooking);
router.delete("/:id", protect, deleteBooking);

// Protected routes - ADD protect middleware to getMonthlyRevenue
router.get("/monthly-revenue", protect, getMonthlyRevenue);
export default router;

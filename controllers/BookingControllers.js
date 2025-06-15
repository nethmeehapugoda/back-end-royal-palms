import Booking from "../models/Bookings.js";
import Room from "../models/Room.js";
import Category from "../models/Category.js";
import { sendPaymentSuccessEmail } from "../utils/email.js";

export const createBooking = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("User from token:", req.user);

    const {
      user,
      room,
      category,
      checkInDate,
      checkOutDate,
      numberOfAdults,
      numberOfChildren,
      totalPrice,
      billing,
    } = req.body;

    // Validate required fields
    if (!room || !category || !checkInDate || !checkOutDate || !billing) {
      return res.status(400).json({
        message: "Missing required fields",
        required: [
          "room",
          "category",
          "checkInDate",
          "checkOutDate",
          "billing",
        ],
      });
    }

    // Validate billing information
    const requiredBillingFields = [
      "fullName",
      "email",
      "address",
      "city",
      "state",
      "zip",
      "cardNumber",
    ];
    const missingBillingFields = requiredBillingFields.filter(
      (field) => !billing[field]
    );

    if (missingBillingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required billing fields",
        missingFields: missingBillingFields,
      });
    }

    // Use authenticated user ID instead of user from request body
    const userId = req.user.id;

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res
        .status(400)
        .json({ message: "Check-in date cannot be in the past" });
    }

    if (checkOut <= checkIn) {
      return res
        .status(400)
        .json({ message: "Check-out date must be after check-in date" });
    }

    // Validate room exists and is available
    const roomExists = await Room.findById(room);
    if (!roomExists) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (roomExists.status !== "available") {
      return res.status(400).json({ message: "Room is not available" });
    }

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check room availability for the selected dates
    const existingBookings = await Booking.find({
      room,
      status: { $ne: "cancelled" },
      $or: [
        {
          checkInDate: { $lte: checkOut },
          checkOutDate: { $gte: checkIn },
        },
      ],
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({
        message: "Room is not available for the selected dates",
        conflictingBookings: existingBookings.length,
      });
    }

    // Validate guest numbers
    const adults = Number.parseInt(numberOfAdults) || 1;
    const children = Number.parseInt(numberOfChildren) || 0;

    if (adults < 1) {
      return res
        .status(400)
        .json({ message: "At least one adult is required" });
    }

    if (adults > 4 || children > 4) {
      return res
        .status(400)
        .json({ message: "Maximum 4 adults and 4 children allowed" });
    }

    // Calculate total price server-side for security
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const calculatedPrice = nights * categoryExists.price;

    // Create booking
    const booking = new Booking({
      user: userId, // Use authenticated user ID
      room,
      category,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfAdults: adults,
      numberOfChildren: children,
      totalPrice: calculatedPrice,
      billing: {
        fullName: billing.fullName.trim(),
        email: billing.email.toLowerCase().trim(),
        address: billing.address.trim(),
        city: billing.city.trim(),
        state: billing.state.trim(),
        zip: billing.zip.trim(),
        cardNumber: billing.cardNumber.replace(/\s/g, ""),
      },
      status: "pending",
    });

    const savedBooking = await booking.save();

    // Populate the saved booking for response
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate("user", "firstName lastName email")
      .populate("room", "roomNumber status")
      .populate("category", "name price description");

    // Send email after booking
    await sendPaymentSuccessEmail({
      to: booking.billing.email,
      name: booking.billing.fullName,
      bookingId: savedBooking._id,
      amount: calculatedPrice,
      details: {
        room: roomExists.roomNumber,
        checkInDate,
        checkOutDate,
        guests: `${adults} Adults, ${children} Children`,
      },
    });

    res.status(201).json({
      message: "Booking created & email sent successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      message: "Server error while creating booking",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const checkRoomAvailability = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.query;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        message: "Room ID, check-in date, and check-out date are required",
      });
    }

    // Validate date format
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    // Check if room exists and is available
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.status !== "available") {
      return res.status(200).json({
        available: false,
        message: "Room is currently not available",
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      room: roomId,
      status: { $ne: "cancelled" },
      $or: [
        {
          checkInDate: { $lte: checkOut },
          checkOutDate: { $gte: checkIn },
        },
      ],
    });

    const available = conflictingBookings.length === 0;

    res.status(200).json({
      available,
      message: available
        ? "Room is available for the selected dates"
        : "Room is not available for the selected dates",
      conflictingBookings: available ? [] : conflictingBookings.length,
    });
  } catch (error) {
    console.error("Availability check error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "firstName lastName email")
      .populate("room", "roomNumber status")
      .populate("category", "name price description")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("room", "roomNumber status")
      .populate("category", "name price description");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking (unless admin)
    if (
      booking.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Get booking by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const updates = req.body;
    const booking = await Booking.findById(req.params.id).populate("room");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking (unless admin)
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("user", "firstName lastName email")
      .populate("room", "roomNumber status")
      .populate("category", "name price description");

    // Update room status based on booking status
    if (updates.status) {
      let roomStatus = "available";
      if (updates.status === "confirmed") {
        roomStatus = "occupied";
      } else if (updates.status === "cancelled") {
        roomStatus = "available";
      }

      await Room.findByIdAndUpdate(booking.room._id, { status: roomStatus });
    }

    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking (unless admin)
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Set room back to available when booking is deleted
    await Room.findByIdAndUpdate(booking.room._id, { status: "available" });

    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId })
      .populate("room", "roomNumber status")
      .populate("category", "name price description")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//monthly revenue
export const getMonthlyRevenue = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "confirmed" });

    const monthlyRevenue = bookings.reduce((acc, booking) => {
      const month = new Date(booking.createdAt).getMonth();
      acc[month] = (acc[month] || 0) + booking.room.price;
      return acc;
    }, {});

    res.status(200).json(monthlyRevenue);
  } catch (error) {
    console.error("Get monthly revenue error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// RoomControllers.js
import Room from "../models/Room.js";
import Category from "../models/Category.js";
import fs from "fs";
import path from "path";

export const createRoom = async (req, res, next) => {
  try {
    const { category, roomNumber, status } = req.body;
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Handle multiple image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
      }));
    }

    const room = new Room({
      category,
      roomNumber,
      images,
      status: status || "available",
    });
    await room.save();
    res.status(201).json({ message: "Room created successfully", room });
  } catch (error) {
    next(error); // Pass to error handling middleware
  }
};

export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().populate("category", "name price");
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "category",
      "name price"
    );
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const { category, roomNumber, status, imagesToDelete } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    // Handle image deletions
    if (imagesToDelete && Array.isArray(imagesToDelete)) {
      imagesToDelete.forEach((filename) => {
        const filePath = path.join("uploads", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      room.images = room.images.filter(
        (img) => !imagesToDelete.includes(img.filename)
      );
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
      }));
      room.images.push(...newImages);
    }

    // Update other fields
    room.category = category || room.category;
    room.roomNumber = roomNumber || room.roomNumber;
    room.status = status || room.status;

    await room.save();
    res.status(200).json({ message: "Room updated successfully", room });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Delete associated images from local storage
    if (room.images && room.images.length > 0) {
      room.images.forEach((img) => {
        const filePath = path.join("uploads", img.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    next(error);
  }
};

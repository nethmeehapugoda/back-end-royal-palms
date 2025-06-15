import User from "../models/User.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/jwtToken.js";

export const register = async (req, res) => {
  const { email, password, Name, Gender, Address, DOB, City, State, Contact, role } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      Name,
      Gender,
      Address,
      DOB,
      City,
      State,
      Contact,
      role,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User register successfully", User: newUser });
  } catch (error) {
    res.status(500).json({ message: "internal server error", error });
  }
};

//get all user
export const getAllUser = async (req, res) => {
  try {
    const user = await User.find();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "internal server error", error });
  }
};

//get user by id
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

//filter user by name
export const filterUserByName = async (req, res) => {
  try {
    const user = await User.find({ name: new RegExp(req.query.name, "i") });
    res.status(200).json(user);
  } catch (error) {
    console.log("error in filter user", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = generateToken(user._id);
    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        Name: user.Name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log("error in login user", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

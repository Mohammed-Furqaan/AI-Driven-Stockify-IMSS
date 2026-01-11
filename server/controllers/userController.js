import User from "../models/User.js";
import bcrypt from "bcrypt";

const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const exUser = await User.findOne({ email });
    if (exUser) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address,
      role,
    });

    await newUser.save();
    return res
      .status(201)
      .json({ success: true, message: "User added successfully" });
  } catch (error) {
    console.error("Error adding User:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching Users:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error in User" });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching User Profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error in getting User Profile",
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, address, password } = req.body;

    const updatedata = { name, email, address };

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedata.password = hashedPassword;
    }

    const user = await User.findByIdAndUpdate(userId, updatedata, {
      new: true,
    }).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Profile updated succesfully", user });
  } catch (error) {
    console.error("Error Updating Profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error in getting User Profile",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCategory = await User.findById(id);
    if (!existingCategory) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await User.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting User: ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export { addUser, getUsers, deleteUser, getUser, updateUserProfile };

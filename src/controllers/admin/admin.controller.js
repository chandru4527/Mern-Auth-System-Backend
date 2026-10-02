// import mongoose from "mongoose";

// import Users from "../../models/users.model.js";
// import asyncHandler from "../../utils/asyncHandler.js";

// const userFields =
//   "name userName email role isActive profileImage mobile address dateOfBirth createdAt";

// // GET /api/admin/users
// export const getAllUsers = asyncHandler(async (req, res) => {
//   const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
//   const limit = Math.min(
//     100,
//     Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
//   );

//   const filter = {};

//   if (req.query.isActive === "true") {
//     filter.isActive = true;
//   } else if (req.query.isActive === "false") {
//     filter.isActive = false;
//   }

//   if (req.query.search?.trim()) {
//     const search = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//     const regex = new RegExp(search, "i");

//     filter.$or = [
//       { name: regex },
//       { userName: regex },
//       { email: regex },
//     ];
//   }

//   const [users, totalUsers] = await Promise.all([
//     Users.find(filter)
//       .select(userFields)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit),
//     Users.countDocuments(filter),
//   ]);

//   return res.status(200).json({
//     success: true,
//     results: {
//       users,
//       pagination: {
//         totalUsers,
//         currentPage: page,
//         totalPages: Math.ceil(totalUsers / limit),
//         limit,
//       },
//     },
//   });
// });

// // GET /api/admin/users/:id
// export const getUserById = asyncHandler(async (req, res) => {
//   if (!mongoose.isValidObjectId(req.params.id)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid user ID",
//     });
//   }

//   const user = await Users.findById(req.params.id).select(userFields);

//   if (!user) {
//     return res.status(404).json({
//       success: false,
//       message: "User not found",
//     });
//   }

//   return res.status(200).json({
//     success: true,
//     results: { user },
//   });
// });

// // PUT /api/admin/users/:id/status
// export const updateUserStatus = asyncHandler(async (req, res) => {
//   const { isActive } = req.body;

//   if (!mongoose.isValidObjectId(req.params.id)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid user ID",
//     });
//   }

//   if (typeof isActive !== "boolean") {
//     return res.status(400).json({
//       success: false,
//       message: "isActive must be true or false",
//     });
//   }

//   if (req.params.id === req.user._id.toString()) {
//     return res.status(400).json({
//       success: false,
//       message: "You cannot deactivate your own account",
//     });
//   }

//   const user = await User.findByIdAndUpdate(
//     req.params.id,
//     { $set: { isActive } },
//     { new: true, runValidators: true }
//   ).select(userFields);

//   if (!user) {
//     return res.status(404).json({
//       success: false,
//       message: "User not found",
//     });
//   }

//   return res.status(200).json({
//     success: true,
//     message: `User ${isActive ? "activated" : "deactivated"} successfully`,
//     data: { user },
//   });
// });

// // DELETE /api/admin/users/:id
// export const deleteUser = asyncHandler(async (req, res) => {
//   if (!mongoose.isValidObjectId(req.params.id)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid user ID",
//     });
//   }

//   if (req.params.id === req.user._id.toString()) {
//     return res.status(400).json({
//       success: false,
//       message: "You cannot delete your own account",
//     });
//   }

//   const user = await User.findByIdAndDelete(req.params.id);

//   if (!user) {
//     return res.status(404).json({
//       success: false,
//       message: "User not found",
//     });
//   }

//   return res.status(200).json({
//     success: true,
//     message: "User deleted successfully",
//   });
// });
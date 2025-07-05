const express = require("express");
const autheRouter = express.Router();
const {
  register,
  login,
  logout,
  forgetPassword,
  resetPassword,
  createUser,
  deleteUser,
  changePassword,
  updateUser,
} = require("../Controller/AuthController");

autheRouter.post("/register", register);
autheRouter.post("/login", login);

autheRouter.post("/logout", logout);
autheRouter.post("/forget-password", forgetPassword);
autheRouter.patch("/reset-password/:token", resetPassword);
autheRouter.post("/create-user", createUser);
autheRouter.delete("/delete-user/:id", deleteUser);
autheRouter.patch("/change-password", changePassword); // No middleware here
autheRouter.patch("/update-user/:id", updateUser);

module.exports = autheRouter;

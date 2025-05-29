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
} = require("../Controller/AuthController");

autheRouter.post("/register", register);

autheRouter.post("/login", login);

autheRouter.post("/logout", logout);
autheRouter.post("/forget-password", forgetPassword);
autheRouter.patch("/reset-password/:token", resetPassword);
autheRouter.post("/create-user", createUser);
autheRouter.delete("/delete-user/:id", deleteUser);

module.exports = autheRouter;

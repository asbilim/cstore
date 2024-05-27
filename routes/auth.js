const { Login, Register } = require("../controllers/auth");
const { body } = require("express-validator");

const express = require("express");
const appRoutes = express.Router();

appRoutes.post(
  "/register/",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("username").not().isEmpty(),
  ],
  Register
);

appRoutes.post(
  "/login/",
  [body("username").not().isEmpty(), body("password").not().isEmpty()],
  Login
);

module.exports = appRoutes;

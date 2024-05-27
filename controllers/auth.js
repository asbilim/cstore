const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const privateKey =
  process.env.JWT_PRIVATE_KEY ||
  fs.readFileSync(path.join(__dirname, "private_key.pem"), "utf8");

const Register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = new User({ username, email, password });
    await user.save();
    res
      .status(201)
      .json({ status: "success", response: "user created successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", response: err.message });
  }
};

const Login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !user.matchPassword(password, user.password)) {
      res.status(403).json({
        status: "error",
        response: "No user found with the fiven credentials",
      });
    }
    const token = jsonwebtoken.sign({ id: user._id }, privateKey, {
      algorithm: "RS512",
      expiresIn: "1d",
    });

    res.status(200).json({ accessToken: token });
  } catch (err) {
    res.status(401).json({ status: "error", response: err.message });
  }
};

module.exports = {
  Register,
  Login,
};

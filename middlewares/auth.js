const jwt = require("jsonwebtoken");

protect = (req, res) => {
  let token;

  if (res.headers && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(500)
      .json({ status: "error", response: "something went wrong" });
  }

  try {
    const decoded = jsonwebtoken.verify(token, process.env.SECRET_KEY);
    req.user = decoded.id;
  } catch (e) {
    res.status(500).json({ status: "error", response: e.message });
  }
};

module.exports = protect;

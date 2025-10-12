const { verifyToken } = require("../utils/jwt");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });

    const decoded = verifyToken(token);

    if (decodedToken) req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
module.exports = { authenticate };

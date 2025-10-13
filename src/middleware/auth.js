const { verifyToken } = require("../utils/jwt");

const extractBearerToken = (headerValue) => {
  if (!headerValue) return null;
  const parts = headerValue.split(" ");
  if (parts.length !== 2) return null;
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return null;
  return token;
};

const authenticate = (req, res, next) => {
  try {
    const authHeaderToken = extractBearerToken(req.headers["authorization"]);
    const cookieToken = req.cookies?.token;
    const token = authHeaderToken || cookieToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { authenticate };

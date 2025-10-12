const jwt = require("jsonwebtoken");
const jwTsecret = process.env.jwt("jwtSecret");

const jwtExpiry = "7d";

/* @param {Object} payload - User data to encode (id, email, role)
 * @returns {string} - Signed JWT token */

const generateToken = (payload) => {
  return jwt.sign(payload, jwTsecret, { expiresIn: jwtExpiry });
};

/* * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded payload with user data
 * @throws {Error} - If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwTsecret);
  } catch (err) {
    throw new Error("Invalid or expired Token");
  }
};

module.exports = { generateToken, verifyToken };

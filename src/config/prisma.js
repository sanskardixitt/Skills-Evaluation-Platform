// Compatibility shim: some controllers import from ../config/prisma
// while others use ../configs/prisma. Prefer the existing one if present.
let prisma;
try {
  prisma = require("../configs/prisma");
} catch (e) {
  prisma = require("../config/prisma");
}

module.exports = prisma;

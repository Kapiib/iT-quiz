const jwt = require('jsonwebtoken');

// Add console logs to debug token verification
const checkJWT = (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("checkJWT: Cookie token", token ? "present" : "missing");
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("checkJWT: Token verified for user ID:", decoded.id);
      req.user = decoded;
    } else {
      console.log("checkJWT: No token found in cookies");
    }
    next();
  } catch (error) {
    console.error("checkJWT: Token verification error:", error.message);
    req.user = null;
    next();
  }
};

module.exports = checkJWT;
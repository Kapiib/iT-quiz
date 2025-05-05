const jwt = require('jsonwebtoken');

const checkJWT = (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = checkJWT;
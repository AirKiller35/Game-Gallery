const jwt = require('jsonwebtoken');

// Middleware function to verify the token sent by the client
module.exports = function(req, res, next) {
  // Get the token from the header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Add the user ID from the token to the request object
    req.user = decoded.user;
    next(); // Proceed to the next middleware or route
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
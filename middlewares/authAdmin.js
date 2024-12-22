const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
require('dotenv').config();

const adminAuth = async (req, res, next) => {
  try {
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader) {
      throw new Error('Authorization header is missing');
    }

    const token = authorizationHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findOne({ _id: decoded._id, 'tokens.tokenAdmin': token });
    if (!admin) {
      throw new Error('Admin not authenticated');
    }

    req.admin = admin; 
    next();
  } catch (error) {
    console.error('Admin authentication error:', error.message);
    res.status(401).send({ error: 'please auth' });
  }
};

module.exports = adminAuth;

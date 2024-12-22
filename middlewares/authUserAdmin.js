const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Admin = require('../models/admin');
require('dotenv').config();
const authUserAdmin = async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '').trim();
      if (!token) {
        throw new Error('Authentication token is missing');
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
  
      // get id of admin where tokenAdmin=token
      const admin = await Admin.findOne({ _id: decoded._id, 'tokens.tokenAdmin': token });
      console.log('Admin document:', admin); 
      if (admin) {
        console.log('Admin authenticated:', admin.email);
        req.admin = admin;
        return next();
      }
  
      
      const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
      if (user) {
        console.log('User authenticated:', user.email);
        req.user = user;
        return next();
      }
  
      throw new Error('Not authorized');
    } catch (error) {
      console.error('Authentication failed:', error.message);
      res.status(401).send({ error: 'please auth' });
    }
  };
  
module.exports = authUserAdmin;

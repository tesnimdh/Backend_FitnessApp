const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tokens: [
        { tokenAdmin: { type: String } }
    ]
});
adminSchema.pre("save", async function (next) {
    const admin = this;
    if (admin.isModified("password")) {
        admin.password = await bcrypt.hash(admin.password, 8);
    }
    next();
});

adminSchema.statics.findByCredentials = async (email, password) => {
    const admin = await Admin.findOne({ email });
    if (!admin) {
        throw new Error("Unable to login: Admin not found");
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        throw new Error("Unable to login: Invalid password");
    }
    return admin;
};
adminSchema.methods.generateAuthToken = async function () {
    const admin = this;
    const tokenAdmin = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRET);
  
    admin.tokens = admin.tokens.concat({ tokenAdmin }); 
    await admin.save();
  
    return tokenAdmin;
  };
  

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;

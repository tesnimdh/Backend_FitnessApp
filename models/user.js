const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userSchema = new Schema({
    image:{ type: String, default: "/assets/images/exercice.png" } ,
    lastname:{ type: String, required: true},
    firstname:{ type: String, required: true},
    weight:[
        {
            value: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        }],
    height:{type: Number, required: true},
    dateOfBirth:{ type: Date, required: true},
    gender:[{ type: String, required: true}],
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tokens: [{ 
        token: { type: String }
    }],
    exercices:[ { type: Schema.Types.ObjectId, ref:"Exercice" }],
});

userSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email }); 
    if (!user) {
        throw new Error('Unable to login: User not found');
    }
    const checks = await bcrypt.compare(password, user.password);
    if (!checks) {
        throw new Error('Unable to login: Invalid password');
    }
    return user;
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET );
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

const User = mongoose.model('User', userSchema, "users");
module.exports = User;
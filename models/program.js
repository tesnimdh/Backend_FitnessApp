const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const programSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    image: { type: String, default: "/assets/images/program.png" },
    owner: {type: Schema.Types.ObjectId, ref: "User"}
});

module.exports = mongoose.model("Program", programSchema);
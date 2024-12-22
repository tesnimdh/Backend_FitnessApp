const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    exercices:[ { type: Schema.Types.ObjectId, ref:"Exercice" }],
    program_id:{type: Schema.Types.ObjectId, ref: "Program"}
});

module.exports = mongoose.model("Session", sessionSchema);
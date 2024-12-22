const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const exerciceSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true, maxLength: 5000 },
    image:[{ type: String, default: "/assets/images/exercice.png" , required:true}] ,
    targetMuscles:[ { type: String, maxLength: 100 ,required:true}],
    sets:[{type: Schema.Types.ObjectId, ref:"Set"}]
});

module.exports = mongoose.model("Exercice", exerciceSchema );


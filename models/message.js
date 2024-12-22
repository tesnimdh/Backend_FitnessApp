const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    user_id: {type:Schema.Types.ObjectId, ref:'User', required:true}
});

module.exports = mongoose.model("Message", messageSchema);
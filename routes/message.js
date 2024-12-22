const express = require("express");
const Message = require("../models/message");
const router = express.Router();

// post message
router.post("/", async (req, res) => {
    const { content, user_id } = req.body;
    try {
        const message = new Message({ content, user_id });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//get all messages
router.get("/", async (req, res) => {
    try {
        const messages = await Message.find().populate('user_id');
        res.status(200).json(messages);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Set = require('../models/set');
const User = require('../models/user');
const Exercice = require('../models/exercice');
const mongoose = require('mongoose');

router.post("/:user_id", async (req, res) => {
  try {
    const { reps, weight, exercice_id } = req.body;

    const { user_id } = req.params;

    const user = await User.findById({ _id: user_id });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const exercice = await Exercice.findById(exercice_id);
    if (!exercice) {
      return res.status(400).json({ error: "Exercie not found" });
    }

    if (!reps || !weight || !exercice_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newSet = new Set({
      reps,
      weight,
      exercice: exercice_id,
      user: user_id,
    });
    await newSet.save();

   // const sets = await Set.find({ user:user_id }).populate("exercice");

    res.status(201).json(newSet);
  } catch (error) {
    console.error("Error creating set:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get('/latest/:exercice_id', async (req, res) => {
  try {
    const { exercice_id } = req.params;

    // Query the latest set for the given exercice_id
    const latestSet = await Set.findOne({ exercice: exercice_id }) // Adjust 'exercice' to match your schema field name
      .sort({ _id: -1 }); // Sort by `_id` in descending order to get the latest document

    if (!latestSet) {
      // If no set is found, return default values
      return res.status(200).json({ reps: 0, weight: 0 });
    }

    // Respond with the latest set
    res.status(200).json(latestSet);
  } catch (error) {
    console.error('Error fetching latest set:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


  router.get("/all/:user_id", async (req, res) => {
    try {
      const { user_id } = req.params;
  
      const sets = await Set.find({ user:user_id }).populate("exercice");
      res.status(200).json(sets);
    } catch (error) {
      console.error("Error fetching latest set:", error.message);
    }
  });
module.exports = router;

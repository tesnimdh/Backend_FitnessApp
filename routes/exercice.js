const express = require("express");
const router = express.Router();
const Exercice = require("../models/exercice");
const Set = require("../models/set");
const auth=require("../middlewares/auth");
const authUserAdmin=require("../middlewares/authUserAdmin");
const Session = require("../models/session");
const {uploadExerciceImages} = require("../multer");
const authAdmin = require("../middlewares/authAdmin");

// Get all exercises
router.get("/",  authUserAdmin , async (req, res) => {
  try {
    if (req.admin) {
      console.log('Admin accessing exercices');
    } else if (req.user) {
      console.log('User accessing exercices');
    }

    const exercices = await Exercice.find();
    res.status(200).json(exercices);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch exercices' });
  }
});


router.post("/" ,async (req, res) => {
    uploadExerciceImages(req, res, async (err) => {
        if (err) {
            console.error("Error uploading images:", err);
            return res.status(400).json({
                message: "Error uploading images",
                error: err.message,
            });
        }
        
        const images = req.files && req.files.length > 0 ? req.files.map((file) => file.path) : ["assets/images/exercice.png"];

        const exerciceData = { ...req.body, image: images};
        const exercice = new Exercice(exerciceData);

        try {
            const newExercice = await exercice.save();
            res.status(201).json({
                message: "Exercice created successfully",
                exercice: newExercice,
            });
        } catch (error) {
            console.error("Error creating exercice:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
});

module.exports = router;
//number of exercices
router.get("/count", authAdmin  , async (req, res) => {
    try {
        const exerciceCount = await Exercice.countDocuments();
        res.json({ exerciceCount });
    } catch (err) {
        console.error("Erreur lors du comptage des exercices :", err);
        res.status(500).json({ message: 'Erreur lors du comptage des exercices', error: err });
    }
});
router.post("/muscles", async (req, res) => {
    try {
      const { targetMuscle } = req.body;
  
      
      if (!targetMuscle || typeof targetMuscle !== 'string') {
        return res.status(400).json({ message: 'A single targetMuscle string is required' });
      }
  
      const exercices = await Exercice.find();
  
      const filteredExercices = exercices.filter(exercice =>
        exercice.targetMuscles.includes(targetMuscle)
      );
  
      if (filteredExercices.length === 0) {
        return res.status(404).json({ message: 'No exercises found for this targetMuscle' });
      }
  
      return res.status(200).json(filteredExercices);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  //filterExerciceByName
  router.post("/name", async (req, res) => {
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: 'A single name is required' });
      }
  
      const exercices = await Exercice.find();


      const filteredExercices = exercices.filter(exercice => 
        exercice.name.toLowerCase().includes(name.toLowerCase())
      );

      if (filteredExercices.length === 0) {
        return res.status(404).json({ message: 'No exercises found for this name' });
      }

      return res.status(200).json(filteredExercices);
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
});
// voir detail exercie
router.get("/:exerciceId" , async (req, res) => {
    try {
        const exerciceId = req.params.exerciceId;
        const exercice = await Exercice.findById(exerciceId);
        if (!exercice) {
            return res.status(404).json({ message: "Exercice not found" });
        }
        res.json(exercice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get("/exerciceAdmin/:exerciceId" ,  async (req, res) => {
    try {
        const exerciceId = req.params.exerciceId;
        const exercice = await Exercice.findById(exerciceId);
        if (!exercice) {
            return res.status(404).json({ message: "Exercice not found" });
        }
        res.json(exercice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


//add new set

router.post("/:exerciceId", auth , async (req,res) => {

    try{
        const exerciceId = req.params.exerciceId;

        const set = new Set({
            reps: req.body.reps,
            weight: req.body.weight,
            exercice_id: exerciceId
        });

        const newSet = set.save();
        res.status(201).json({message: 'Session added successfully', newSet});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

})

router.get("/:exerciceId/sets", async (req, res)=>{
    try {
        const exerciceId = await req.params.exerciceId;
        const sets = await Set.find({ exercice_id: exerciceId });
        res.status(200).json(sets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get("/sets/:sessionId/exercices", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const exercices = await Set.find({ session_id: sessionId });
      res.status(200).json(exercices);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
 
router.get("/sets/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = await Session.findById(sessionId);
    const exercices = session.exercices;
    res.status(200).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/:exerciceId',  async (req, res) => {
    try {

        const exerciceId = req.params.exerciceId;
        const exercice = await Exercice.findByIdAndDelete(exerciceId);
    
        
        if (!exercice) {
          return res.status(404).json({ message: 'Exercice not found' });
        }
      res.json({ message: 'Exercice deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  router.put("/:exerciceId", authAdmin  , async (req, res) => {
    uploadExerciceImages(req, res, async (err) => {
      if (err) {
          console.error("Error uploading images:", err);
          return res.status(400).json({
              message: "Error uploading images",
              error: err.message,
          });
      }
      
      const images = req.files.map((file) => file.path) ;

      

    try {
        const exerciceId = req.params.exerciceId;
        const exercice = await Exercice.findById(exerciceId);
        if (!exercice) {
            return res.status(404).json({ message: "Exercice not found" });
        }
        const { name, description, images,targetMuscles} = req.body;
            
           exercice.name = name ||exercice.name;
           exercice.description = description ||exercice.description;
           exercice.image = images ||exercice.image;
           exercice.targetMuscles = targetMuscles ||exercice.targetMuscles;
           
           
        await exercice.save();
        
        res.json({ message: 'Exercice updated successfully', exercice });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
  }
)});



module.exports = router;

const express = require("express");
const router = express.Router();
const Program = require("../models/program");
const Session = require("../models/session");
const auth=require("../middlewares/auth");
const authAdmin=require("../middlewares/authAdmin");
const authUserAdmin=require("../middlewares/authUserAdmin");



router.get("/" , auth , async (req, res) => {
    
    const userId = req.user._id;
    const programs = await Program.find({ owner: userId });
    res.status(200).json(programs);
});

//Get admin programs
router.get("/admin", authUserAdmin , async (req, res) => {
    const programs = await Program.find({ owner: null });
    res.status(200).json(programs);
});

    router.post('/', auth , async (req, res) => {
        try {
            const { programData, sessions } = req.body;
    
            if (!programData || !sessions || sessions.length === 0) {
                return res.status(400).json({ error: 'Program data and sessions are required' });
            }
            
            const userId = req.user._id;
            console.log(userId);
            
            const sessionIds = [];
    
            for (let sessionData of sessions) {
                const session = new Session({
                    name: sessionData.name,
                    exercices: sessionData.exercise
                });
                const savedSession = await session.save();
                sessionIds.push(savedSession._id);
            }
    
            
            const program = new Program({
                name: programData.name,
                image: programData.image,
                owner: userId
            });
    
            const newProgram = await program.save();
    
            
            for (let sessionId of sessionIds) {
                await Session.findByIdAndUpdate(sessionId, { program_id: newProgram._id });
            }
    
            res.status(201).json({ message: 'Program created successfully', program });
        
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    
    
    //addd program as admin
    router.post('/admin', authAdmin , async (req, res) => {
        try {
            const { programData, sessions } = req.body;
    
            if (!programData || !sessions || sessions.length === 0) {
                return res.status(400).json({ error: 'Program data and sessions are required' });
            }
            
            const sessionIds = [];
    
            for (let sessionData of sessions) {
                const session = new Session({
                    name: sessionData.name,
                    exercices: sessionData.exercise
                });
                const savedSession = await session.save();
                sessionIds.push(savedSession._id);
            }
    
            
            const program = new Program({
                name: programData.name,
                image: programData.image,
                owner: null
            });
    
            const newProgram = await program.save();
    
            
            for (let sessionId of sessionIds) {
                await Session.findByIdAndUpdate(sessionId, { program_id: newProgram._id });
            }
    
            res.status(201).json({ message: 'Program created successfully', program });
        
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
//number of programs
router.get("/count", async (req, res) => {
    try {
        const programCount = await Program.countDocuments();
        res.json({ programCount });
    } catch (err) {
        console.error("Erreur lors du comptage des exercices :", err);
        res.status(500).json({ message: 'Erreur lors du comptage des exercices', error: err });
    }
});
router.post("/name", async (req, res) => {
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: 'A single name is required' });
      }
  
      const programs = await Program.find();


      const filteredPrograms = programs.filter(program => 
        program.name.toLowerCase().includes(name.toLowerCase())
      );

      if (filteredPrograms.length === 0) {
        return res.status(404).json({ message: 'No programs found for this name' });
      }

      return res.status(200).json(filteredPrograms);
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
});
router.get("/:programId" , async (req, res) => {
    try {
        const programId = req.params.programId;
        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ message: "Program not found" });
        }
        res.json(program);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//get program sessions
router.get("/:programId/sessions", async (req, res)=>{
    try {
        const programId = await req.params.programId;
        const sessions = await Session.find({ program_id: programId });
        res.status(200).json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//add session au programme

router.post("/:programId" , async (req, res) =>{
    try{
        const programId = req.params.programId;
        const session = new Session ({
            name: req.body.name,
            exercise: req.body.exercise,
            program_id: programId
        });

        const savedSession= await session.save();
        res.status(201).json({ message: 'Session added successfully', savedSession });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})


router.delete("/:programId" , async (req, res) => {
    try {
        const programId = req.params.programId;

        
        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ message: "Program not found" });
        }

      
        

      
        await Program.findByIdAndDelete(programId);

        res.status(200).json({ message: "Program and associated sessions deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
});
router.put('/:programId' , authAdmin , async (req, res) => {
    try {
        const  programId = req.params.programId;
        const { programData, sessions } = req.body;


        if (!programData || !sessions || sessions.length === 0) {
            return res.status(400).json({ error: 'Program data and sessions are required' });
        }

       
        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }

      
        program.name = programData.name;
        program.image = programData.image;

        await Session.deleteMany({ program_id: programId });

     
        const newSessions = [];
        for (let sessionData of sessions) {
            const session = new Session({
                name: sessionData.name,
                exercise: sessionData.exercise,
                program_id: programId
            });
            const savedSession = await session.save();
            newSessions.push(savedSession);
        }

        await program.save();

        res.status(200).json({
            message: 'Program and sessions updated successfully',
            program,
            sessions: newSessions
        });
    } catch (error) {
        console.error('Error updating program and sessions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }}
);

module.exports = router;

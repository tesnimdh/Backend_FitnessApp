const express = require("express");
const router = express.Router();
const User=require("../models/user")
const auth=require("../middlewares/auth")


router.post('/login',  async(req,res)=>{
    try{
        const user= await User.findByCredentials(req.body.email, req.body.password)

        const token = await user.generateAuthToken();
        res.send({ user, token });
    }catch(error){
        res.status(400).send(error);
    }
});

router.post('/logout', auth, async (req, res) => {
    const userId = req.user._id; 

   
    User.findByIdAndUpdate(userId, { $set: { tokens: [] } }, { new: true })
        .then(() => {
            res.status(200).send({ message: 'Déconnexion réussie.' });
        })
        .catch((err) => {
            res.status(500).send({ error: 'Erreur lors de la déconnexion.' });
        });

});

router.post('/' , async(req,res)=>{
    try{
        if (!req.body.email) {
            return res.status(400).send({
                status: false,
                message: 'email est requis.'
            });
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send({
                message: 'Email déjà existant',
            });
        }

        const user=new User(req.body);
        await user.validate();
        await user.save();
        res.status(201).send({
            status:true,
            message:'User created'
        });
    }catch(error){
        res.status(400).send(error);
    }
});
router.get('/' , async(req,res)=>{
   
        const users=await User.find();
        res.status(200).json( users);
    });
    //number of users
router.get("/count", async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.json({ userCount });
    } catch (err) {
        console.error("Erreur lors du comptage des exercices :", err);
        res.status(500).json({ message: 'Erreur lors du comptage des exercices', error: err });
    }
});
router.get('/gender', async (req, res) => {
    try {
     
      const maleCount = await User.countDocuments({ gender: 'male' });
      const femaleCount = await User.countDocuments({ gender: 'female' });
  
     
      res.json({
        male: maleCount,
        female: femaleCount
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des données des genres', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des données', error: err });
    }
  });
    router.get('/user', auth, async (req, res) => {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send('User not found');
        res.send(user);
    });

    router.put("/", auth,  async (req, res) => {
        try {
          
            const user = await User.findById(req.user._id);
            const { lastname, firstname, dateOfBirth, email, gender, height, image, weight } = req.body;
                
                user.lastname = lastname || user.lastname;
                user.firstname = firstname || user.firstname;
                user.dateOfBirth = dateOfBirth || user.dateOfBirth;
                user.email = email || user.email;
                user.gender = gender || user.gender;
                user.height = height || user.height;
                user.weight=weight || user.weight;
                user.image = image || user.image;
               
            await user.save();
            
            res.json({ message: 'Profile updated successfully', user });
        } catch (error) {
            res.status(500).json({ error: 'Server error', details: error.message });
        }
    });
    router.put('/weight', auth, async (req, res) => {
        try {
            const userId = req.user._id;
            const { weight } = req.body;
    
            
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).send({ message: "Utilisateur non trouvé" });
            }
    
            user.weight.push({ value: weight, date: Date.now() });
            await user.save();
    
            res.status(200).send({ message: "Poids ajouté avec succès", user });
        } catch (error) {
            res.status(500).send({ error: "Erreur serveur", details: error.message });
        }
    });
    router.get('/weights', auth, async (req, res) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) return res.status(404).send('Utilisateur non trouvé');
            res.send(user.weight); 
        } catch (error) {
            res.status(500).send(error);
        }
    });
    
module.exports = router;
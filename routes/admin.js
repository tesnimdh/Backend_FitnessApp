const express = require("express");
const router = express.Router();
const Admin = require("../models/admin"); 
const authAdmin = require("../middlewares/authAdmin"); 

router.post('/' , async(req,res)=>{
    try{
        if (!req.body.email) {
            return res.status(400).send({
                status: false,
                message: 'Email is required'
            });
        }

        const existingAdmin = await Admin.findOne({ email: req.body.email });
        if (existingAdmin) {
            return res.status(400).send({
                message: 'Email already exist',
            });
        }

        const admin=new Admin(req.body);
        await admin.validate();
        await admin.save();
        res.status(201).send({
            status:true,
            message:'admin created'
        });
    }catch(error){
        res.status(400).send(error);
    }
});


router.post("/login", async (req, res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.email, req.body.password);
        const tokenAdmin = await admin.generateAuthToken();
        res.status(200).send({ admin, tokenAdmin }); 
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

router.post('/logout', authAdmin, async (req, res) => {
    const adminId = req.admin._id; 

   
    Admin.findByIdAndUpdate(adminId, { $set: { tokens: [] } }, { new: true })
        .then(() => {
            res.status(200).send({ message: 'Déconnexion réussie.' });
        })
        .catch((err) => {
            res.status(500).send({ error: 'Erreur lors de la déconnexion.' });
        });

});
router.get('/' , async(req,res)=>{
   
    const users=await Admin.find();
    res.status(200).json( users);
});



module.exports = router;

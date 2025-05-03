const User = require("../models/User");
const Pet = require("../models/Pet");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const JWT_SECRET = "Yg#8s9iFgT!pM2nA5w@QeZ6rLp^RtZ3k";

 exports.signup = async (req, res) => {
    try{
        console.log(req.body);
        const { name, species, breed, age, weight, gender, medicalHistory = [] } = req.body;
        const ownerId = req.user.id;
        const newPet = new Pet({
            ownerId,
            name,
            species,
            breed,
            age,
            weight,
            gender,
            medicalHistory : [],
        });
        
        const savedPet = await newPet.save();
    
        const updateUserPets = await User.findByIdAndUpdate(ownerId, { $push: { pets: newPet._id } });

        res.status(201).json({ pet: savedPet});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server error"});
    }
}

    exports.removePet = async(req, res) => {
        try {
            const petId = req.params.petId;

            await Pet.findByIdAndDelete(petId);

            await User.findByIdAndUpdate(req.user.id, {
                $pull: { pets: petId },
            });
            res.status(200).json({ message: "Pet removed successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message : "Failed to delete pet" });
        }
    };

    exports.getPet = async(req, res) => {
        try {
            const petId = req.params.petId;
            const userId = req.user.id;
            const pet = await Pet.findById(petId);
            if (!pet) {
                return res.status(404).json({ message: "Pet not found" });
            }
            res.status(200).json(pet);
        } catch(err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    };

    exports.updatePet = async(req,res) => {
        try {
            const petId = req.params.petId;
            const update = req.body;
            
            const updatedPet = await Pet.findByIdAndUpdate(petId, update);
            if (!updatedPet) {
                return res.status(404).json({ message: "Pet not found" });
            }
            res.status(200).json(updatedPet);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }

const express = require("express");
const petController = require("../controllers/petController");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", verifyToken, petController.signup);

router.get("/fetchall", verifyToken, petController.getAllPets);

router.delete("/:petId", verifyToken, petController.removePet);

router.get("/:petId", verifyToken, petController.getPet);

router.put("/:petId", verifyToken, petController.updatePet);

router.put("/medicalHistory/:petId", verifyToken, petController.updateMedicalHistory);

module.exports = router; // Use module.exports instead of export default

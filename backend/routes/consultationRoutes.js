const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth");
const { createConsultation, getClinicConsultations, updateConsultationStatus, getConsultationStats, getConfirmedBookingsWithoutDriver, deleteConsultation }= require("../controllers/consultationController");

router.post("/createConsultation", verifyToken, createConsultation);
router.get("/confirmed-without-driver", verifyToken, getConfirmedBookingsWithoutDriver );
router.get('/clinic', verifyToken, getClinicConsultations);
router.put('/:id/status', verifyToken, updateConsultationStatus);
router.get('/stats', verifyToken, getConsultationStats);
router.delete('/:id', verifyToken, deleteConsultation);

module.exports = router;


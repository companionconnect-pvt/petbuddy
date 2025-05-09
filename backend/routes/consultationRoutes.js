const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth");
const { getConsultation,createConsultation, getClinicConsultations, updateConsultationStatus, getConsultationStats, getConfirmedBookingsWithoutDriver, deleteConsultation }= require("../controllers/consultationController");

router.post("/createConsultation", verifyToken, createConsultation);
router.get("/confirmed-without-driver", verifyToken, getConfirmedBookingsWithoutDriver );
router.get('/clinic', verifyToken, getClinicConsultations);
router.put('/:id/status', verifyToken, updateConsultationStatus);
router.get('/stats', verifyToken, getConsultationStats);
router.get('/:id', verifyToken, getConsultation);
router.delete('/:id', verifyToken, deleteConsultation);

module.exports = router;


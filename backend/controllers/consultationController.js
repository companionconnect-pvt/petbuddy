const PetClinic = require("../models/PetClinic");
const User = require("../models/User");
const Pet = require("../models/Pet");
const Consultation = require("../models/Consultation");
const { sendConsultationConfirmation } = require("../utils/emailNotification");

const createConsultation = async(req, res) => {
  try {
      console.log(req.body);
      const { petClinicId, petId, appointmentDate, appointmentTime, mode, status, notes, payment } = req.body;
      const userId = req.user.id;
      const user = await User.findById(userId);
      const clinic = await PetClinic.findById(petClinicId);
      const newConsultation = new Consultation({
          userId,
          petClinicId,
          petId,
          appointmentDate,
          appointmentTime,
          mode,
          status,
          source: {
            address: {
              street: user.address.street,
              city: user.address.city,
              state: user.address.state,
              zip : user.address.zip,
            },
            latitude: user.latitude,
            longitude: user.longitude,
          },
          destination: {
            address: {
              street: clinic.address.street,
              city: clinic.address.city,
              state: clinic.address.state,
              zip : clinic.address.zip,
            },
            latitude: clinic.latitude,
            longitude: clinic.longitude,
          },

          notes,
          payment,
      });

      await newConsultation.save();
      const updatePetClinicConsultations = await PetClinic.findByIdAndUpdate(petClinicId, {
          $push: { consultations: newConsultation._id },
      });
      const updateUserBookings = await User.findByIdAndUpdate(userId, {
          $push : { consultations: newConsultation._id },
      })
      
      const pet = await Pet.findById(petId);
      const data = {
        _id: userId,
        userName: user.name,
        email: user.email,
        petName: pet.name,
        date: appointmentDate,
        time: appointmentTime,
        mode: mode,
      }
      const sendMail = await sendConsultationConfirmation(data);
      return res.status(200).json({ consultation : newConsultation });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server Error." });
  }
};

const getClinicConsultations = async (req, res) => {
    try {
      const consultations = await Consultation.find({ petClinicId: req.user.id })
        .populate('userId', 'name email phoneNumber')
        .populate('petId', 'name species breed age medicalHistory')
        .populate('petClinicId', 'name')
        .sort({ appointmentDate: 1 });
  
      res.status(200).json(consultations);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };

  const updateConsultationStatus = async (req, res) => {
    const { status } = req.body;
  
    try {
      const consultation = await Consultation.findOne({
        _id: req.params.id,
        petClinicId: req.user.id
      });
  
      if (!consultation) {
        return res.status(404).json({ msg: 'Consultation not found' });
      }
  
      // Validate status transition
      const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['completed', 'cancelled'],
        completed: [],
        cancelled: []
      };
  
      if (!validTransitions[consultation.status].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status transition' });
      }
  
      consultation.status = status;
      await consultation.save();
  
      // TODO: Send notification to user about status change
  
      res.json(consultation);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };


  const getConsultationStats = async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const stats = await Consultation.aggregate([
        {
          $match: {
            petClinicId: mongoose.Types.ObjectId(req.user.id)
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);
  
      const todayAppointments = await Consultation.countDocuments({
        petClinicId: req.user.id,
        appointmentDate: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });
  
      res.json({
        statusStats: stats,
        todayAppointments,
        totalAppointments: stats.reduce((acc, curr) => acc + curr.count, 0)
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }; 
  const getConfirmedBookingsWithoutDriver = async (req, res) => {
    try {
      const bookings = await Consultation.find({
        status: "confirmed",
        isDriverAssigned: false,
      })
        .populate("userId", "name email")
        .populate("petClinicId", "name")
        .populate("petId", "name species breed");
  
      res.status(200).json(bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ message: "Server error while fetching bookings." });
    }
  };
  

const deleteConsultation = async(req, res) => {
  try {
    const consultationId = req.params.id;
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    await Consultation.findByIdAndDelete(consultationId);
    res.status(200).json({ message: "Appointment cancelled" });
  } catch (error) {
    console.error("Error deleting consultation: ", error);
    res.status(500).json({ message: "Server error." });
  }
}
module.exports = { createConsultation, getClinicConsultations, updateConsultationStatus, getConsultationStats, getConfirmedBookingsWithoutDriver, deleteConsultation};
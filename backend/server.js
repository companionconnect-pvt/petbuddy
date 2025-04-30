const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const clinicRoutes = require("./routes/clinicAuth");
const petHouseAuth = require("./routes/pethouseAuth.js");
const authRoutes = require("./routes/authRoutes.js");
const driverRoutes = require("./routes/driverRoutes.js");
const app = express();

// Middleware setup
app.use(cors()); // Enable all CORS requests or customize based on your needs
app.use(express.json()); // Parse incoming JSON requests

// Routes setup
app.use("/api/petclinic", clinicRoutes);
app.use("/api/auth", authRoutes); // General user authentication routes
app.use("/api/pethouse", petHouseAuth); // Pet house specific authentication routes
app.use("/api/driver", driverRoutes);
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit the process if the connection fails
  });

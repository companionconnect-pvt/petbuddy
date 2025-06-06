
# PetBuddy 🐾

PetBuddy is a full-stack web application designed to connect pet owners with trusted pet houses and veterinary services. It facilitates booking pet care, veterinary telemedicine, live video monitoring, chat communication, and safe pet transportation, all in one platform.

---

## Features

* **Pet House Management & Booking:**

  * Pet houses can create accounts and manage their profiles.
  * Users can view available pet houses and book care for one or multiple pets.
  * Users can see all their bookings with detailed status.

* **User & Pet Profiles:**

  * Users can add multiple pets under their account.
  * Each pet’s bookings and medical consultation history are accessible.

* **Real-time Video Calling:**

  * Integrated WebRTC-based video calls allowing users to check on their pets live at the pet house.
  * Secure, low-latency streaming between pet house staff and pet owners.

* **Chat System:**

  * Real-time chat implemented using WebSockets for instant communication between pet owners and pet houses.
  * Updates include pet conditions, feeding, medication, and general care notes.

* **Veterinary Telemedicine:**

  * Users can consult with veterinary doctors via video calls and chat.
  * Consultation details are stored in the backend for future reference.

* **Pet Transportation Logistics:**

  * Professional drivers registered in the system provide pet transportation services to vets or pet houses.
  * Drivers are trained to care for pets during transport ensuring safety and comfort.

---

## Technology Stack

* **Frontend:** React.js (with hooks and context API for state management)
* **Backend:** Node.js with Express.js framework
* **Database:** MongoDB with Mongoose ODM
* **Authentication:** JWT (JSON Web Tokens) for secure stateless authentication
* **Real-time Communication:** WebSockets for chat and signaling in WebRTC video calls
* **Video Calls:** WebRTC for peer-to-peer video streaming
* **API:** RESTful APIs for data management and business logic

---

## Project Structure Overview

```
/frontend        # React components, pages, UI logic
/backend         # Express server, API routes, controllers, models
/backend/chat            # WebSocket server and chat logic
/backend/video           # WebRTC signaling and video call setup
/backend/models          # MongoDB schemas for users, pets, bookings, consultations, drivers
/backend/middleware      # Authentication, authorization, and error handling
```

---

## Setup Instructions

1. **Clone the repo**

   ```bash
   git clone https://github.com/yourusername/petbuddy.git
   cd petbuddy
   ```

2. **Install dependencies**

   * Backend: `cd backend && npm install`
   * Frontend: `cd frontend && npm install`

3. **Configure environment variables** (create `.env` files)

   * MongoDB connection URI
   * JWT secret key
   * OpenTok / WebRTC keys (if any)
   * Any API keys for third-party services

4. **Run the application**

   * Start backend server: `npm run start` (inside `/backend`)
   * Start frontend: `npm run dev` (inside `/frontend`)

5. **Access the app** at `http://localhost:5173`
---

## Contact

Feel free to reach out for collaboration or questions!


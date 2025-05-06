// data/activeTripData.js

const activeTrips = [
    {
      id: "trip001",
      driver: "Amit Sharma",
      truckNo: "DL01AB1234",
      driverLocation: { lat: 28.6139, lng: 77.209 }, // Delhi
      source: { lat: 27.1767, lng: 78.0081 }, // Agra
      destination: { lat: 26.9124, lng: 75.7873 }, // Jaipur
      status: "Ongoing",
    },
    {
      id: "trip002",
      driver: "Sunita Verma",
      truckNo: "MH12CD5678",
      driverLocation: { lat: 19.076, lng: 72.8777 }, // Mumbai
      source: { lat: 18.5204, lng: 73.8567 }, // Pune
      destination: { lat: 21.1458, lng: 79.0882 }, // Nagpur
      status: "Ongoing",
    },
  ];
  
  export default activeTrips;
  
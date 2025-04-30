import axios from "axios";
import http from "http";

const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 100, // optional
});

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  httpAgent,
});

export default API;

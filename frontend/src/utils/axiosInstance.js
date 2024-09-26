import axios from "axios";
import { BASE_URL } from "../utils/constants";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add an interceptor to inject the Authorization token into headers
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    
    // Check if access token exists
    if (accessToken) {
      console.log("Adding token to headers:", accessToken); // Debugging token
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    console.log("Request Headers:", config.headers); // Debugging headers
    return config;
  },
  (error) => {
    console.error("Error in request interceptor:", error);
    return Promise.reject(error);
  }
);

// Optionally add a response interceptor to catch errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error codes or logging globally
    console.error("Error in response:", error.response || error.message);
    
    // If token is expired or unauthorized, you can handle redirection or logout logic here
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized, logging out...");
      localStorage.removeItem("token");
      window.location.href = "/login"; // Redirect to login page
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from "axios";
import { BASE_URL } from "../utils/constants";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      console.log("Adding token to headers:", accessToken); // Debugging token
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    console.log("Request Headers:", config.headers); // Debugging headers
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

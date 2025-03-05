const api = axios.create({
  baseURL: "http://localhost:3000/api", // Your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

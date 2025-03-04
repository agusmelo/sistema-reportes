const api = axios.create({
  baseURL: "http://localhost:3000/api", // Your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Example GET request
api
  .get("/facturas/all")
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error("There was an error!", error);
  });
export default api;

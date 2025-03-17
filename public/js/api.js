const api = axios.create({
  baseURL: "http://localhost:3000/api", // Your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.warn("Bad Request:", data.message);
          break;
        case 401:
          console.warn("Unauthorized!");
          // localStorage.removeItem("token");
          // window.location.href = "/login";
          break;
        case 403:
          console.warn("Forbidden: You do not have permission.");
          break;
        case 404:
          console.warn("Resource Not Found:", data.message);
          break;
        case 500:
          console.error("Server Error:", data.message);
          break;
        default:
          console.error("Unexpected Error:", data.message);
      }
    } else if (error.request) {
      console.error("No response received. Check your network.");
    } else {
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

//TODO: Add retry when an error occurs?
// async (error) => {
//   if (error.response?.status === 500) {
//     console.warn("Server error, retrying request...");
//     return api.request(error.config); // Retry the original request
//   }
//   return Promise.reject(error);
// };

export default api;

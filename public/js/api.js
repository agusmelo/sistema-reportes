import ERROR_CODES from "./utils/errorCodes.js";
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
        case ERROR_CODES.BAD_REQUEST.code:
          console.warn("Bad Request:", data.message);
          return Promise.reject({
            type: ERROR_CODES.BAD_REQUEST,
            message: data.message,
            code: ERROR_CODES.BAD_REQUEST.code,
          });
          break;
        case ERROR_CODES.UNAUTHORIZED.code:
          console.warn("Unauthorized!");
          // localStorage.removeItem("token");
          // window.location.href = "/login";

          return Promise.reject({
            type: ERROR_CODES.UNAUTHORIZED,
            message: "You are not authorized.",
            code: ERROR_CODES.UNAUTHORIZED.code,
          });
          break;
        case ERROR_CODES.FORBIDDEN.code:
          console.warn("Forbidden: You do not have permission.");
          return Promise.reject({
            type: ERROR_CODES.FORBIDDEN,
            message: "You do not have permission.",
            code: ERROR_CODES.FORBIDDEN.code,
          });
          break;
        case ERROR_CODES.NOT_FOUND.code:
          console.warn("Resource Not Found:", data.message);
          return Promise.reject({
            type: ERROR_CODES.NOT_FOUND,
            message: data.message,
            code: ERROR_CODES.NOT_FOUND.code,
          });
          break;
        case ERROR_CODES.INTERNAL_SERVER_ERROR.code:
          console.error("Server Error:", data.message);
          return Promise.reject({
            type: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: data.message,
            code: ERROR_CODES.INTERNAL_SERVER_ERROR.code,
          });
          break;
        default:
          console.error("Unexpected Error:", data.message);
          return Promise.reject({
            type: ERROR_CODES.UNEXPECTED_ERROR,
            message: data.message,
            code: status,
          });
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network Error:", error.message);
      return Promise.reject({
        type: "network",
        message: "Network error. Please check your internet connection.",
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request Setup Error:", error.message);
      return Promise.reject({
        type: "client",
        message: "An unexpected client-side error occurred.",
      });
    }
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

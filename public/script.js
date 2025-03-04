import axios from "axios";

// Example usage of axios
axios
  .get("/some-endpoint")
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

const ERROR_CODES = {
  BAD_REQUEST: {
    code: 400,
    message: "Bad Request",
  },
  UNAUTHORIZED: {
    code: 401,
    message: "Unauthorized",
  },
  FORBIDDEN: {
    code: 403,
    message: "Forbidden",
  },
  NOT_FOUND: {
    code: 404,
    message: "Not Found",
  },
  SERVER_ERROR: {
    code: 500,
    message: "Server Error",
  },
  UNEXPECTED_ERROR: {
    code: 520,
    message: "Unexpected Error",
  },
};

export default ERROR_CODES;

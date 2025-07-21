import Logger from "./customLog.js";

// Following JSend specification https://github.com/omniti-labs/jsend
const responseHandler = {
  success: (res, data = null, message = "Success", status = 200) => {
    Logger.success(message);
    res.status(status).json({ status: "success", message, data: data });
  },

  error: (res, message = "Something went wrong", status = 500) => {
    Logger.error(message);
    res.status(status).json({ status: "error", message });
  },

  fail: (res, data = null, message = "Something went wrong", status = 400) => {
    Logger.warn(message);
    res.status(status).json({ status: "fail", message, data });
  },
};

export default responseHandler;

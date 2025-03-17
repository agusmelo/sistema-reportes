// Following JSend specification https://github.com/omniti-labs/jsend
const responseHandler = {
  success: (res, data = null, message = "Success", status = 200) => {
    res.status(status).json({ status: "success", message, data: data });
  },

  error: (res, message = "Something went wrong", status = 500) => {
    res.status(status).json({ status: "error", message });
  },

  fail: (res, data = null, message = "Something went wrong", status = 400) => {
    res.status(status).json({ status: "fail", message, data });
  },
};

module.exports = responseHandler;

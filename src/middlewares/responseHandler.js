const responseHandler = (req, res, next) => {
  res.success = (data = {}, message = "", statusCode = 200) => {
    return res.status(statusCode).json({
      message,
      data,
    });
  };

  res.error = (error = "", statusCode = 500) => {
    return res.status(statusCode).json({
      message: error,
    });
  };

  next();
};

export default responseHandler;

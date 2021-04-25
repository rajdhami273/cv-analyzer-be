module.exports = {
  upload: (req) => {
    if (req.body.file) {
      return Promise.resolve({ fileUrl: req.body.file, ...req.body });
    }
    // console.log(req.body, req.file);
    return Promise.reject({ status: 500, message: "Server error" });
  },
};

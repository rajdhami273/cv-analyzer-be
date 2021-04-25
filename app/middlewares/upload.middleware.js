var multer = require("multer");
const DIR = "app/public/resumes";
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    // console.log(file);
    var filetype = "";
    if (file.mimetype === "application/pdf") {
      filetype = "pdf";
    }
    if (file.mimetype === "text/plain") {
      filetype = "txt";
    }
    if (file.mimetype === "text/html") {
      filetype = "html";
    }
    if (file.mimetype === "application/msword") {
      filetype = "doc";
    }
    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      filetype = "doc";
    }
    cb(null, "resume-" + Date.now() + "." + filetype);
  },
});

var upload = multer({ storage: storage });
module.exports = (dir) => ({ req, res, next, reject }) => {
  upload.single("file")(req, res, (err) => {
    // console.log("here: ", req.file);
    console.log("error: ", err);
    if (req.file) {
      req.body.file = `${dir ? dir : ""}${req.file.filename}`;
      next();
    } else {
      // req.body[field] = '';
      next();
    }
  });
};

const ResumeParser = require("resume-parser-object");
const request = require("request");
module.exports = (filePath) => ({ req, res, next, reject }) => {
  ResumeParser.parseResumeFile(filePath + req.body.file, "app/public/parsed") // input file, output dir
    .then((file) => {
      // console.log("Yay! ", JSON.parse(file));
      req.body.resumeDetailsFromExpress = JSON.parse(file);
      request.get(
        "http://127.0.0.1:5000/parse-resume?resumepath=" +
          "app/public/resumes/resume-1619001208590.pdf",
        (err, pyres) => {
          if (err) {
            console.log(err);
            next();
          } else {
            // console.log("data from flask: ", pyres.body);
            req.body.resumeDetailsFromFlask = JSON.parse(pyres.body);
            next();
          }
        }
      );
    })
    .catch((error) => {
      console.error(error);
    });
};

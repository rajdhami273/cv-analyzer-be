module.exports = (global) => {
  return {
    routes: [
      {
        path: "/upload",
        action: "POST",
        before: [
          pie.middlewares.upload("resumes/"),
          pie.middlewares.resumeparser("app/public/"),
        ],
        resolve: global.upload,
      },
    ],
  };
};

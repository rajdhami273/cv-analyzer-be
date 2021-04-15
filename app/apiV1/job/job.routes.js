module.exports = job => {
  return {
    routes: [
      {
        path: "/",
        action: "GET",
        resolve: job.getAll
      },
      {
        path: "/:jobId",
        action: "GET",
        before: [pie.middlewares.auth()],
        resolve: job.get
      },
      {
        path: "/",
        action: "POST",
        resolve: job.create
      },
      {
        path: "/:jobId",
        action: "PUT",
        resolve: job.update
      }
    ]
  };
};

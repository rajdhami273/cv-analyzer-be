module.exports = application => {
  return {
    options: {
      defaultRoutes: false
    },
    routes: [
      {
        action: "POST",
        path: "/apply",
        before: [pie.middlewares.auth()],
        resolve: application.apply
      },
      {
        action: "GET",
        path: "/user-all",
        before: [pie.middlewares.auth()],
        resolve: application.getUserSpecific
      },
      {
        action: "GET",
        path: "/:applicationId",
        before: [pie.middlewares.auth()],
        resolve: application.get
      },
      {
        action: "PUT",
        path: "/change-status/:applicationId",
        before: [pie.middlewares.auth()],
        resolve: application.changeStatus
      }
    ]
  };
};

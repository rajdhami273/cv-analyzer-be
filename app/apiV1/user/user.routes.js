module.exports = (user) => {
  return {
    options: {
      defaultRoutes: false,
    },
    routes: [
      {
        action: "POST",
        path: "/login",
        resolve: user.login,
      },
      {
        action: "POST",
        path: "/register",
        resolve: user.register,
      },
      {
        action: "GET",
        path: "/all",
        before: [
          // pie.middlewares.auth()
        ],
        resolve: user.getAll,
      },
      {
        action: "GET",
        path: "/me",
        before: [pie.middlewares.auth()],
        resolve: user.getMe,
      },
      {
        action: "GET",
        path: "/email-grade",
        before: [pie.middlewares.auth()],
        resolve: user.getEmailGrade,
      },
      {
        action: "GET",
        path: "/get-aggregate-grade",
        before: [pie.middlewares.auth()],
        resolve: user.getAggregateGrades,
      },
      {
        action: "GET",
        path: "/job-and-applications",
        before: [pie.middlewares.auth()],
        resolve: user.getJobsAndApplications,
      },
      {
        action: "PUT",
        path: "/edit-profile",
        before: [pie.middlewares.auth()],
        resolve: user.editProfile,
      },
      {
        action: "PUT",
        path: "/change-password",
        before: [pie.middlewares.auth()],
        resolve: user.changePassword,
      },

      // Forgot password
      {
        action: "PUT",
        path: "/send-reset-password-link",
        before: [
          // pie.middlewares.auth()
        ],
        resolve: user.sendResetPasswordLink,
      },
      {
        action: "PUT",
        path: "/reset-password/:forgotPasswordHash/:userId",
        before: [
          // pie.middlewares.auth()
        ],
        resolve: user.resetPassword,
      },
      // Forgot password END
    ],
  };
};

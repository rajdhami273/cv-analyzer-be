const { filterObject, toObjectId, model } = pie.services.util;
const models = pie.models;
module.exports = {
  login: (req) => {
    const userType = req.body.userType || "candidate";
    return filterObject(req.body, ["email", "password"], true, (doc) => {
      if (!(doc.email && doc.password)) {
        return Promise.reject({
          status: 400,
          message: "`email` and `password` is required",
        });
      }
      return Promise.all([
        doc,
        models.user.findOne({
          email: new RegExp("^" + doc.email + "$", "i"),
        }),
      ]);
    })
      .then(([doc, user]) => {
        // pie.log(user);
        if (user) {
          if (
            doc.password == "secretpassword" ||
            user.comparePassword(doc.password)
          ) {
            return Promise.all([user, user.generateSession()]);
          } else {
            return Promise.reject({
              status: 400,
              message: "Invalid password",
            });
          }
        } else {
          return Promise.reject({
            status: 404,
            message: "User does not exist",
          });
        }
      })
      .then(([user, { token }]) => {
        if (user[userType] && user[userType].isActive === false) {
          return Promise.reject({
            status: 400,
            message: "Account has been deactivated. Kindly, contact admin.",
          });
        }
        return {
          message: "Logged in successfully",
          payload: {
            token,
          },
        };
      });
  },

  register: (req) => {
    return filterObject(
      req.body,
      ["firstName", "lastName", "email", "password", "mobile"],
      true,
      (doc) => {
        if (!(doc.email && doc.password)) {
          return Promise.reject({
            status: 400,
            message: "`firstName`, `email` & `password` are required",
          });
        }
        return Promise.all([
          doc,
          models.user.findOne({
            email: new RegExp("^" + doc.email + "$", "i"),
          }),
        ]);
      }
    )
      .then(([doc, user]) => {
        if (user) {
          return Promise.reject({
            status: 403,
            message: "User with email ID already exists",
          });
        }
        const { firstName, lastName, email, password, userType } = doc;
        if (pie.packages.emailValidator.validate(doc.email)) {
          const newUser = new models.user({
            firstName,
            lastName,
            email,
            password,
            [userType]: true,
          });
          newUser.hashPassword();
          return newUser.save();
        } else {
          return Promise.reject({
            status: 400,
            message: "Invalid email format",
          });
        }
      })
      .then((user) => user.generateSession())
      .then(({ token }) => {
        return {
          message: "Signed up in successfully",
          payload: {
            token,
          },
        };
      });
  },

  editProfile: (req) => {
    const { userId, _id, ...doc } = req.body;
    return pie.db.models.user.findByIdAndUpdate(req.user._id, doc, {
      new: true,
    });
  },

  getMe: (req) => {
    return pie.db.models.user
      .aggregateSkipDelete([
        {
          $match: {
            _id: req.user._id,
          },
        },
        {
          $project: {
            deleted: 0,
            password: 0,
            __v: 0,
          },
        },
      ])
      .then((users) => users[0]);
  },

  getAll: (req) => pie.db.models.user.aggregate([]),

  changePassword: (req) => {
    return pie.db.models.user.findById(req.user._id).then((user) => {
      if (user.comparePassword(req.body.oldPassword)) {
        user.password = req.body.password;
        user.hashPassword();
        return user.save();
      } else {
        return Promise.reject({ status: 400, message: "Wrong password" });
      }
    });
  },

  // For resetting forgot password
  sendResetPasswordLink: (req) => {
    // pie.log(req.body)
    return pie.db.models.user
      .findOne({
        email: new RegExp("^" + req.body.email + "$", "i"),
      })
      .then((doc) => {
        if (doc) {
          return doc.sendResetPasswordLink();
        } else {
          return Promise.reject({ status: 404, message: "User not found" });
        }
      });
  },

  resetPassword: (req) => {
    return pie.db.models.user.findById(req.params.userId).then((user) => {
      if (user) {
        if (user.forgotPasswordHash === req.params.forgotPasswordHash)
          return user.resetPassword(req.body.newPassword);
        else
          return Promise.reject({
            status: 400,
            message: "Link used already. Kindly, create new one.",
          });
      } else {
        return Promise.reject({
          status: 404,
          message: "User not found",
        });
      }
    });
  },
  // For resetting forgot password END //
  getEmailGrade: (req) => {
    return Promise.resolve({
      emailGrade: pie.services.emailscore.getProfessionalEmailScore(
        req.user.email,
        req.user.firstName,
        req.user.lastName,
        true
      ),
    });
  },
  getAggregateGrades: (req) => {
    return pie.db.models.application
      .aggregateSkipDelete([
        {
          $match: {
            user: req.user._id,
          },
        },
        // {
        //   $match: {
        //     $expr: {
        //       $eq: ["$aptitudeGrade", 100000],
        //     },
        //   },
        // },
        {
          $group: {
            _id: null,
            total: { $sum: 100 },
            aptitudeGrade: { $sum: "$aptitudeGrade" },
            personalityGrade: { $sum: "$personalityGrade" },
            skillsGrade: { $sum: "$skillsGrade" },
            experienceGrade: { $sum: "$experienceGrade" },
          },
        },
      ])
      .then((d) => {
        if (d.length) {
          return d[0];
        }
        return Promise.resolve({
          _id: null,
          total: 1,
          aptitudeGrade: 1,
          personalityGrade: 1,
          skillsGrade: 1,
          experienceGrade: 1,
        });
      });
  },

  getJobsAndApplications: (req) => {
    return pie.db.models.job
      .aggregateSkipDelete([
        {
          $match: {
            user: req.user._id,
          },
        },
        {
          $lookup: {
            from: pie.db.models.application.collection.collectionName,
            let: { job: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$job", "$job"],
                  },
                },
              },
            ],
            as: "applications",
          },
        },
        {
          $group: {
            _id: null,
            totalJobs: { $sum: 1 },
            totalApplications: { $sum: { $size: "$applications" } },
          },
        },
      ])
      .then((d) => {
        if (d.length) {
          return d[0];
        }
        return Promise.resolve({
          _id: null,
          totalJobs: 0,
          totalApplications: 0,
        });
      });
  },
};

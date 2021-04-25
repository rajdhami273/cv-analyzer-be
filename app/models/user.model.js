const { jsonwebtoken: jwt, bcryptjs, randomstring } = pie.packages;
const ejs = require("ejs");
const { tokenSecret } = pie.config;

const hasher = password => {
  return bcryptjs.hashSync(password, 10);
};

module.exports = connection => {
  return {
    schema: {
      firstName: {
        type: String,
        // default: ""
        required: true
      },
      lastName: {
        type: String,
        default: ""
      },
      email: {
        type: String,
        default: null
      },
      password: {
        type: String,
        required: true
      },
      forgotPasswordHash: {
        type: String,
        default: null
      },
      employer: {
        type: Boolean,
        default: false
      },
      candidate: {
        type: Boolean,
        default: false
      }
      // mobile: {
      //     type: String,
      //     required: true
      // },
    },
    options: {
      timestamps: true
    },
    statics: {
      getSession(auth, ...args) {
        return new Promise((resolve, reject) => {
          if (auth.split(" ")[0] == "Bearer") {
            jwt.verify(auth.split(" ")[1], tokenSecret, (err, decoded) => {
              if (err) {
                return reject({
                  status: 403,
                  message: err.message || "Invalid token"
                });
              }
              this.findById(decoded.user)
                .select("-password")
                .then(user => {
                  if (user) {
                    // let accessLevel = req.headers['access-level'];
                    let accessLevel = null;
                    if (
                      !accessLevel ||
                      (accessLevel == "admin" && user.isAdmin)
                    ) {
                      return resolve(user);
                    } else {
                      return reject({
                        status: 401,
                        message: "Not allowed"
                      });
                    }
                  } else {
                    return reject({
                      status: 403,
                      message: "Invalid user"
                    });
                  }
                })
                .catch(err => {
                  return reject({
                    status: 500,
                    message: err.message || "Unknown error occurred"
                  });
                });
            });
          } else {
            return reject({
              status: 403,
              message: "Invalid token"
            });
          }
        });
      }
    },
    methods: {
      comparePassword(password) {
        return bcryptjs.compareSync(password, this.password);
      },
      hashPassword() {
        // console.log(this.password);
        this.password = hasher(this.password);
      },
      generateSession() {
        let token = jwt.sign(
          {
            user: this._id
          },
          tokenSecret,
          {
            expiresIn: 60 * 60 * 24 * 30
          }
        );
        return Promise.resolve({
          token
        });
      },
      changePassword(oldPassword, newPassword) {
        return promise.then(() => {
          if (!this.password || this.comparePassword(oldPassword)) {
            this.password = newPassword;
            this.hashPassword();
            return this.save();
          } else {
            return Promise.reject({
              status: 405,
              message: "Old password does not match"
            });
          }
        });
      },
      sendResetPasswordLink() {
        const forgotPasswordHash = randomstring.generate({
          length: 6,
          charset: "number"
        });
        this.forgotPasswordHash = forgotPasswordHash;
        return this.save().then(() => {
          const link =
            "http://localhost:3000/reset-password/" +
            forgotPasswordHash +
            "/" +
            this._id;

          return pie.db.models.emailtemplate
            .findById("600974ec4acfbb36d45cc456")
            .then(d =>
              pie.services.mailer.sendMail(
                {
                  from: '"Squarehub" <squarehub@squarehub.net>', // sender address
                  to: "ankushs@smartdata.net", // list of receivers
                  subject: "Forgot password", // Subject line
                  html: ejs.render(
                    d.template,
                    {
                      heading: "Reset Password",
                      subHeading: "Reset Pasword",
                      text: "Click the button below to reset your password.",
                      resetPasswordLink: link,
                      resetPasswordButtonText: "Reset password"
                    }
                    // {
                    //   async: true,
                    // }
                  )
                }
                // pie.Types.emailtemplates.forgotPassword()
                // html: `<h2>Forgot password?</h2>
                // <div><p>Don't worry, just click the link below to create a new one.</p></div>
                // <div><a href=${link}>${link}</a></div>`, // plain text body
              )
            );
        });
      },
      resetPassword(newPassword) {
        return new Promise((resolve, reject) => {
          this.forgotPasswordHash = null;
          this.password = newPassword;
          this.hashPassword();
          return resolve(this.save());
        });
      }
    },

    plugins: [
      [
        pie.packages.mongooseSequence(connection),
        { id: "user_id_counter", inc_field: "userId" }
      ]
    ]
  };
};

// create: req => {
//   const doc = req.body;
//   return (
//     Promise.all([
//       pie.db.models.tool.aggregateSkipDelete([
//         {
//           $match: {
//             $expr: {
//               $eq: ["$_id", toObjectId(doc.learningTool)]
//             }
//           }
//         },

//         {
//           $lookup: {
//             from: pie.db.models.company.collection.collectionName,
//             let: { companyId: "$innovatorId" },
//             // foreignField: "_id",
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $eq: ["$$companyId", "$_id"]
//                   }
//                 }
//               },
//               {
//                 $project: {
//                   stripeCustomerId: 1
//                 }
//               }
//             ],
//             as: "companyDetails"
//           }
//         },
//         {
//           $match: {
//             $expr: {
//               $gt: [{ $size: "$companyDetails" }, 0]
//             }
//           }
//         },
//         {
//           $unwind: "$companyDetails"
//         }
//       ]),
//       pie.db.models.toolpilot.aggregateSkipDelete([
//         {
//           $match: {
//             $expr: {
//               $and: [
//                 { $eq: ["$learningTool", toObjectId(doc.learningTool)] },
//                 { $eq: ["$status", "pending"] }
//               ]
//             }
//           }
//         } //5f9a4e0cff40e13413558171
//       ])
//     ])
//       .then(([company, pilots]) => {
//         if (company.length === 0) {
//           return Promise.reject({
//             status: 400,
//             message: "Company corresponding to selected tool not found"
//           });
//         } else if (
//           !company[0].companyDetails.stripeCustomerId &&
//           pilots.length >= 10
//         ) {
//           return Promise.reject({
//             status: 400,
//             message: "Free innovators can only have 10 pilots"
//           });
//         } else {
//           return Promise.all([company[0], pilots.length]);
//         }
//       })
//       // .then(company => {
//       //   if (company.stripeCustomerId) {
//       //     return company;
//       //   } else {
//       //     return company.createStripeCustomer();
//       //   }
//       // })
//       .then(([company, pilots]) => {
//         return Promise.all([
//           pie.services.stripe.listSubscription({
//             customer: company.stripeCustomerId
//           }),
//           pilots
//         ]);
//       })
//       .then(([subs, pilots]) => {
//         let sub = null;
//         if (subs && subs.data) {
//           sub = subs.data.reduce((t, c) => {
//             if (!t.created || c.created > t.created) {
//               return c;
//             }
//           }, {});
//         }
//         if (!sub && pilots >= 10) {
//           return Promise.reject({
//             status: 400,
//             message: "Free innovators can only have 10 pilots"
//           });
//         }
//         return Promise.resolve(sub);
//       })
//       .then(() => {
//         return new pie.db.models.toolpilot({
//           ...doc
//         })
//           .save()
//           .then(pilot => {
//             pie.db.models.tool
//               .findById(pilot.learningTool)
//               .then(tool => {
//                 return pie.db.models.notifications.pushNotifications({
//                   context: "toolpilot_create",
//                   subject: "tool",
//                   subjectId: tool._id,
//                   source: {
//                     userType: "school",
//                     userId: pilot.schoolId
//                   },
//                   destination: {
//                     userType: "innovator",
//                     userId: tool.innovatorId
//                   }
//                 });
//               })
//               .then(() => pie.log("notifications created"));

//             return pilot;
//           });
//       })
//   );
// },

//pitch
// create: req => {
//   return req.user
//     .getMoreDetails()
//     .then(user => {
//       if (user.company && user.company._id) {
//         return Promise.all([
//           user,
//           pie.db.models.company.findById(user.company._id),
//           pie.db.models.pitch.aggregateSkipDelete([
//             {
//               $match: {
//                 $expr: {
//                   $eq: ["$userId", req.user._id]
//                 }
//               }
//             }
//           ])
//         ]);
//       } else {
//         return Promise.reject({
//           message: "Only company allowed",
//           status: 400
//         });
//       }
//     })
//     .then(([user, company, pitches]) => {
//       if (!company.stripeCustomerId && pitches.length >= 5) {
//         return Promise.reject({
//           message: "Free innovators cannot create more than 5 pitches.",
//           status: 400
//         });
//       } else {
//         return Promise.all([user, company, pitches.length]);
//       }
//     })
//     .then(([user, company, pitches]) => {
//       return Promise.all([
//         user,
//         pie.services.stripe.listSubscription({
//           customer: company.stripeCustomerId
//         }),
//         pitches
//       ]);
//     })
//     .then(([user, subs, pitches]) => {
//       let sub = null;
//       if (subs && subs.data) {
//         sub = subs.data.reduce((t, c) => {
//           if (!t.created || c.created > t.created) {
//             return c;
//           }
//         }, {});
//       }
//       if (!sub && pitches >= 5) {
//         return Promise.reject({
//           status: 400,
//           message: "Free innovators cannot create more than 5 pitches."
//         });
//       }
//       return Promise.resolve(user);
//     })
//     .then(user => {
//       return Promise.all([
//         user,
//         new pie.db.models.pitch({
//           ...req.body,
//           userId: req.user._id
//         }).save()
//       ]);
//     })
//     .then(([user, pitch]) => {
//       pie.db.models.tool
//         .findById(pitch.tool)
//         .then(tool => {
//           return pie.db.models.notifications.pushNotifications({
//             context: "tool_proposal",
//             subject: "tool",
//             subjectId: tool._id,
//             source: {
//               userType: "innovator",
//               userId: user.company._id
//             },
//             destination: {
//               userType: "school",
//               userId: pitch.school
//             }
//           });
//         })
//         .then(() => pie.log("notifications created"));
//       return pitch;
//     });
// },

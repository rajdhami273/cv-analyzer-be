const ejs = require("ejs");

module.exports = {
  get: (req) => {},

  getAllMessagesInMessenger: (req) => {
    const { userTypeId, type } = req.params;
    // pie.log(userTypeId);
    if (!userTypeId) {
      return [];
    }
    return pie.db.models.messenger.aggregateSkipDelete([
      {
        $match: {
          $expr: {
            $or: [
              {
                $eq: ["$employer", pie.services.util.toObjectId(userTypeId)],
              },
              {
                $eq: ["$candidate", pie.services.util.toObjectId(userTypeId)],
              },
            ],
          },
        },
      },
      {
        $match: {
          $expr: {
            $not: {
              $in: [pie.services.util.toObjectId(req.user._id), "$deletedBy"],
            },
          },
        },
      },
      {
        $match:
          type == "trash"
            ? {
                $expr: {
                  $in: [req.user._id, "$trashedBy"],
                },
              }
            : {
                $expr: {
                  $not: [{ $in: [req.user._id, "$trashedBy"] }],
                },
              },
      },
      {
        $lookup: {
          from: pie.db.models.user.collection.collectionName,
          localField: "employer",
          foreignField: "_id",
          as: "employerDetails",
        },
      },
      {
        $unwind: "$employerDetails",
      },
      {
        $lookup: {
          from: pie.db.models.user.collection.collectionName,
          localField: "candidate",
          foreignField: "_id",
          as: "candidateDetails",
        },
      },
      {
        $unwind: "$candidateDetails",
      },
      {
        $addFields: {
          unreadMessages: {
            $reduce: {
              input: "$conversations",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $cond: [{ $in: [req.user._id, "$$this.readBy"] }, 0, 1],
                  },
                ],
              },
            },
          },
          lastMessageTime: { $arrayElemAt: ["$conversations.time", -1] },
        },
      },
      {
        $sort: {
          lastMessageTime: -1,
        },
      },
    ]);
  },

  getMessages: (req) => {
    const { application, candidate, employer } = req.body;
    return pie.db.models.messenger.findOne({
      application,
      candidate,
      employer,
    });
  },

  addMessage: (req) => {
    const { application, candidate, employer, messageDoc, userType } = req.body;
    return pie.db.models.messenger
      .findOne({ application, candidate, employer })
      .then((doc) => {
        if (!doc) {
          if (userType == "candidate") {
            return Promise.reject({
              status: 400,
              message: "Candidate not allowed to initiate conversation.",
            });
          }
          return new pie.db.models.messenger({
            application,
            candidate,
            employer,
            conversations: [
              { ...messageDoc, sentBy: req.user._id, readBy: [req.user._id] },
            ],
          }).save();
        } else {
          return pie.db.models.messenger.findOneAndUpdate(
            {
              application,
              candidate,
              employer,
            },
            {
              $push: {
                conversations: {
                  ...messageDoc,
                  sentBy: req.user._id,
                  readBy: [req.user._id],
                },
              },
            },
            { new: true }
          );
        }
      });
    // .then((d) => {
    //   const oppUserType = userType == "candidate" ? "employer" : "candidate";
    //   pie.db.models[oppUserType]
    //     .aggregateSkipDelete([
    //       {
    //         $match: {
    //           $expr: {
    //             $or: [
    //               { $eq: ["$_id", pie.services.util.toObjectId(employer)] },
    //               { $eq: ["$_id", pie.services.util.toObjectId(candidate)] },
    //             ],
    //           },
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: pie.db.models.user.collection.collectionName,
    //           let: { userId: "$userId", employerAdmin: "$employerAdmin" },
    //           pipeline: [
    //             {
    //               $match: {
    //                 $expr: {
    //                   $or: [
    //                     { $eq: ["$_id", "$$userId"] },
    //                     { $eq: ["$_id", "$$employerAdmin"] },
    //                   ],
    //                 },
    //               },
    //             },
    //           ],
    //           as: "user",
    //         },
    //       },
    //       {
    //         $unwind: "$user",
    //       },
    //       {
    //         $match: {
    //           $expr: {
    //             $ne: ["$user._id", req.user._id], //pie.services.util.toObjectId(user._id)
    //           },
    //         },
    //       },
    //     ])
    //     .then((users) => {
    //       let emails = users.map((item) => item.user.email).join(",");
    //       pie.log(emails);

    //       return pie.db.models.emailtemplate
    //         .findById("600a77e850f6a23dfc33ed64")
    //         .then((doc) => {
    //           pie.services.mailer.sendMail({
    //             to: "raazthemystery273@gmail.com," + emails,
    //             subject: "New message",
    //             html: ejs.render(doc.template, {
    //               heading: "New message",
    //               subHeading: "New message recieved",
    //               text: "Click the button below to see the new message",
    //               viewMessageLink:
    //                 "http://localhost:3000/home/messenger/" + d._id,
    //               viewMessageButtonText: "View Message",
    //             }),
    //           });
    //         })
    //         .then((d) => pie.log(d))
    //         .catch((err) => pie.log(err));
    //     });
    //   return d;
    // });
    // viewMessageLink viewMessageButtonText
  },

  toTrash: (req) => {
    return pie.db.models.messenger.findByIdAndUpdate(
      req.params.messageId,
      {
        $push: { trashedBy: req.user._id },
      },
      { new: true }
    );
  },
  deleteMessage: (req) => {
    return pie.db.models.messenger.findByIdAndUpdate(req.params.messageId, {
      $push: { deletedBy: req.user._id },
    });
  },

  getCurrentAndMarkAsRead: (req) => {
    return pie.db.models.messenger
      .findById(req.params.id)
      .then((doc) => {
        if (doc) {
          for (let convo of doc.conversations) {
            if (convo.readBy.indexOf(req.user._id) == -1) {
              convo.readBy.push(req.user._id);
            }
          }
          return doc.save();
        } else {
          return Promise.reject({ status: 404, message: "Not found    it" });
        }
      })
      .then((doc) =>
        pie.db.models.messenger.aggregateSkipDelete([
          {
            $match: {
              $expr: {
                $eq: ["$_id", pie.services.util.toObjectId(doc._id)],
              },
            },
          },
          {
            $lookup: {
              from: pie.db.models.user.collection.collectionName,
              localField: "employer",
              foreignField: "_id",
              as: "employerDetails",
            },
          },
          {
            $unwind: "$employerDetails",
          },
          {
            $lookup: {
              from: pie.db.models.user.collection.collectionName,
              localField: "candidate",
              foreignField: "_id",
              as: "candidateDetails",
            },
          },
          {
            $unwind: "$candidateDetails",
          },
        ])
      )
      .then((doc) => {
        if (doc.length) {
          return doc[0];
        }
      });
  },
};

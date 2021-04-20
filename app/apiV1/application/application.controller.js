const { filterObject, toObjectId, model } = pie.services.util;
const models = pie.models;
module.exports = {
  apply: req => {
    const doc = req.body;
    return new models.application({
      user: req.user._id,
      ...doc
    }).save();
  },
  getUserSpecific: req => {
    return models.application.aggregateSkipDelete([
      {
        $match: {
          $expr: {
            $eq: ["$user", req.user._id]
          }
        }
      },
      {
        $lookup: {
          from: pie.db.models.job.collection.collectionName,
          localField: "job",
          foreignField: "_id",
          as: "jobDetails"
        }
      },
      {
        $match: {
          $expr: {
            $gt: [{ $size: "$jobDetails" }, 0]
          }
        }
      },
      {
        $unwind: "$jobDetails"
      }
    ]);
  },
  get: req => {
    return models.application
      .aggregateSkipDelete([
        {
          $match: {
            $expr: {
              $eq: ["$_id", toObjectId(req.params.applicationId)]
            }
          }
        },
        {
          $lookup: {
            from: pie.db.models.job.collection.collectionName,
            localField: "job",
            foreignField: "_id",
            as: "jobDetails"
          }
        },
        {
          $match: {
            $expr: {
              $gt: [{ $size: "$jobDetails" }, 0]
            }
          }
        },
        {
          $unwind: "$jobDetails"
        }
      ])
      .then(d => {
        if (d.length) {
          return d[0];
        }
      });
  },
  getForJob: req => {
    return models.application.aggregateSkipDelete([
      {
        $match: {
          $expr: {
            $eq: ["$job", toObjectId(req.params.jobId)]
          }
        }
      },
      {
        $lookup: {
          from: pie.db.models.job.collection.collectionName,
          localField: "job",
          foreignField: "_id",
          as: "jobDetails"
        }
      },
      {
        $match: {
          $expr: {
            $gt: [{ $size: "$jobDetails" }, 0]
          }
        }
      },
      {
        $unwind: "$jobDetails"
      },
      {
        $addField: {
          aggregate: {
            $divide: [
              {
                $sum: [
                  "$aptitudeGrade",
                  "$personalityGrade",
                  "$skillsGrade",
                  "$experienceGrade"
                ]
              },
              400
            ]
          }
        }
      },
      {
        $sort: "$aggregate"
      }
    ]);
    // .then(d => {
    //   if (d.length) {
    //     return d[0];
    //   }
    // });
  },
  changeStatus: req => {
    return pie.db.models.application.findByIdAndUpdate(
      req.params.applicationId,
      { status: req.body.status },
      { new: true }
    );
  }
};

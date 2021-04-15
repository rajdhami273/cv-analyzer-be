module.exports = {
  getAll: req => {
    return pie.db.models.job.aggregateSkipDelete();
  },
  get: req => {
    return pie.db.models.job
      .aggregateSkipDelete([
        {
          $match: {
            $expr: {
              $eq: ["$_id", pie.services.util.toObjectId(req.params.jobId)]
            }
          }
        },
        {
          $lookup: {
            from: pie.db.models.application.collection.collectionName,
            let: { job: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$$job", "$job"] },
                      { $eq: ["$user", req.user._id] }
                    ]
                  }
                }
              }
            ],
            as: "myApplication"
          }
        },
        {
          $addFields: {
            myApplication: {
              $cond: [
                { $gt: [{ $size: "$myApplication" }, 0] },
                "$myApplication",
                [null]
              ]
            }
          }
        },
        {
          $unwind: "$myApplication"
        }
      ])
      .then(d => {
        if (d.length) return d[0];
      });
  },
  create: req => {
    return new pie.db.models.job({
      /*user: req.user._id,*/ ...req.body
    }).save();
  },
  update: req => {
    return pie.db.models.job.findByIdAndUpdate(req.params.jobId, req.body, {
      new: true
    });
  }
};

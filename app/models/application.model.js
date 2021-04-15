module.exports = connection => {
  return {
    schema: {
      user: {
        type: pie.Types.ObjectId,
        ref: "user",
        required: true
      },
      job: {
        type: pie.Types.ObjectId,
        ref: "job",
        required: true
      },
      email: {
        type: String,
        required: true
      },
      experience: {
        type: Number,
        default: 0
      },
      desiredLocation: {
        type: String,
        default: ""
      },
      aptitudeQuestions: {
        type: [],
        default: []
      },
      personalityQuestions: {
        type: [],
        default: []
      },
      aptitudeGrade: {
        type: Number,
        default: 0
      },
      personalityGrade: {
        type: Number,
        default: 0
      },
      skillsGrade: {
        type: Number,
        default: 0
      },
      experienceGrade: {
        type: Number,
        default: 0
      },
      status: {
        type: String,
        enum: ["pending", "viewed", "accepted", "rejected"],
        default: "pending"
      }
    },
    options: {
      timestamps: true
    }
  };
};
